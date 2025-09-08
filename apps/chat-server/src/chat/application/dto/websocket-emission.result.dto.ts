/* eslint-disable max-classes-per-file */
export class NewMessageEventDto {
  id: number;

  conversationId: number;

  senderId: number;

  content?: string;

  messageNumber: number;

  createdAt: Date;

  type: string;
}

export class ChatRoomUpdatedEventDto {
  conversationId: number;

  lastMessage: string;

  lastSentAt: Date;
}

export class MessageReadEventDto {
  conversationId: number;

  userId: number;

  lastReadMessageNumber: number;
}

export class WebSocketEmissionTarget {
  userId: number;

  event: string;

  data: NewMessageEventDto | ChatRoomUpdatedEventDto | MessageReadEventDto;
}

export class MessageEmissionResultDto {
  message: NewMessageEventDto;

  emissions: WebSocketEmissionTarget[];
}

export class ReadEmissionResultDto {
  emissions: WebSocketEmissionTarget[];
}
