import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class GetProductsRequestDto {
  @ApiProperty({
    description: '페이지 번호',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageNumber?: number;

  @ApiProperty({
    description: '페이지 크기',
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pageSize?: number;

  @ApiProperty({
    description: '도시 ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cityId?: number;
}
