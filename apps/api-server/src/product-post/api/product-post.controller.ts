import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SortDirection } from '@app/database/common/enums';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { Slice } from '@app/common/utils/pagination';
import { ProductPostService } from '../application/product-post.service';
import { FindPagedProductPostsRequestDto } from './dto/find-paged-product-posts-request.dto';
import { FindPagedProductPostsResponseDto } from './dto/find-paged-product-posts-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ErrorResponse } from '../../common/error-response';
import { SearchProductPostsRequestDto } from './dto/search-product-posts-request.dto';
import { CreateProductPostDto } from './dto/create-product-post.dto';
import { GetUserTokenInfo } from '../../common/decorators/get-user-token-info.decorator';
import { UserTokenInfo } from '../../common/types/user-token-info';
import { GeneratePresignedUrlListRequestDto } from './dto/generate-presigned-url-list-request.dto';
import { GeneratePresignedUrlListResponseDto } from './dto/generate-presigned-url-list-response.dto';
import { ProductPostInfo } from '../application/dto/product-post.info';

@ApiTags('상품 게시글')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller({ path: 'product-posts' })
export class ProductPostController {
  constructor(private readonly productPostService: ProductPostService) {}

  @Get()
  @ApiOperation({ summary: '상품 게시글 목록 조회 API' })
  @ApiResponse({
    status: 200,
    description: '상품 게시글 목록 조회 성공',
    type: FindPagedProductPostsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  async findPagedProductPosts(
    @Query() query: FindPagedProductPostsRequestDto,
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
  ): Promise<FindPagedProductPostsResponseDto> {
    const { pageNumber = 1, pageSize = 10, regionId } = query;

    const productPostInfoSlice: Slice<ProductPostInfo> =
      await this.productPostService.findPagedProductPosts(
        pageNumber,
        pageSize,
        regionId,
        userTokenInfo.userId,
      );

    return FindPagedProductPostsResponseDto.of(productPostInfoSlice);
  }

  @Get('/search')
  @ApiOperation({
    summary: '상품 게시글 검색 API',
    description:
      '제목 기준으로 키워드 검색, 대학교/가격/카테고리/거래 상태 필터링, 생성일 기준 정렬 기능 제공',
  })
  @ApiResponse({
    status: 200,
    description: '상품 게시글 검색 성공',
    type: FindPagedProductPostsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  async searchProductPosts(
    @Query() query: SearchProductPostsRequestDto,
  ): Promise<FindPagedProductPostsResponseDto> {
    const {
      searchKeyword,
      universityId,
      currencyType,
      minPrice,
      maxPrice,
      category,
      tradeStatus,
      sortDirection = SortDirection.DESC,
      pageNumber = 1,
      pageSize = 10,
      regionId,
    } = query;

    // TODO: 실제 서비스 메서드 구현 필요
    const productPostInfoSlice =
      await this.productPostService.findPagedProductPosts(
        pageNumber,
        pageSize,
        regionId,
      );

    return FindPagedProductPostsResponseDto.of(productPostInfoSlice);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '제품 게시글 생성' })
  @ApiResponse({
    status: 201,
    description: '제품 게시글 생성 성공',
    type: ProductPost,
  })
  async createProductPost(
    @Body() createProductPostDto: CreateProductPostDto,
    @GetUserTokenInfo() userTokenInfo: UserTokenInfo,
  ): Promise<{ productPostId: number }> {
    const productPostId = await this.productPostService.createProductPost(
      createProductPostDto.toParam(),
      userTokenInfo.userId,
    );

    return { productPostId };
  }

  @Post('/presigned-url')
  @ApiOperation({ summary: '상품 이미지 업로드를 위한 Presigned URL 발급' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL 발급 성공',
    type: GeneratePresignedUrlListResponseDto,
  })
  async generatePresignedUrlList(
    @Body()
    generatePresignedUrlListRequestDto: GeneratePresignedUrlListRequestDto,
  ): Promise<GeneratePresignedUrlListResponseDto> {
    const urlList = await this.productPostService.generatePresignedUrlList(
      generatePresignedUrlListRequestDto.toParam(),
    );

    return GeneratePresignedUrlListResponseDto.of(urlList);
  }
}
