// Імпорт необхідних модулів та залежностей
import { Body, Controller, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginResponseDTO } from '../../common/dto/user/login.response.dto';
import { LoginRequestDTO } from '../../common/dto/user/login.request.dto';
import { Endpoint } from '../../common/decorators/endpoint.decorator';
import { ApiResponse } from '../../common/decorators/api-response.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO для оновлення токену
 * Використовується для передачі refresh токену від клієнта
 */
class RefreshTokenDTO {
  @IsString() // Валідація: має бути рядком
  @IsNotEmpty() // Валідація: не може бути пустим
  refreshToken: string; // Поле для зберігання refresh токену
}

/**
 * Контролер автентифікації
 * Відповідає за обробку запитів пов'язаних з автентифікацією користувачів
 */
@ApiTags('Auth') // Тег для Swagger документації
@Controller('auth') // Базовий шлях для всіх ендпоінтів контролера
export class AuthController {
  // Створення логера для запису подій контролера
  private readonly logger = new Logger(AuthController.name);

  // Ін'єкція сервісу автентифікації через конструктор
  constructor(private readonly authService: AuthService) {}

  /**
   * Метод для входу користувача в систему
   * Обробляє POST запити на /auth/login
   */
  @HttpCode(HttpStatus.OK) // Встановлює код відповіді 200 OK
  @Endpoint('login') // Визначає шлях ендпоінту
  @ApiResponse(LoginResponseDTO) // Визначає тип відповіді для Swagger
  async signIn(@Body() signInDto: LoginRequestDTO): Promise<LoginResponseDTO> {
    try {
      // Логування спроби входу
      this.logger.log(`Login attempt for email: ${signInDto.email}`);
      // Виклик сервісу для автентифікації
      const result = await this.authService.signIn(signInDto.email, signInDto.password);
      // Логування успішного входу
      this.logger.log(`User logged in successfully: ${signInDto.email}`);
      return result;
    } catch (error) {
      // Логування помилки при невдалій спробі входу
      this.logger.error(`Login failed for email ${signInDto.email}: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }

  /**
   * Метод для оновлення токену доступу
   * Обробляє POST запити на /auth/refresh
   */
  @HttpCode(HttpStatus.OK) // Встановлює код відповіді 200 OK
  @Endpoint('refresh') // Визначає шлях ендпоінту
  @ApiResponse(LoginResponseDTO) // Визначає тип відповіді для Swagger
  async refreshToken(@Body() refreshDto: RefreshTokenDTO): Promise<LoginResponseDTO> {
    try {
      // Логування спроби оновлення токену
      this.logger.log(`Token refresh attempt`);
      // Виклик сервісу для оновлення токену
      const result = await this.authService.refreshToken(refreshDto.refreshToken);
      // Логування успішного оновлення токену
      this.logger.log(`Token refreshed successfully`);
      return result;
    } catch (error) {
      // Логування помилки при невдалому оновленні токену
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }
}
