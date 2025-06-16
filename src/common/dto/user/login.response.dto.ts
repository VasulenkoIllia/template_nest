// Імпорт необхідних модулів та залежностей
import { ApiProperty } from '@nestjs/swagger'; // Для документації API через Swagger
import { IsNotEmpty, IsString } from 'class-validator'; // Для валідації даних

/**
 * DTO відповіді на запит автентифікації
 * Використовується для повернення токенів доступу та оновлення після успішного входу або оновлення токену
 */
export class LoginResponseDTO {
  /**
   * Токен доступу JWT
   * Використовується для автентифікації запитів до захищених ресурсів
   */
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString() // Валідація: має бути рядком
  @IsNotEmpty() // Валідація: не може бути пустим
  public accessToken: string;

  /**
   * Токен оновлення JWT
   * Використовується для отримання нового токену доступу після закінчення терміну дії поточного
   */
  @ApiProperty({ description: 'JWT refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString() // Валідація: має бути рядком
  @IsNotEmpty() // Валідація: не може бути пустим
  public refreshToken: string;
}
