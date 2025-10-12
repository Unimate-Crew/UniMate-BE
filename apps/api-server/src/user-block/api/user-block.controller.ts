import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard, UserTokenInfo, CurrentUser } from '@app/auth';
import { PageRequest, Slice } from '@app/common';
import { UserBlockService } from '../application/user-block.service';
import { ErrorResponse } from '../../common/error-response';
import { GetBlockedUsersRequestDto } from './dto/get-blocked-users.request.dto';
import { GetBlockedUsersResponseDto } from './dto/get-blocked-users.response.dto';
import { BlockedUserResultDto } from '../application/dto/blocked-user.result.dto';

@ApiTags('유저 차단')
@Controller({ path: 'user-blocks' })
export class UserBlockController {
  constructor(private readonly userBlockService: UserBlockService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '차단한 유저 목록 조회 API',
    description: '내가 차단한 유저 목록을 페이지네이션하여 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '차단한 유저 목록 조회 성공',
    type: GetBlockedUsersResponseDto,
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
  async getBlockedUsers(
    @Query() query: GetBlockedUsersRequestDto,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<GetBlockedUsersResponseDto> {
    const blockedUsersSlice: Slice<BlockedUserResultDto> =
      await this.userBlockService.getBlockedUsers({
        userId: userTokenInfo.userId,
        pageRequest: PageRequest.of(query.getPageNumber(), query.getPageSize()),
      });

    return GetBlockedUsersResponseDto.of(blockedUsersSlice);
  }

  @Post('/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @HttpCode(204)
  @ApiOperation({
    summary: '유저 차단 API',
    description:
      '특정 유저를 차단합니다. 차단된 유저의 게시글은 조회되지 않습니다.',
  })
  @ApiResponse({
    status: 204,
    description: '유저 차단 성공',
  })
  @ApiResponse({
    status: 400,
    description: '본인 차단 불가',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'UB001',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '본인은 차단할 수 없습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '차단할 유저를 찾을 수 없음',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'U001',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '차단할 유저를 찾을 수 없습니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 차단된 유저',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'UB002',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '이미 차단된 유저입니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  async blockUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.userBlockService.blockUser({
      blockerId: userTokenInfo.userId,
      blockedId: userId,
    });
  }

  @Delete('/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessToken')
  @HttpCode(204)
  @ApiOperation({
    summary: '유저 차단 해제 API',
    description: '차단된 유저의 차단을 해제합니다.',
  })
  @ApiResponse({
    status: 204,
    description: '유저 차단 해제 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '차단되지 않은 유저',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'UB003',
          description: '에러 코드',
        },
        message: {
          type: 'string',
          example: '차단되지 않은 유저입니다.',
          description: '에러 메시지',
        },
      },
    },
  })
  async unblockUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() userTokenInfo: UserTokenInfo,
  ): Promise<void> {
    await this.userBlockService.unblockUser({
      blockerId: userTokenInfo.userId,
      blockedId: userId,
    });
  }
}
