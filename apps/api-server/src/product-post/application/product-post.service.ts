import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductPostRepository } from '@app/database/entites/product-post/product-post.repository';
import { User } from '@app/database/entites/user/user.entity';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { ProductImageRepository } from '@app/database/entites/product-post/product-image.repository';
import { ProductImage } from '@app/database/entites/product-post/product-image.entity';
import { TradeStatus } from '@app/database/common/enums';
import { Transactional } from '@mikro-orm/core';
import { UserRepository } from '@app/database/entites/user/user.repository';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '@app/common/s3/s3.service';
import { PresignedUrlDto } from '@app/common/dto/presigned-url.dto';
import { LikeRepository } from '@app/database/entites/like/like.repository';
import { Slice } from '@app/common/utils/pagination';
import { ProductPostWithRelations } from '@app/database/entites/product-post/dto/product-post-with-relations.dto';
import { ErrorCode } from '../../common/error-code';
import { CreateProductPostParam } from './dto/create-product-post.param';
import { ProductPostInfo } from './dto/product-post.info';
import { GeneratePresignedUrlParam } from './dto/generate-presigned-url.param';

@Injectable()
export class ProductPostService {
  constructor(
    private readonly productPostRepository: ProductPostRepository,
    private readonly productImageRepository: ProductImageRepository,
    private readonly userRepository: UserRepository,
    private readonly likeRepository: LikeRepository,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 상품 게시글 목록을 페이지네이션하여 조회합니다.
   *
   * @param page 페이지 번호 (1부터 시작)
   * @param limit 페이지 크기
   * @param regionId 지역 ID
   * @returns 페이지네이션된 상품 게시글 목록과 다음 페이지 존재 여부
   */
  async findPagedProductPosts(
    page: number,
    limit: number,
    regionId?: string,
  ): Promise<Slice<ProductPostInfo>> {
    // 1. 상품 목록 조회 (대학교 정보와 썸네일 URL 포함)
    const productPostSlice: Slice<ProductPostWithRelations> =
      await this.productPostRepository.findPagedProductPosts(
        page,
        limit,
        regionId,
      );

    // 2. 상품 ID 목록 추출
    const productIds = productPostSlice.contents.map((post) =>
      post.productPost.getId(),
    );

    // 3. 좋아요 수 조회
    const likeCountMap: Map<number, number> =
      await this.likeRepository.countByProductIds(productIds);

    // 4. ProductPostInfo로 변환
    return productPostSlice.map((post) => {
      return new ProductPostInfo({
        productPost: post.productPost,
        thumbnailUrl: post.thumbnailUrl,
        likeCount: likeCountMap.get(post.productPost.getId()) ?? 0,
        chatRoomCount: 0, // TODO: 채팅방 수 구현
      });
    });
  }

  @Transactional()
  async createProductPost(
    createProductPostParam: CreateProductPostParam,
    userId: number,
  ): Promise<number> {
    const user: User = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        code: ErrorCode.USER_NOT_FOUND,
        message: 'Requested user ID does not match the authenticated user',
      });
    }

    const productPost: ProductPost = this.productPostRepository.create({
      ...createProductPostParam,
      userId,
      tradeStatus: TradeStatus.FOR_SALE,
      universityId: user.getUniversityId(),
    });
    await this.productPostRepository.persistAndFlush(productPost);

    const productImages = createProductPostParam.imageUrls.map(
      (imageUrl, index) => {
        const productImage: ProductImage = this.productImageRepository.create({
          productId: productPost.getId(),
          imageUrl,
          isThumbnail: index === 0,
        });
        return productImage;
      },
    );

    // 3. 이미지들 저장
    await Promise.all(
      productImages.map((productImage) =>
        this.productImageRepository.persistAndFlush(productImage),
      ),
    );

    return productPost.getId();
  }

  async generatePresignedUrlList(
    generatePresignedUrlParam: GeneratePresignedUrlParam,
  ): Promise<PresignedUrlDto[]> {
    return Promise.all(
      generatePresignedUrlParam.fileNames.map(async (fileName) => {
        const key = `${this.configService.get<string>('NODE_ENV', 'development')}/product/${Date.now()}-${fileName}`;
        const presignedUrl = await this.s3Service.generatePresignedUrl(key);

        return PresignedUrlDto.of(presignedUrl, key);
      }),
    );
  }
}
