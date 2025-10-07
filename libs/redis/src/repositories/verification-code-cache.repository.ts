import { Injectable } from '@nestjs/common';
import { RedisClient } from '../redis.client';
import { buildRedisKey } from '../redis.utils';
import { VerificationCodeCache } from '../entities/verification-code-cache.entity';

@Injectable()
export class VerificationCodeCacheRepository {
  constructor(private readonly redisClient: RedisClient) {}

  private readonly VERIFICATION_CODE_PREFIX = 'verification:code';

  async setVerificationCode(
    userId: number,
    data: VerificationCodeCache,
    ttl: number,
  ): Promise<void> {
    const key = buildRedisKey(this.VERIFICATION_CODE_PREFIX, userId.toString());
    await this.redisClient.set(key, data.serialize(), ttl);
  }

  async getVerificationCode(
    userId: number,
  ): Promise<VerificationCodeCache | null> {
    const key = buildRedisKey(this.VERIFICATION_CODE_PREFIX, userId.toString());
    const result = await this.redisClient.get(key);
    return result ? VerificationCodeCache.deserialize(result) : null;
  }

  async deleteVerificationCode(userId: number): Promise<void> {
    const key = buildRedisKey(this.VERIFICATION_CODE_PREFIX, userId.toString());
    await this.redisClient.del(key);
  }

  async verificationCodeExists(userId: number): Promise<boolean> {
    const key = buildRedisKey(this.VERIFICATION_CODE_PREFIX, userId.toString());
    const result = await this.redisClient.exists(key);
    return result === 1;
  }
}
