import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisClient } from '@app/redis';

@Injectable()
export class WebSocketRedisAdapterService {
  private readonly logger = new Logger(WebSocketRedisAdapterService.name);

  constructor(private readonly redisClient: RedisClient) {}

  /**
   * Socket.IO 서버에 Redis 어댑터를 설정합니다.
   *
   * @param server Socket.IO 서버 인스턴스
   */
  async setupRedisAdapter(server: Server): Promise<void> {
    try {
      const pubClient = this.redisClient.getClient();
      const subClient = pubClient.duplicate();

      // Redis 연결 대기
      if (pubClient.status !== 'ready') {
        await new Promise((resolve) => {
          pubClient.once('ready', resolve);
        });
      }

      // subClient가 이미 연결되어 있지 않은 경우에만 연결
      if (subClient.status !== 'ready' && subClient.status !== 'connecting') {
        await subClient.connect();
      }

      server.adapter(createAdapter(pubClient, subClient));
      this.logger.log('Socket.IO Redis adapter configured successfully');
    } catch (error) {
      this.logger.error('Failed to configure Redis adapter:', error);
      // Redis adapter 설정이 실패해도 서버는 계속 실행되도록 함
      this.logger.warn(
        'Continuing without Redis adapter (single instance mode)',
      );
    }
  }
}
