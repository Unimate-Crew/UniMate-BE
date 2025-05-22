import { Module } from '@nestjs/common';
import { ProductPostController } from './product-post.controller';
import { ProductPostService } from './product-post.service';

@Module({
  controllers: [ProductPostController],
  providers: [ProductPostService],
  exports: [ProductPostService],
})
export class ProductPostModule {}
