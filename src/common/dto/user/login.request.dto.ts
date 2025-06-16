// Файл: common/dto/user/login.request.dto.ts
// Імпорт необхідних модулів та залежностей
import { ApiProperty } from '@nestjs/swagger'; // Для документації API через Swagger
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'; // Для валідації даних

/**
 * DTO запиту на автентифікацію
 * Використовується для передачі даних автентифікації від клієнта до сервера
 */
export class LoginRequestDTO {
  /**
   * Електронна пошта користувача
   * Використовується як унікальний ідентифікатор користувача при вході
   */
  @ApiProperty({ description: 'Email address of the user', example: 'admin@example.com' })
  @IsEmail() // Валідація: має бути валідною електронною поштою
  @IsNotEmpty() // Валідація: не може бути пустим
  public email: string;

  /**
   * Пароль користувача
   * Використовується для перевірки автентичності користувача
   */
  @ApiProperty({ description: 'Password of the user', example: 'securePassword123' })
  @IsString() // Валідація: має бути рядком
  @IsNotEmpty() // Валідація: не може бути пустим
  @MinLength(8) // Валідація: мінімальна довжина - 8 символів
  public password: string;
}
