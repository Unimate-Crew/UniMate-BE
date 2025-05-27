import { Module } from '@nestjs/common';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductPostController } from './product-post.controller';
import { ProductPostService } from './product-post.service';

@Module({
  imports: [MikroOrmModule.forFeature([ProductPost])],
  controllers: [ProductPostController],
  providers: [ProductPostService],
  exports: [ProductPostService],
})
export class ProductPostModule {}
