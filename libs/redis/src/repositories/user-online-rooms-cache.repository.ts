import { Injectable } from '@nestjs/common';
import { RedisClient } from '../redis.client';
import { buildRedisKey } from '../redis.utils';

@Injectable()
export class UserOnlineRoomsCacheRepository {
  constructor(private readonly redisClient: RedisClient) {}

  private readonly USER_ONLINE_ROOMS_PREFIX = 'user:online-rooms';

  private readonly USER_ONLINE_ROOMS_TTL = 86400; // 24시간

  async addRoomToUser(userId: number, conversationId: number): Promise<void> {
    const key = buildRedisKey(this.USER_ONLINE_ROOMS_PREFIX, userId);
    await this.redisClient.addToSet(key, conversationId.toString());
    await this.redisClient.expire(key, this.USER_ONLINE_ROOMS_TTL);
  }

  async removeRoomFromUser(
    userId: number,
    conversationId: number,
  ): Promise<void> {
    const key = buildRedisKey(this.USER_ONLINE_ROOMS_PREFIX, userId);
    await this.redisClient.removeFromSet(key, conversationId.toString());
  }

  async getUserOnlineRooms(userId: number): Promise<number[]> {
    const key = buildRedisKey(this.USER_ONLINE_ROOMS_PREFIX, userId);
    const conversationIds = await this.redisClient.getSetMembers(key);
    return conversationIds.map((id) => parseInt(id, 10));
  }

  async clearUserOnlineRooms(userId: number): Promise<void> {
    const key = buildRedisKey(this.USER_ONLINE_ROOMS_PREFIX, userId);
    await this.redisClient.del(key);
  }

  async hasRoom(userId: number, conversationId: number): Promise<boolean> {
    const key = buildRedisKey(this.USER_ONLINE_ROOMS_PREFIX, userId);
    const result = await this.redisClient.isSetMember(
      key,
      conversationId.toString(),
    );
    return result === 1;
  }

  async getRoomCount(userId: number): Promise<number> {
    const key = buildRedisKey(this.USER_ONLINE_ROOMS_PREFIX, userId);
    return this.redisClient.getSetSize(key);
  }
}
