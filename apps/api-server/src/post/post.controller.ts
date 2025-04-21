import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { GetPostsRequestDto } from './dto/get-posts-request.dto';
import {
  CurrencyType,
  GetPostsResponseDto,
} from './dto/get-posts-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErrorResponse } from '../common/error-response';

@ApiTags('게시글')
@ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
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
          title: '게시글 1',
          createdAt: '2023-06-15T09:30:00.000Z',
          universityName: '서울대학교',
          thumbnailUrl: 'https://example.com/images/post1.jpg',
          price: 15000,
          currencyType: CurrencyType.KRW,
          likeCount: 24,
          commentCount: 5,
        },
        {
          id: 2,
          title: '게시글 2',
          createdAt: '2023-06-15T09:30:00.000Z',
          universityName: '서울대학교',
          thumbnailUrl: 'https://example.com/images/post2.jpg',
          price: 15000,
          currencyType: CurrencyType.USD,
          likeCount: 24,
          commentCount: 5,
        },
        {
          id: 3,
          title: '게시글 3',
          createdAt: '2023-06-15T09:30:00.000Z',
          universityName: '서울대학교',
          thumbnailUrl: 'https://example.com/images/post3.jpg',
          price: 15000,
          currencyType: CurrencyType.USD,
          likeCount: 24,
          commentCount: 5,
        },
      ],
      false,
    );
  }
}
