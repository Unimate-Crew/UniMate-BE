import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PageRequest {
  @ApiProperty({ description: '페이지 번호', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  public static of(pageNumber: number, pageSize: number): PageRequest {
    const pageRequest: PageRequest = new PageRequest();
    pageRequest.pageNumber = pageNumber;
    pageRequest.pageSize = pageSize;
    return pageRequest;
  }

  /**
   * 데이터베이스 쿼리에서 사용할 offset 값을 반환합니다.
   * @returns offset 값 (건너뛸 항목 수)
   */
  getOffset(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }

  /**
   * 데이터베이스 쿼리에서 사용할 limit 값을 반환합니다.
   * @returns limit 값 (가져올 항목 수)
   */
  getLimit(): number {
    return this.pageSize;
  }

  /**
   * 현재 페이지 번호를 반환합니다.
   * @returns 현재 페이지 번호
   */
  getPageNumber(): number {
    return this.pageNumber;
  }

  /**
   * 페이지 크기를 반환합니다.
   * @returns 페이지 크기
   */
  getPageSize(): number {
    return this.pageSize;
  }
}
