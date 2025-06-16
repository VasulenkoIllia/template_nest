// Імпорт необхідних модулів та залежностей
import { ApiProperty } from '@nestjs/swagger'; // Для документації API через Swagger
import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator'; // Для валідації даних
import { Role, User } from '@prisma/client'; // Типи з Prisma ORM

/**
 * Інтерфейс, що розширює стандартний тип User з Prisma
 * Додає інформацію про роль користувача
 * Використовується для внутрішньої обробки даних користувача
 */
export interface UserWithRole extends User {
  role: Role | null; // Роль користувача, може бути null
}

/**
 * DTO для відповіді з даними користувача
 * Використовується для повернення даних користувача клієнту
 */
export class UserResponseDTO {
  /**
   * Унікальний ідентифікатор користувача
   */
  @ApiProperty({ description: 'Unique identifier of the user', example: 1, required: true })
  @IsNumber() // Валідація: має бути числом
  @IsNotEmpty() // Валідація: не може бути пустим
  public id: number;

  /**
   * Електронна пошта користувача
   * Використовується як унікальний ідентифікатор для входу
   */
  @ApiProperty({ description: 'Email address of the user', example: 'user@example.com', required: true })
  @IsString() // Валідація: має бути рядком
  @IsNotEmpty() // Валідація: не може бути пустим
  @IsEmail() // Валідація: має бути валідною електронною поштою
  @MinLength(5) // Валідація: мінімальна довжина - 5 символів
  @MaxLength(128) // Валідація: максимальна довжина - 128 символів
  public email: string;

  /**
   * Роль користувача в системі
   * Визначає права доступу користувача
   */
  @ApiProperty({ description: 'Role of the user', example: 'ADMIN', required: true })
  @IsString() // Валідація: має бути рядком
  @IsNotEmpty() // Валідація: не може бути пустим
  public role: string;
}
