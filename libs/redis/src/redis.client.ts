import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisClient implements OnApplicationShutdown {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.client.setex(key, ttl, value);
    }
    return this.client.set(key, value);
  }

  /**
   * SET if Not eXists - 원자적으로 키가 없을 때만 값을 설정합니다.
   *
   * @param key Redis 키
   * @param value 설정할 값
   * @param ttl TTL (초 단위, 선택)
   * @returns 설정 성공 시 true, 키가 이미 존재하면 false
   */
  async setNx(key: string, value: string, ttl?: number): Promise<boolean> {
    if (ttl) {
      const result = await this.client.set(key, value, 'EX', ttl, 'NX');
      return result === 'OK';
    }
    const result = await this.client.setnx(key, value);
    return result === 1;
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  // Set operations
  async addToSet(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async removeFromSet(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  async getSetMembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async isSetMember(key: string, member: string): Promise<number> {
    return this.client.sismember(key, member);
  }

  async getSetSize(key: string): Promise<number> {
    return this.client.scard(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  pipeline() {
    return this.client.pipeline();
  }

  getClient(): Redis {
    return this.client;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }
}
