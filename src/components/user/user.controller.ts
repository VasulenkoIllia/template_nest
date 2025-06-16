// Імпорт необхідних модулів та залежностей
import { Controller, Logger, Req, RequestMethod } from '@nestjs/common';
import { SecureEndpoint } from '../../common/decorators/secure-endpoint.decorator';
import { IAuthorizedRequest } from '../../common/interfaces/common/authorized-request.interface';
import { UserService } from './user.service';
import { UserResponseDTO } from '../../common/dto/user/user.response.dto';
import { ApiResponse } from '../../common/decorators/api-response.decorator';
import { ApiTags } from '@nestjs/swagger';

/**
 * Контролер для роботи з користувачами
 * Обробляє HTTP запити пов'язані з даними користувачів
 */
@ApiTags('User') // Тег для Swagger документації
@Controller('user') // Базовий шлях для всіх ендпоінтів контролера
export class UserController {
  // Створення логера для запису подій контролера
  private readonly logger = new Logger(UserController.name);

  /**
   * Конструктор контролера з ін'єкцією залежностей
   * @param userService - сервіс для роботи з користувачами
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Ендпоінт для отримання даних поточного автентифікованого користувача
   * Доступний за GET запитом на /user/me
   * Вимагає автентифікації (захищений ендпоінт)
   *
   * @param req - об'єкт запиту з даними автентифікованого користувача
   * @returns дані поточного користувача
   */
  @SecureEndpoint('me', RequestMethod.GET) // Захищений ендпоінт, доступний тільки для автентифікованих користувачів
  @ApiResponse(UserResponseDTO) // Визначає тип відповіді для Swagger
  async getMe(@Req() req: IAuthorizedRequest): Promise<UserResponseDTO> {
    try {
      // Логування початку обробки запиту
      this.logger.log(`Fetching user data for ID: ${req.user.id}`);

      // Отримання даних користувача за ідентифікатором з токена
      const user = await this.userService.findById(req.user.id);

      // Перевірка наявності користувача
      if (!user) {
        // Якщо користувача не знайдено, логуємо попередження та викидаємо помилку
        this.logger.warn(`User with ID ${req.user.id} not found`);
        throw new Error('User not found');
      }

      // Логування успішного отримання даних
      this.logger.log(`User data retrieved successfully for ID: ${req.user.id}`);

      // Повернення даних користувача
      return user;
    } catch (error) {
      // Логування помилки при невдалому отриманні даних
      this.logger.error(`Failed to fetch user data for ID ${req.user.id}: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }
}
