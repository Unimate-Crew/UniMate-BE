import { EntityRepository } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';
import { PageRequest, Slice } from '@app/common';
import { ConversationParticipant } from './conversation-participant.entity';

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
   * @returns 생성된 참여자 엔티티
   */
  create(params: {
    conversationId: number;
    userId: number;
  }): ConversationParticipant {
    const participant = this.em.create(ConversationParticipant, {
      conversationId: params.conversationId,
      userId: params.userId,
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

  /**
   * 사용자의 채팅방 리스트를 조회합니다.
   *
   * @param params.userId 사용자 ID
   * @param params.productPostId 상품 게시글 ID (선택사항, 판매자가 특정 상품의 채팅방만 조회할 때)
   * @param params.pageRequest 페이지네이션 정보
   * @returns 채팅방 요약 정보 목록
   */
  async findConversationsByUserId(params: {
    userId: number;
    productPostId?: number;
    pageRequest: PageRequest;
  }): Promise<Slice<any>> {
    const { userId, productPostId, pageRequest } = params;

    const offset = pageRequest.getOffset();
    const limit = pageRequest.getLimit() + 1;

    let sql = `
      SELECT
        c.id as conversationId,
        c.product_post_id as productPostId,
        c.last_message_number as lastMessageNumber,
        pp.title as productTitle,
        pi.image_key as productThumbnailKey,
        other_user.id as otherUserId,
        other_user.nickname as otherUserNickname,
        other_user.profile_image_key as otherUserProfileImageKey,
        cm.content as lastMessageContent,
        cm.sender_id as lastMessageSenderId,
        c.last_sent_at as lastSentAt,
        cp.last_read_message_number as lastReadMessageNumber
      FROM conversation_participant cp
      INNER JOIN conversation c ON c.id = cp.conversation_id
      LEFT JOIN conversation_participant other_cp ON other_cp.conversation_id = c.id
        AND other_cp.user_id != ? AND other_cp.is_deleted = false
      LEFT JOIN user other_user ON other_user.id = other_cp.user_id
      LEFT JOIN product_post pp ON pp.id = c.product_post_id
      LEFT JOIN product_image pi ON pi.product_id = pp.id
        AND pi.is_deleted = false AND pi.is_thumbnail = true
      LEFT JOIN conversation_message cm ON cm.conversation_id = c.id
        AND cm.message_number = c.last_message_number
      WHERE cp.user_id = ?
        AND cp.is_deleted = false
        AND (cp.left_at IS NULL OR cp.left_at < c.last_sent_at)
    `;

    const queryParams = [userId, userId];

    if (productPostId) {
      sql += ' AND c.product_post_id = ?';
      queryParams.push(productPostId);
    }

    sql += `
      ORDER BY c.last_sent_at DESC, c.id DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    const rawResults = await this.em.getConnection().execute(sql, queryParams);

    const contents = rawResults.slice(0, pageRequest.getLimit());
    const hasNext = rawResults.length > pageRequest.getLimit();

    return Slice.of(contents, hasNext);
  }
}
