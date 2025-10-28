/**
 * WebSocket ACK 응답 타입
 *
 * Socket.IO의 ACK(Acknowledgment) 방식을 사용하여
 * 클라이언트에게 즉시 성공/실패 응답을 전달합니다.
 *
 * REST API 패턴:
 * - Gateway: 성공 응답 직접 반환
 * - Exception Filter: 실패 응답 처리
 */

/**
 * 성공 응답
 *
 * 단순히 성공 여부만 전달.
 * 실제 데이터는 브로드캐스트 이벤트(message, read 등)로 전달됨.
 */
export interface WebSocketSuccessAck {
  isSuccess: true;
}

/**
 * 실패 응답
 *
 * 기존 형식 유지 (errorCode, errorMessage)
 */
export interface WebSocketErrorAck {
  isSuccess: false;
  errorCode: string;
  errorMessage: string;
}

/**
 * ACK 응답 (성공 또는 실패)
 */
export type WebSocketAckResponse = WebSocketSuccessAck | WebSocketErrorAck;
