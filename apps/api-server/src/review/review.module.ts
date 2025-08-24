import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Review } from '@app/database';
import { User } from '@app/database';
import { ProductPost } from '@app/database';
import { ReviewController } from './api/review.controller';
import { ReviewService } from './application/review.service';

@Module({
  imports: [MikroOrmModule.forFeature([Review, User, ProductPost])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
