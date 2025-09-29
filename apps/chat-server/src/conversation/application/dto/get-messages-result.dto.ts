import { MessageDto } from './message.dto';

export class GetMessagesResultDto {
  messages: MessageDto[];

  hasNext: boolean;

  nextCursor?: number;

  readStatusMap: Record<string, number>;

  public static of(params: {
    messages: MessageDto[];
    hasNext: boolean;
    nextCursor?: number;
    readStatusMap: Record<string, number>;
  }): GetMessagesResultDto {
    const dto = new GetMessagesResultDto();
    dto.messages = params.messages;
    dto.hasNext = params.hasNext;
    dto.nextCursor = params.nextCursor;
    dto.readStatusMap = params.readStatusMap;
    return dto;
  }
}
