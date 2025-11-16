import { Injectable } from '@nestjs/common';
import { RedisClient } from '../redis.client';
import { buildRedisKey } from '../redis.utils';

@Injectable()
export class RoomOnlineCacheRepository {
  constructor(private readonly redisClient: RedisClient) {}

  private readonly ROOM_ONLINE_PREFIX = 'room:online';

  private readonly ROOM_ONLINE_TTL = 86400; // 24시간

  async addUserToRoom(conversationId: number, userId: number): Promise<void> {
    const key = buildRedisKey(this.ROOM_ONLINE_PREFIX, conversationId);
    await this.redisClient.addToSet(key, userId.toString());
    await this.redisClient.expire(key, this.ROOM_ONLINE_TTL);
  }

  async removeUserFromRoom(
    conversationId: number,
    userId: number,
  ): Promise<void> {
    const key = buildRedisKey(this.ROOM_ONLINE_PREFIX, conversationId);
    await this.redisClient.removeFromSet(key, userId.toString());
  }

  async getOnlineUsers(conversationId: number): Promise<number[]> {
    const key = buildRedisKey(this.ROOM_ONLINE_PREFIX, conversationId);
    const userIds = await this.redisClient.getSetMembers(key);
    return userIds.map((id) => parseInt(id, 10));
  }

  async isUserOnline(conversationId: number, userId: number): Promise<boolean> {
    const key = buildRedisKey(this.ROOM_ONLINE_PREFIX, conversationId);
    const result = await this.redisClient.isSetMember(key, userId.toString());
    return result === 1;
  }

  async getRoomCount(conversationId: number): Promise<number> {
    const key = buildRedisKey(this.ROOM_ONLINE_PREFIX, conversationId);
    return this.redisClient.getSetSize(key);
  }

  async clearRoom(conversationId: number): Promise<void> {
    const key = buildRedisKey(this.ROOM_ONLINE_PREFIX, conversationId);
    await this.redisClient.del(key);
  }
}
