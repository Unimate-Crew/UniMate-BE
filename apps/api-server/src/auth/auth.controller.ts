import { Controller, Req, UseGuards, Post } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@app/database';
import { AuthService } from './auth.service';
import { TokensDto } from './dto/tokens.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(@Req() req: Request): Promise<TokensDto> {
    const user = req.user as User;
    return this.authService.generateTokens(user);
  }
}
