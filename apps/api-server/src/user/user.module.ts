import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User, InterestRegion, Region } from '@app/database';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SnsModule } from '../sns/sns.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SnsModule,
    AuthModule,
    MikroOrmModule.forFeature([User, InterestRegion]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
