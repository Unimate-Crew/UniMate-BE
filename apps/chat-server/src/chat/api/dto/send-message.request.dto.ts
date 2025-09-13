import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConversationMessageType } from '@app/database/common/enums';

export class SendMessageRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  conversationId: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  requestId?: string;

  @IsEnum(ConversationMessageType)
  @IsNotEmpty()
  type: ConversationMessageType;
}
