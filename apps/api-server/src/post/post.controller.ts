import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { GetPostsRequestDto } from './dto/get-posts-request.dto';
import { GetPostsResponseDto } from './dto/get-posts-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErrorResponse } from '../common/error-response';
import { SearchPostsRequestDto } from './dto/search-posts-request.dto';
import { CurrencyType, SortDirection, TradeStatus } from '../common/enums';

@ApiTags('게시글')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'posts',
  version: '1',
})
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회 API' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    type: GetPostsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  async getPosts(
    @Query() query: GetPostsRequestDto,
  ): Promise<GetPostsResponseDto> {
    const { pageNumber = 1, pageSize = 10, cityId } = query;

    // 모의 데이터 대신 실제 서비스 호출
    // const { content, hasNext } = await this.postService.getPosts(
    //   pageNumber,
    //   pageSize,
    //   cityId,
    // );

    return GetPostsResponseDto.of(
      [
        {
          id: 1,
          title: '메사추세츠 여행 가이드북 팝니다',
          createdAt: '2023-06-15T09:30:00.000Z',
          universityName: 'Harvard University',
          thumbnailUrl: 'https://example.com/images/post1.jpg',
          price: 15000,
          currencyType: CurrencyType.KRW,
          likeCount: 24,
          commentCount: 5,
          cityId: 1,
          cityName: 'Massachusetts',
          tradeStatus: TradeStatus.FOR_SALE,
        },
        {
          id: 2,
          title: '전자레인지 팝니다',
          createdAt: '2023-06-14T10:45:00.000Z',
          universityName: 'Massachusetts Institute of Technology',
          thumbnailUrl: 'https://example.com/images/post2.jpg',
          price: 30000,
          currencyType: CurrencyType.KRW,
          likeCount: 15,
          commentCount: 3,
          cityId: 2,
          cityName: 'Massachusetts',
          tradeStatus: TradeStatus.RESERVED,
        },
        {
          id: 3,
          title: '뉴욕 여행 가이드북 팝니다',
          createdAt: '2023-06-13T11:20:00.000Z',
          universityName: 'Cornell University',
          thumbnailUrl: 'https://example.com/images/post3.jpg',
          price: 50,
          currencyType: CurrencyType.USD,
          likeCount: 32,
          commentCount: 8,
          cityId: 3,
          cityName: 'New York',
          tradeStatus: TradeStatus.FOR_SALE,
        },
        {
          id: 4,
          title: '냉장고 삽니다',
          createdAt: '2023-06-12T13:15:00.000Z',
          universityName: 'Yale University',
          thumbnailUrl: 'https://example.com/images/post4.jpg',
          price: 10000,
          currencyType: CurrencyType.KRW,
          likeCount: 41,
          commentCount: 12,
          cityId: 4,
          cityName: 'New York',
          tradeStatus: TradeStatus.COMPLETED,
        },
        {
          id: 5,
          title: '소파 팝니다',
          createdAt: '2023-06-11T14:30:00.000Z',
          universityName: 'Princeton University',
          thumbnailUrl: 'https://example.com/images/post5.jpg',
          price: 200000,
          currencyType: CurrencyType.KRW,
          likeCount: 19,
          commentCount: 4,
          cityId: 5,
          cityName: 'New York',
          tradeStatus: TradeStatus.FOR_SALE,
        },
      ],
      false,
    );
  }

  @Get('/search')
  @ApiOperation({
    summary: '게시글 검색 API',
    description:
      '제목 기준으로 키워드 검색, 대학교/가격/카테고리/거래 상태 필터링, 생성일 기준 정렬 기능 제공',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 검색 성공',
    type: GetPostsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  async searchPosts(
    @Query() query: SearchPostsRequestDto,
  ): Promise<GetPostsResponseDto> {
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
      cityId,
    } = query;

    // 모의 데이터 대신 실제 서비스 호출
    // const { content, hasNext } = await this.postService.searchPosts(
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
    //   cityId
    // );

    // 검색 결과 샘플 데이터 (keyword가 '가이드북'일 경우의 응답)
    return GetPostsResponseDto.of(
      [
        {
          id: 1,
          title: '메사추세츠 여행 가이드북 팝니다',
          createdAt: '2023-06-15T09:30:00.000Z',
          universityName: 'Harvard University',
          thumbnailUrl: 'https://example.com/images/post1.jpg',
          price: 15000,
          currencyType: CurrencyType.KRW,
          likeCount: 24,
          commentCount: 5,
          cityId: 1,
          cityName: 'Massachusetts',
          tradeStatus: TradeStatus.FOR_SALE,
        },
        {
          id: 3,
          title: '뉴욕 여행 가이드북 팝니다',
          createdAt: '2023-06-13T11:20:00.000Z',
          universityName: 'Cornell University',
          thumbnailUrl: 'https://example.com/images/post3.jpg',
          price: 50,
          currencyType: CurrencyType.USD,
          likeCount: 32,
          commentCount: 8,
          cityId: 3,
          cityName: 'New York',
          tradeStatus: TradeStatus.FOR_SALE,
        },
      ],
      false,
    );
  }
}
