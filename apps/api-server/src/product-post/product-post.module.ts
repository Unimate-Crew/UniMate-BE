import { Module } from '@nestjs/common';
import { ProductPost } from '@app/database/entites/product-post/product-post.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProductImage } from '@app/database/entites/product-post/product-image.entity';
import { User } from '@app/database';
import { ProductPostController } from './product-post.controller';
import { ProductPostService } from './product-post.service';

@Module({
  imports: [MikroOrmModule.forFeature([ProductPost, ProductImage, User])],
  controllers: [ProductPostController],
  providers: [ProductPostService],
  exports: [ProductPostService],
})
export class ProductPostModule {}
