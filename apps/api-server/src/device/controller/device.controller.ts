import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard, UserTokenInfo, CurrentUser } from '@app/auth';
import { DeviceService } from '../service/device.service';
import { RegisterDeviceRequestDto } from './dto/register-device-request.dto';
import { RegisterDeviceResponseDto } from './dto/register-device-response.dto';
import { RegisterDeviceResultDto } from '../service/dto/register-device-result.dto';

@ApiTags('디바이스')
@ApiBearerAuth('accessToken')
@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @ApiOperation({
    summary: '디바이스 토큰 등록',
    description:
      '푸시 알림을 위한 디바이스 토큰을 등록합니다. 멀티 디바이스를 지원합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '디바이스 토큰 등록 성공',
    type: RegisterDeviceResponseDto,
  })
  async registerDevice(
    @CurrentUser() userTokenInfo: UserTokenInfo,
    @Body() requestDto: RegisterDeviceRequestDto,
  ): Promise<RegisterDeviceResponseDto> {
    const result: RegisterDeviceResultDto =
      await this.deviceService.registerDevice({
        userId: userTokenInfo.userId,
        deviceToken: requestDto.deviceToken,
        platform: requestDto.platform,
      });

    return RegisterDeviceResponseDto.from(result);
  }
}
