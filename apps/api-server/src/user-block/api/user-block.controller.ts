import {
  Controller,
  Post,
  Delete,
  Param,
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
import { UserBlockService } from '../application/user-block.service';
import { ErrorResponse } from '../../common/error-response';

@ApiTags('유저 차단')
@Controller({ path: 'user-blocks' })
export class UserBlockController {
  constructor(private readonly userBlockService: UserBlockService) {}

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
