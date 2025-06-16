import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsPositive } from 'class-validator';

// DTO для пагінованих відповідей API
export class PaginatedResultDTO<T = unknown> {
  // Масив елементів на поточній сторінці
  @ApiProperty({
    description: 'Array of items on the current page',
    isArray: true,
  })
  @IsArray()
  items: T[];

  // Загальна кількість елементів
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  @IsInt()
  @IsPositive()
  total: number;

  // Поточна сторінка
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  @IsInt()
  @IsPositive()
  page: number;

  // Розмір сторінки
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  @IsInt()
  @IsPositive()
  pageSize: number;
}
