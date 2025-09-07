export enum WebSocketErrorCode {
  // 인증 관련 에러
  AUTH001 = 'AUTH001',
  AUTH002 = 'AUTH002',

  // 채팅방 관련 에러
  ROOM001 = 'ROOM001',
  ROOM002 = 'ROOM002',

  // 메시지 관련 에러
  MSG001 = 'MSG001',
  MSG002 = 'MSG002',

  // 일반적인 에러
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export const WebSocketErrorMessage = {
  [WebSocketErrorCode.AUTH001]: 'Authentication failed',
  [WebSocketErrorCode.AUTH002]: 'User not authenticated',
  [WebSocketErrorCode.ROOM001]: 'Failed to join room',
  [WebSocketErrorCode.ROOM002]: 'Failed to leave room',
  [WebSocketErrorCode.MSG001]: 'Failed to send message',
  [WebSocketErrorCode.MSG002]: 'Failed to mark messages as read',
  [WebSocketErrorCode.INTERNAL_ERROR]: 'Internal server error occurred',
  [WebSocketErrorCode.VALIDATION_ERROR]: 'Invalid request data',
} as const;
