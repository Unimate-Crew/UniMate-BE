import { Controller, Req, UseGuards, Post } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@app/database';
import { JwtRefreshGuard } from '@app/auth';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokensDto } from './dto/tokens.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '액세스 및 리프레쉬 토큰 재발급 API' })
  @Post('refresh')
  @ApiBearerAuth('refreshToken')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: Request): Promise<TokensDto> {
    const user = req.user as User;
    return this.authService.generateTokens(user);
  }
}
