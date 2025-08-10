import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserSalesFilter } from '@app/database/common/enums';
import { PageRequest } from '@app/common';

export class FindUserSalesRequestDto extends PageRequest {
  @ApiProperty({
    description: '판매내역 필터',
    enum: UserSalesFilter,
    example: UserSalesFilter.FOR_SALE,
    required: false,
  })
  @IsEnum(UserSalesFilter)
  @IsOptional()
  userSalesFilter?: UserSalesFilter;
}
