import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CurrencyType,
  SortDirection,
  TradeStatus,
} from '@app/database/common/enums';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { ProductPostService } from './product-post.service';
import { GetProductPostsRequestDto } from './dto/get-product-posts-request.dto';
import { GetProductPostsResponseDto } from './dto/get-product-posts-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErrorResponse } from '../common/error-response';
import { SearchProductPostsRequestDto } from './dto/search-product-posts-request.dto';
import { CreateProductPostDto } from './dto/create-product-post.dto';
import { GetUserTokenInfo } from '../common/decorators/get-user-token-info.decorator';
import { UserTokenInfo } from '../common/types/user-token-info';

@ApiTags('상품 게시글')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'product-posts',
  version: '1',
})
export class ProductPostController {
  constructor(private readonly productPostService: ProductPostService) {}

  @Get()
  @ApiOperation({ summary: '상품 게시글 목록 조회 API' })
  @ApiResponse({
    status: 200,
    description: '상품 게시글 목록 조회 성공',
    type: GetProductPostsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  async getProductPosts(
    @Query() query: GetProductPostsRequestDto,
  ): Promise<GetProductPostsResponseDto> {
    const { pageNumber = 1, pageSize = 10, regionId } = query;

    // 모의 데이터 대신 실제 서비스 호출
    // const { content, hasNext } = await this.productPostService.getProductPosts(
    //   pageNumber,
    //   pageSize,
    //   regionId,
    // );

    return GetProductPostsResponseDto.of(
      [
        {
          id: 1,
          title: '메사추세츠 여행 가이드북 팝니다',
          createdAt: '2023-06-15T09:30:00.000Z',
          universityName: 'Harvard University',
          thumbnailUrl: 'https://example.com/images/product-post1.jpg',
          price: 15000,
          currencyType: CurrencyType.KRW,
          likeCount: 24,
          commentCount: 5,
          regionId: '1',
          regionName: 'Massachusetts',
          tradeStatus: TradeStatus.FOR_SALE,
        },
        {
          id: 2,
          title: '전자레인지 팝니다',
          createdAt: '2023-06-14T10:45:00.000Z',
          universityName: 'Massachusetts Institute of Technology',
          thumbnailUrl: 'https://example.com/images/product-post2.jpg',
          price: 30000,
          currencyType: CurrencyType.KRW,
          likeCount: 15,
          commentCount: 3,
          regionId: '2',
          regionName: 'Massachusetts',
          tradeStatus: TradeStatus.RESERVED,
        },
        {
          id: 3,
          title: '뉴욕 여행 가이드북 팝니다',
          createdAt: '2023-06-13T11:20:00.000Z',
          universityName: 'Cornell University',
          thumbnailUrl: 'https://example.com/images/product-post3.jpg',
          price: 50,
          currencyType: CurrencyType.USD,
          likeCount: 32,
          commentCount: 8,
          regionId: '3',
          regionName: 'New York',
          tradeStatus: TradeStatus.FOR_SALE,
        },
        {
          id: 4,
          title: '냉장고 삽니다',
          createdAt: '2023-06-12T13:15:00.000Z',
          universityName: 'Yale University',
          thumbnailUrl: 'https://example.com/images/product-post4.jpg',
          price: 10000,
          currencyType: CurrencyType.KRW,
          likeCount: 41,
          commentCount: 12,
          regionId: '4',
          regionName: 'New York',
          tradeStatus: TradeStatus.COMPLETED,
        },
        {
          id: 5,
          title: '소파 팝니다',
          createdAt: '2023-06-11T14:30:00.000Z',
          universityName: 'Princeton University',
          thumbnailUrl: 'https://example.com/images/product-post5.jpg',
          price: 200000,
          currencyType: CurrencyType.KRW,
          likeCount: 19,
          commentCount: 4,
          regionId: '5',
          regionName: 'New York',
          tradeStatus: TradeStatus.FOR_SALE,
        },
      ],
      false,
    );
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
    type: GetProductPostsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  async searchProductPosts(
    @Query() query: SearchProductPostsRequestDto,
  ): Promise<GetProductPostsResponseDto> {
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

    // 모의 데이터 대신 실제 서비스 호출
    // const { content, hasNext } = await this.productPostService.searchProductPosts(
    //   searchKeyword,
    //   universityId,
    //   currencyType,
    //   minPrice,
    //   maxPrice,
    //   category,
    //   tradeStatus,
    //   sortDirection,
    //   pageNumber,
    //   pageSize,
    //   regionId,
    // );

    // 검색 결과 샘플 데이터 (keyword가 '가이드북'일 경우의 응답)
    return GetProductPostsResponseDto.of(
      [
        {
          id: 1,
          title: '메사추세츠 여행 가이드북 팝니다',
          createdAt: '2023-06-15T09:30:00.000Z',
          universityName: 'Harvard University',
          thumbnailUrl: 'https://example.com/images/product-post1.jpg',
          price: 15000,
          currencyType: CurrencyType.KRW,
          likeCount: 24,
          commentCount: 5,
          regionId: '1',
          regionName: 'Massachusetts',
          tradeStatus: TradeStatus.FOR_SALE,
        },
        {
          id: 3,
          title: '뉴욕 여행 가이드북 팝니다',
          createdAt: '2023-06-13T11:20:00.000Z',
          universityName: 'Cornell University',
          thumbnailUrl: 'https://example.com/images/product-post3.jpg',
          price: 50,
          currencyType: CurrencyType.USD,
          likeCount: 32,
          commentCount: 8,
          regionId: '3',
          regionName: 'New York',
          tradeStatus: TradeStatus.FOR_SALE,
        },
      ],
      false,
    );
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
      createProductPostDto,
      userTokenInfo.userId,
    );

    return { productPostId };
  }
}
