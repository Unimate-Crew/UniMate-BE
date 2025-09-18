import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { ConversationParticipant } from './conversation-participant.entity';
import { ConversationParticipantStatus } from '../../common/enums';

@Injectable()
export class ConversationParticipantRepository extends EntityRepository<ConversationParticipant> {
  async findById(id: number): Promise<ConversationParticipant | null> {
    return this.findOne({ id, isDeleted: false });
  }

  async findByConversationIdAndUserId(params: {
    conversationId: number;
    userId: number;
  }): Promise<ConversationParticipant | null> {
    return this.findOne({
      conversationId: params.conversationId,
      userId: params.userId,
      isDeleted: false,
    });
  }

  async findByUserIdAndConversationIdsIn(params: {
    userId: number;
    conversationIds: number[];
  }): Promise<ConversationParticipant[]> {
    return this.find({
      conversationId: { $in: params.conversationIds },
      userId: params.userId,
      isDeleted: false,
      // todo: status 추가
    });
  }

  /**
   * 대화방의 모든 참여자를 조회합니다.
   *
   * @param conversationId 대화방 ID
   * @returns 참여자 목록
   */
  async findByConversationId(
    conversationId: number,
  ): Promise<ConversationParticipant[]> {
    return this.find({ conversationId, isDeleted: false });
  }

  /**
   * 사용자가 참여한 모든 대화방을 조회합니다.
   *
   * @param userId 사용자 ID
   * @returns 참여자 목록
   */
  async findByUserId(userId: number): Promise<ConversationParticipant[]> {
    return this.find({ userId, isDeleted: false });
  }

  /**
   * 대화방의 활성 참여자를 조회합니다.
   *
   * @param conversationId 대화방 ID
   * @returns 활성 참여자 목록
   */
  async findActiveParticipants(
    conversationId: number,
  ): Promise<ConversationParticipant[]> {
    return this.find({
      conversationId,
      isDeleted: false,
      leftAt: null,
    });
  }

  /**
   * 참여자를 생성합니다.
   *
   * @param params.conversationId 대화방 ID
   * @param params.userId 사용자 ID
   * @param params.status 참여자 상태
   * @returns 생성된 참여자 엔티티
   */
  create(params: {
    conversationId: number;
    userId: number;
    status?: ConversationParticipantStatus;
  }): ConversationParticipant {
    const participant = this.em.create(ConversationParticipant, {
      conversationId: params.conversationId,
      userId: params.userId,
      status: params.status,
    });
    return participant;
  }

  async countParticipants(conversationId: number): Promise<number> {
    return this.count({ conversationId, isDeleted: false });
  }

  async persist(participant: ConversationParticipant): Promise<void> {
    await this.em.persist(participant);
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }

  async persistAndFlush(participant: ConversationParticipant): Promise<void> {
    await this.em.persistAndFlush(participant);
  }
}
