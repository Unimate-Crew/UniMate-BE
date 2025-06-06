import { Module } from '@nestjs/common';
import { S3Module } from '@app/common/s3/s3.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SnsModule } from '../sns/sns.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SnsModule, AuthModule, S3Module],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
