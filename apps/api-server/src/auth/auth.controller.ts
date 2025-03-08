import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  Res,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { User } from '@app/database';
import { AuthService } from './auth.service';
import { SocialLoginRequestDto } from './dto/social-login.dto';
import { TokensDto } from './dto/tokens.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth(@Query() query: SocialLoginRequestDto): Promise<void> {
    console.log('Naver login request with redirectUrl:', query.redirectUrl);
    // redirectUrl은 세션이나 쿠키에 저장하는 것이 좋습니다
    // 여기서는 간단히 로그만 출력
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(
    @Req() req: Request,
    @Query('state') state: string,
    @Query('redirectUrl') redirectUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    // 리다이렉트 URL이 없으면 기본값 사용
    const targetUrl = redirectUrl || 'http://localhost:3000';

    const { redirectUrl: finalRedirectUrl } =
      await this.authService.handleSocialLoginCallback(
        req.user as User,
        targetUrl,
      );

    return res.redirect(finalRedirectUrl);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refreshTokens(@Req() req: Request): Promise<TokensDto> {
    const user = req.user as User;
    return this.authService.generateTokens(user);
  }
}
