import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

// DTO для параметрів пошуку API
export class SearchParameterDTO<T = unknown> {
  // Поля, за якими виконується пошук
  @ApiProperty({
    description: 'Fields to search by',
    isArray: true,
    required: false,
  })
  @IsArray()
  @IsOptional()
  searchBy?: T[];

  // Текстовий запит для пошуку
  @ApiProperty({
    description: 'Search query string',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  query?: string;

  // Номер сторінки
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number;

  // Розмір сторінки
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  pageSize?: number;
}
