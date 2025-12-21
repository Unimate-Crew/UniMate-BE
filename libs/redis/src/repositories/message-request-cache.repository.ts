import { Injectable } from '@nestjs/common';
import { RedisClient } from '../redis.client';
import { buildRedisKey } from '../redis.utils';

@Injectable()
export class MessageRequestCacheRepository {
  constructor(private readonly redisClient: RedisClient) {}

  private readonly MESSAGE_REQUEST_PREFIX = 'message:request';

  private readonly MESSAGE_LOCK_PREFIX = 'message:lock';

  private readonly REQUEST_TTL = 300; // 5분

  private readonly LOCK_TTL = 10; // 10초 (락 처리 시간)

  /**
   * 메시지 요청을 캐시에 저장합니다 (중복 방지용).
   *
   * @param conversationId 대화방 ID
   * @param requestId 클라이언트 요청 ID
   * @param messageId 저장된 메시지 ID
   */
  async setMessageRequest(
    conversationId: number,
    requestId: string,
    messageId: number,
  ): Promise<void> {
    const key = buildRedisKey(
      this.MESSAGE_REQUEST_PREFIX,
      conversationId,
      requestId,
    );
    await this.redisClient.set(key, messageId.toString(), this.REQUEST_TTL);
  }

  /**
   * 캐시에서 메시지 요청을 조회합니다.
   *
   * @param conversationId 대화방 ID
   * @param requestId 클라이언트 요청 ID
   * @returns 메시지 ID (없으면 null)
   */
  async getMessageRequest(
    conversationId: number,
    requestId: string,
  ): Promise<number | null> {
    const key = buildRedisKey(
      this.MESSAGE_REQUEST_PREFIX,
      conversationId,
      requestId,
    );
    const messageId = await this.redisClient.get(key);
    return messageId ? parseInt(messageId, 10) : null;
  }

  /**
   * 원자적으로 메시지 요청에 대한 락을 획득합니다.
   * 동시 요청 시 하나의 요청만 락을 획득할 수 있습니다.
   *
   * @param conversationId 대화방 ID
   * @param requestId 클라이언트 요청 ID
   * @returns 락 획득 성공 시 true, 이미 처리 중이면 false
   */
  async tryAcquireLock(
    conversationId: number,
    requestId: string,
  ): Promise<boolean> {
    const lockKey = buildRedisKey(
      this.MESSAGE_LOCK_PREFIX,
      conversationId,
      requestId,
    );
    return this.redisClient.setNx(lockKey, 'processing', this.LOCK_TTL);
  }

  /**
   * 메시지 처리 완료 후 락을 실제 메시지 ID로 업데이트하고, 결과를 캐시에 저장합니다.
   *
   * @param conversationId 대화방 ID
   * @param requestId 클라이언트 요청 ID
   * @param messageId 저장된 메시지 ID
   */
  async completeRequest(
    conversationId: number,
    requestId: string,
    messageId: number,
  ): Promise<void> {
    const lockKey = buildRedisKey(
      this.MESSAGE_LOCK_PREFIX,
      conversationId,
      requestId,
    );
    const requestKey = buildRedisKey(
      this.MESSAGE_REQUEST_PREFIX,
      conversationId,
      requestId,
    );

    // 락 삭제 및 결과 캐시 저장
    await Promise.all([
      this.redisClient.del(lockKey),
      this.redisClient.set(requestKey, messageId.toString(), this.REQUEST_TTL),
    ]);
  }

  /**
   * 처리 중인 요청의 완료를 기다린 후 메시지 ID를 반환합니다.
   * 최대 대기 시간 동안 주기적으로 결과를 확인합니다.
   *
   * @param conversationId 대화방 ID
   * @param requestId 클라이언트 요청 ID
   * @param maxWaitMs 최대 대기 시간 (밀리초)
   * @param intervalMs 확인 간격 (밀리초)
   * @returns 메시지 ID (없으면 null)
   */
  async waitForCompletion(
    conversationId: number,
    requestId: string,
    maxWaitMs: number = 5000,
    intervalMs: number = 100,
  ): Promise<number | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const messageId = await this.getMessageRequest(conversationId, requestId);
      if (messageId !== null) {
        return messageId;
      }
      await this.delay(intervalMs);
    }

    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
