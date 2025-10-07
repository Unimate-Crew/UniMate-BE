import { Global, Module } from '@nestjs/common';
import { RedisClient } from './redis.client';
import { SessionCacheRepository } from './repositories/session-cache.repository';
import { RoomOnlineCacheRepository } from './repositories/room-online-cache.repository';
import { ParticipantCacheRepository } from './repositories/participant-cache.repository';
import { VerificationCodeCacheRepository } from './repositories/verification-code-cache.repository';

@Global()
@Module({
  providers: [
    RedisClient,
    SessionCacheRepository,
    RoomOnlineCacheRepository,
    ParticipantCacheRepository,
    VerificationCodeCacheRepository,
  ],
  exports: [
    RedisClient,
    SessionCacheRepository,
    RoomOnlineCacheRepository,
    ParticipantCacheRepository,
    VerificationCodeCacheRepository,
  ],
})
export class RedisModule {}
