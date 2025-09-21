import { Injectable } from '@nestjs/common';
import { RedisClient } from '../redis.client';
import { buildRedisKey } from '../redis.utils';
import { ConversationParticipantCache } from '../entities/conversation-participant-cache.entity';

@Injectable()
export class ParticipantCacheRepository {
  constructor(private readonly redisClient: RedisClient) {}

  private readonly PARTICIPANT_PREFIX = 'conversation:participants';

  async setParticipants(
    conversationId: number,
    participants: ConversationParticipantCache[],
  ): Promise<void> {
    const key = buildRedisKey(this.PARTICIPANT_PREFIX, conversationId);
    const serializedParticipants = participants.map((p) => p.serialize());
    await this.redisClient.del(key);
    if (serializedParticipants.length > 0) {
      await this.redisClient.addToSet(key, ...serializedParticipants);
    }
  }

  async getParticipants(
    conversationId: number,
  ): Promise<ConversationParticipantCache[]> {
    const key = buildRedisKey(this.PARTICIPANT_PREFIX, conversationId);
    const serializedParticipants = await this.redisClient.getSetMembers(key);
    return serializedParticipants.map((data) =>
      ConversationParticipantCache.deserialize(data),
    );
  }

  async addParticipant(
    conversationId: number,
    participant: ConversationParticipantCache,
  ): Promise<void> {
    const key = buildRedisKey(this.PARTICIPANT_PREFIX, conversationId);
    await this.redisClient.addToSet(key, participant.serialize());
  }

  async removeParticipant(
    conversationId: number,
    userId: number,
  ): Promise<void> {
    const key = buildRedisKey(this.PARTICIPANT_PREFIX, conversationId);
    const participants = await this.getParticipants(conversationId);
    const targetParticipant = participants.find(
      (p) => p.getUserId() === userId,
    );

    if (targetParticipant) {
      await this.redisClient.removeFromSet(key, targetParticipant.serialize());
    }
  }

  async updateParticipant(
    conversationId: number,
    participant: ConversationParticipantCache,
  ): Promise<void> {
    await this.removeParticipant(conversationId, participant.getUserId());
    await this.addParticipant(conversationId, participant);
  }

  async getParticipant(
    conversationId: number,
    userId: number,
  ): Promise<ConversationParticipantCache | null> {
    const participants = await this.getParticipants(conversationId);
    return participants.find((p) => p.getUserId() === userId) || null;
  }

  async hasParticipant(
    conversationId: number,
    userId: number,
  ): Promise<boolean> {
    const participant = await this.getParticipant(conversationId, userId);
    return participant !== null;
  }

  async clearParticipants(conversationId: number): Promise<void> {
    const key = buildRedisKey(this.PARTICIPANT_PREFIX, conversationId);
    await this.redisClient.del(key);
  }

  async getParticipantCount(conversationId: number): Promise<number> {
    const key = buildRedisKey(this.PARTICIPANT_PREFIX, conversationId);
    return this.redisClient.getSetSize(key);
  }
}
