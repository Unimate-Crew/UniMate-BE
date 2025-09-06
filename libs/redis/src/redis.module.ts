import { Global, Module } from '@nestjs/common';
import { RedisClient } from './redis.service';

@Global()
@Module({
  providers: [RedisClient],
  exports: [RedisClient],
})
export class RedisModule {}