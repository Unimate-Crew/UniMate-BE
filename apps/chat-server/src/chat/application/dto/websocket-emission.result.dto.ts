export interface NewMessageEventDto {
  id: number;
  conversationId: number;
  senderId: number;
  content?: string;
  messageNumber: number;
  createdAt: Date;
  type: string;
}

export interface ChatRoomUpdatedEventDto {
  conversationId: number;
  lastMessage: string;
  lastSentAt: Date;
}

export interface MessageReadEventDto {
  conversationId: number;
  userId: number;
  lastReadMessageNumber: number;
}

export type WebSocketEventData =
  | NewMessageEventDto
  | ChatRoomUpdatedEventDto
  | MessageReadEventDto;

export interface WebSocketEmissionTarget {
  userId: number;
  event: string;
  data: WebSocketEventData;
}

export interface MessageEmissionResultDto {
  message: NewMessageEventDto;
  emissions: WebSocketEmissionTarget[];
}

export interface ReadEmissionResultDto {
  emissions: WebSocketEmissionTarget[];
}
