import { Injectable } from '@nestjs/common';
import { RedisClient } from '../redis.client';
import { buildRedisKey } from '../redis.utils';

@Injectable()
export class SessionCacheRepository {
  constructor(private readonly redisClient: RedisClient) {}

  private readonly USER_SOCKET_PREFIX = 'user';

  private readonly SOCKET_USER_PREFIX = 'socket';

  async setUserSocket(userId: number, socketId: string): Promise<void> {
    const userSocketKey = buildRedisKey(
      this.USER_SOCKET_PREFIX,
      userId,
      'socketId',
    );
    const socketUserKey = buildRedisKey(
      this.SOCKET_USER_PREFIX,
      socketId,
      'userId',
    );

    await Promise.all([
      this.redisClient.set(userSocketKey, socketId),
      this.redisClient.set(socketUserKey, userId.toString()),
    ]);
  }

  async getUserSocket(userId: number): Promise<string | null> {
    const key = buildRedisKey(this.USER_SOCKET_PREFIX, userId, 'socketId');
    return this.redisClient.get(key);
  }

  async getSocketUser(socketId: string): Promise<number | null> {
    const key = buildRedisKey(this.SOCKET_USER_PREFIX, socketId, 'userId');
    const userId = await this.redisClient.get(key);
    return userId ? parseInt(userId, 10) : null;
  }

  async clearUserSession(userId: number, socketId: string): Promise<void> {
    const userSocketKey = buildRedisKey(
      this.USER_SOCKET_PREFIX,
      userId,
      'socketId',
    );
    const socketUserKey = buildRedisKey(
      this.SOCKET_USER_PREFIX,
      socketId,
      'userId',
    );

    await Promise.all([
      this.redisClient.del(userSocketKey),
      this.redisClient.del(socketUserKey),
    ]);
  }

  async userSessionExists(userId: number): Promise<boolean> {
    const key = buildRedisKey(this.USER_SOCKET_PREFIX, userId, 'socketId');
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async socketSessionExists(socketId: string): Promise<boolean> {
    const key = buildRedisKey(this.SOCKET_USER_PREFIX, socketId, 'userId');
    const result = await this.redisClient.exists(key);
    return result === 1;
  }
}
