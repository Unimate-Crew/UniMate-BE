import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  HttpCode,
  Delete,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SortDirection } from '@app/database/common/enums';
import { Slice, PageRequest } from '@app/common';
import { JwtAuthGuard, UserTokenInfo, CurrentUser } from '@app/auth';
import { ProductPostService } from '../application/product-post.service';
import { FindPagedProductPostsRequestDto } from './dto/find-paged-product-posts.request.dto';
import { FindPagedProductPostsResponseDto } from './dto/find-paged-product-posts.response.dto';
import { ErrorResponse } from '../../common/error-response';
import { SearchProductPostsRequestDto } from './dto/search-product-posts.request.dto';
import { CreateProductPostRequestDto } from './dto/create-product-post.request.dto';
import { GeneratePresignedUrlListRequestDto } from './dto/generate-presigned-url-list.request.dto';
import { GeneratePresignedUrlListResponseDto } from './dto/generate-presigned-url-list.response.dto';
import { ProductPostResultDto } from '../application/dto/product-post.result.dto';
import { FindCategoriesRequestDto } from './dto/find-categories.request.dto';
import { FindCategoriesResponseDto } from './dto/find-categories.response.dto';
import { ProductCategoryResultDto } from '../application/dto/Product-category.result.dto';
import { UpdateProductPostRequestDto } from './dto/update-product-post.request.dto';
import { UpdateProductPostResponseDto } from './dto/update-product-post.response.dto';
import { FindProductPostDetailResponseDto } from './dto/find-product-post-detail.response.dto';
import { ProductPostDetailResultDto } from '../application/dto/product-post-detail.result.dto';
import { CreateProductPostResponseDto } from './dto/create-product-post.response.dto';

import { FindMySalesRequestDto } from './dto/find-my-sales.request.dto';
import { FindMySalesResponseDto } from './dto/find-my-sales.response.dto';
import { FindUserSalesRequestDto } from './dto/find-user-sales.request.dto';
import { FindUserSalesResponseDto } from './dto/find-user-sales.response.dto';
import { FindMyLikesRequestDto } from './dto/find-my-likes.request.dto';
import { FindMyLikesResponseDto } from './dto/find-my-likes.response.dto';
import { UpdateTradeStatusRequestDto } from './dto/update-trade-status.request.dto';
import { GetTradableUsersResponseDto } from './dto/get-tradable-users.response.dto';
import { GetTradeProgressResponseDto } from './dto/get-trade-progress.response.dto';
import { TradableUserResultDto } from '../application/dto/tradable-user.result.dto';
import { TradeProgressResultDto } from '../application/dto/trade-progress.result.dto';

@ApiTags('상품 게시글')
@Controller({ path: 'product-posts' })
export class ProductPostController {
  constructor(private readonly productPostService: ProductPostService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
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
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<FindPagedProductPostsResponseDto> {
    const productPostInfoSlice: Slice<ProductPostResultDto> =
      await this.productPostService.findPagedProductPosts({
        pageRequest: PageRequest.of(query.getPageNumber(), query.getPageSize()),
        regionId: query.regionId,
        userId: userTokenInfo.userId,
      });

    return FindPagedProductPostsResponseDto.of(productPostInfoSlice);
  }

  @Get('/search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
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
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<FindPagedProductPostsResponseDto> {
    const productPostInfoSlice: Slice<ProductPostResultDto> =
      await this.productPostService.searchProductPosts({
        pageRequest: PageRequest.of(query.getPageNumber(), query.getPageSize()),
        searchKeyword: query.searchKeyword,
        universityId: query.universityId,
        currencyType: query.currencyType,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        category: query.category,
        tradeStatus: query.tradeStatus,
        sortDirection: query.sortDirection || SortDirection.DESC,
        regionId: query.regionId,
        userId: userTokenInfo.userId,
      });

    return FindPagedProductPostsResponseDto.of(productPostInfoSlice);
  }

  @Get('/my/sales')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '나의 판매내역 목록 조회 API' })
  @ApiResponse({
    status: 200,
    description: '나의 판매내역 목록 조회 성공',
    type: FindMySalesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  async findMySales(
    @Query() query: FindMySalesRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<FindMySalesResponseDto> {
    const productPostInfoSlice: Slice<ProductPostResultDto> =
      await this.productPostService.findMySales({
        pageRequest: PageRequest.of(query.getPageNumber(), query.getPageSize()),
        userId: userTokenInfo.userId,
        mySalesFilter: query.mySalesFilter,
      });

    return FindMySalesResponseDto.of(productPostInfoSlice);
  }

  @Get('/user/:userId/sales')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '다른 유저의 판매내역 목록 조회 API' })
  @ApiResponse({
    status: 200,
    description: '다른 유저의 판매내역 목록 조회 성공',
    type: FindUserSalesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '유저를 찾을 수 없음',
    type: ErrorResponse,
  })
  async findUserSales(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: FindUserSalesRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<FindUserSalesResponseDto> {
    const productPostInfoSlice: Slice<ProductPostResultDto> =
      await this.productPostService.findUserSales({
        pageRequest: PageRequest.of(query.getPageNumber(), query.getPageSize()),
        userId,
        currentUserId: userTokenInfo.userId,
        userSalesFilter: query.userSalesFilter,
      });

    return FindUserSalesResponseDto.of(productPostInfoSlice);
  }

  @Get('/my/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '내가 찜한 상품게시글 목록 조회 API' })
  @ApiResponse({
    status: 200,
    description: '내가 찜한 상품게시글 목록 조회 성공',
    type: FindMyLikesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  async findMyLikes(
    @Query() query: FindMyLikesRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<FindMyLikesResponseDto> {
    const productPostInfoSlice: Slice<ProductPostResultDto> =
      await this.productPostService.findMyLikes({
        pageRequest: PageRequest.of(query.getPageNumber(), query.getPageSize()),
        userId: userTokenInfo.userId,
      });

    return FindMyLikesResponseDto.of(productPostInfoSlice);
  }

  @Patch('/:id/hide')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '상품 게시글 숨기기 API',
    description:
      '상품 게시글을 숨김 처리합니다. 숨김 처리된 게시글은 다른 사람들에게 조회되지 않습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상품 게시글 숨기기 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인이 작성한 게시글만 숨길 수 있음)',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'PP003',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '본인이 작성한 상품 게시글만 숨길 수 있습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 숨김 처리된 게시글 또는 예약중인 게시글',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'PP005',
          description:
            '에러 코드 (PP005: 이미 숨김 처리됨, PP007: 예약중인 게시글)',
        },
        message: {
          type: 'string',
          example: '이미 숨김 처리된 상품 게시글입니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  async hideProductPost(
    @Param('id', ParseIntPipe) productPostId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.productPostService.hideProductPost({
      productPostId,
      userId: userTokenInfo.userId,
    });
  }

  @Patch('/:id/unhide')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '상품 게시글 숨김 해제 API',
    description: '숨김 처리된 상품 게시글의 숨김을 해제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상품 게시글 숨김 해제 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인이 작성한 게시글만 숨김 해제할 수 있음)',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'PP003',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '본인이 작성한 상품 게시글만 숨김 해제할 수 있습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '상품 게시글을 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'PP001',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '상품 게시글을 찾을 수 없습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '숨김 처리되지 않은 게시글',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'PP006',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '숨김 처리되지 않은 상품 게시글입니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  async unhideProductPost(
    @Param('id', ParseIntPipe) productPostId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.productPostService.unhideProductPost({
      productPostId,
      userId: userTokenInfo.userId,
    });
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '상품 게시글 삭제 API',
    description: '상품 게시글을 삭제합니다.',
  })
  @ApiResponse({
    status: 204,
    description: '상품 게시글 삭제 성공',
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인이 작성한 게시글만 삭제 가능)',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'PP003', description: '에러 코드' },
        message: {
          type: 'string',
          example: '본인이 작성한 상품 게시글만 삭제할 수 있습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '상품 게시글을 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'PP001', description: '에러 코드' },
        message: {
          type: 'string',
          example: '상품 게시글을 찾을 수 없습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  async deleteProductPost(
    @Param('id', ParseIntPipe) productPostId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.productPostService.deleteProductPost({
      productPostId,
      userId: userTokenInfo.userId,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '상품 게시글 생성' })
  @ApiResponse({
    status: 201,
    description: '상품 게시글 생성 성공',
    type: CreateProductPostResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  async createProductPost(
    @Body() createProductPostDto: CreateProductPostRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<CreateProductPostResponseDto> {
    const productPostId: number =
      await this.productPostService.createProductPost({
        title: createProductPostDto.title,
        imageKeys: createProductPostDto.imageKeys,
        category: createProductPostDto.category,
        price: createProductPostDto.price,
        currencyType: createProductPostDto.currencyType,
        description: createProductPostDto.description,
        tradeType: createProductPostDto.tradeType,
        tradeTypeDescription: createProductPostDto.tradeTypeDescription,
        userId: userTokenInfo.userId,
      });

    return CreateProductPostResponseDto.of(productPostId);
  }

  @Post('/presigned-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
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
      generatePresignedUrlListRequestDto.fileNames,
    );

    return GeneratePresignedUrlListResponseDto.of(urlList);
  }

  @Get('/categories')
  @ApiOperation({
    summary: '상품 카테고리 목록 조회 API',
    description:
      '모든 상품 카테고리와 각 카테고리별 상품 게시글 개수를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상품 카테고리 목록 조회 성공',
    type: FindCategoriesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  async findCategories(
    @Query() query: FindCategoriesRequestDto,
  ): Promise<FindCategoriesResponseDto> {
    const productCategoryInfos: ProductCategoryResultDto[] =
      await this.productPostService.findCategories(query.regionId);

    return FindCategoriesResponseDto.of(productCategoryInfos);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '상품 게시글 수정 API',
    description: '상품 게시글의 정보를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '상품 게시글 수정 성공',
    type: UpdateProductPostResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인이 작성한 게시글만 수정 가능)',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'P002',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '본인이 작성한 상품 게시글만 수정할 수 있습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '상품 게시글을 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'P001',
          description: '에러 코드 (P001: 게시글 없음, P003: 삭제된 게시글)',
        },
        message: {
          type: 'string',
          example: '상품 게시글을 찾을 수 없습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  async updateProductPost(
    @Param('id', ParseIntPipe) productPostId: number,
    @Body() updateProductPostRequestDto: UpdateProductPostRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<UpdateProductPostResponseDto> {
    const updatedProductPostId: number =
      await this.productPostService.updateProductPost({
        productPostId,
        userId: userTokenInfo.userId,
        title: updateProductPostRequestDto.title,
        imageKeys: updateProductPostRequestDto.imageKeys,
        category: updateProductPostRequestDto.category,
        price: updateProductPostRequestDto.price,
        currencyType: updateProductPostRequestDto.currencyType,
        description: updateProductPostRequestDto.description,
        tradeType: updateProductPostRequestDto.tradeType,
        tradeTypeDescription: updateProductPostRequestDto.tradeTypeDescription,
      });

    return UpdateProductPostResponseDto.of(updatedProductPostId);
  }

  @Post('/:id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '상품 게시글 찜 API',
    description: '해당 상품 게시글을 찜합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '찜 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 409,
    description: '이미 찜한 게시글',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'PP004',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '이미 찜한 상품 게시글입니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '상품 게시글을 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'PP001',
          description: '게시글 없음',
        },
        message: {
          type: 'string',
          example: '상품 게시글을 찾을 수 없습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  async likeProductPost(
    @Param('id', ParseIntPipe) productPostId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.productPostService.likeProductPost({
      productPostId,
      userId: userTokenInfo.userId,
    });
  }

  @Delete('/:id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '상품 게시글 찜 취소 API',
    description: '상품 게시글에 대한 찜을 취소합니다.',
  })
  @ApiResponse({
    status: 204,
    description: '찜 취소 성공',
  })
  async unlikeProductPost(
    @Param('id', ParseIntPipe) productPostId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.productPostService.unlikeProductPost({
      productPostId,
      userId: userTokenInfo.userId,
    });
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '상품 게시글 상세 조회 API' })
  @ApiResponse({
    status: 200,
    description: '상품 게시글 상세 조회 성공',
    type: FindProductPostDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '상품 게시글을 찾을 수 없음',
    type: ErrorResponse,
  })
  async findProductPostDetail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<FindProductPostDetailResponseDto> {
    const productPostDetail: ProductPostDetailResultDto =
      await this.productPostService.findProductPostDetail({
        productPostId: id,
        userId: userTokenInfo.userId,
      });

    return FindProductPostDetailResponseDto.from(productPostDetail);
  }

  @Patch('/:id/trade-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '상품 거래 상태 변경 API',
    description: '상품의 거래 상태를 변경합니다 (판매중 → 예약중 → 거래완료).',
  })
  @ApiResponse({
    status: 204,
    description: '거래 상태 변경 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (구매자 ID/채팅방 ID 누락, 잘못된 상태 전환 등)',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (본인이 작성한 게시글만 상태 변경 가능)',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '상품 게시글을 찾을 수 없음',
    type: ErrorResponse,
  })
  async updateTradeStatus(
    @Param('id', ParseIntPipe) productPostId: number,
    @Body() updateTradeStatusDto: UpdateTradeStatusRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.productPostService.updateTradeStatus({
      productPostId,
      userId: userTokenInfo.userId,
      tradeStatus: updateTradeStatusDto.tradeStatus,
      buyerId: updateTradeStatusDto.buyerId,
      conversationId: updateTradeStatusDto.conversationId,
    });
  }

  @Get('/:id/tradable-users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '거래 가능한 사용자 목록 조회 API',
    description:
      '상품 관련 현재 채팅 중인 사용자 목록을 조회합니다 (최신 대화순 정렬).',
  })
  @ApiResponse({
    status: 200,
    description: '거래 가능한 사용자 목록 조회 성공',
    type: GetTradableUsersResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  async getTradableUsers(
    @Param('id', ParseIntPipe) productPostId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<GetTradableUsersResponseDto> {
    const tradableUsers: TradableUserResultDto[] =
      await this.productPostService.getTradableUsers({
        productPostId,
        userId: userTokenInfo.userId,
      });

    return GetTradableUsersResponseDto.of(tradableUsers);
  }

  @Get('/:id/trade-progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '거래 진행 현황 조회 API',
    description: '상품의 현재 거래 진행 현황 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '거래 진행 현황 조회 성공',
    type: GetTradeProgressResponseDto,
  })
  @ApiResponse({
    status: 204,
    description: '진행 중인 거래 없음',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  async getTradeProgress(
    @Param('id', ParseIntPipe) productPostId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<GetTradeProgressResponseDto | null> {
    const tradeProgress: TradeProgressResultDto | null =
      await this.productPostService.getTradeProgress({
        productPostId,
        userId: userTokenInfo.userId,
      });

    if (!tradeProgress) {
      return null;
    }

    return GetTradeProgressResponseDto.of(tradeProgress);
  }
}
