import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SnsModule } from '../sns/sns.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SnsModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
