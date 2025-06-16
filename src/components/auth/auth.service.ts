// Імпорт необхідних модулів та залежностей
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDTO } from '../../common/dto/user/login.response.dto';
import { IJwtPayload } from '../../common/interfaces/common/jwt-payload.interface';
import * as bcrypt from 'bcrypt'; // Бібліотека для хешування паролів

/**
 * Сервіс автентифікації
 * Відповідає за логіку автентифікації користувачів, генерацію та валідацію JWT токенів
 */
@Injectable()
export class AuthService {
  // Створення логера для запису подій сервісу
  private readonly logger = new Logger(AuthService.name);

  /**
   * Конструктор сервісу з ін'єкцією залежностей
   * @param usersService - сервіс для роботи з користувачами
   * @param jwtService - сервіс для роботи з JWT токенами
   * @param configService - сервіс для доступу до конфігурації
   */
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Метод для автентифікації користувача
   * @param email - електронна пошта користувача
   * @param password - пароль користувача
   * @returns об'єкт з токенами доступу та оновлення
   */
  async signIn(email: string, password: string): Promise<LoginResponseDTO> {
    try {
      // Пошук користувача за електронною поштою
      const user = await this.usersService.findByEmailForAuth(email);
      if (!user) {
        // Якщо користувача не знайдено, логуємо попередження та викидаємо помилку
        this.logger.warn(`Login attempt failed: User with email ${email} not found`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Перевірка правильності пароля
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // Якщо пароль неправильний, логуємо попередження та викидаємо помилку
        this.logger.warn(`Login attempt failed: Invalid password for user ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Створення корисного навантаження для JWT токена
      const payload: IJwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role?.name ?? 'USER', // Якщо роль не визначена, використовуємо 'USER'
      };

      // Отримання секретного ключа для підпису JWT
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        // Якщо секретний ключ не налаштований, логуємо помилку
        this.logger.error('JWT_SECRET is not defined in the configuration');
        throw new Error('JWT_SECRET is not configured');
      }

      // Отримання часу життя токенів з конфігурації
      const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
      const jwtRefreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

      // Генерація токену доступу
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      });

      // Генерація токену оновлення
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: jwtRefreshExpiresIn,
      });

      // Логування успішного входу
      this.logger.log(`User ${email} signed in successfully`);

      // Повернення токенів
      return { accessToken, refreshToken };
    } catch (error) {
      // Логування помилки при невдалій спробі входу
      this.logger.error(`Sign-in failed for ${email}: ${error.message}`);
      // Перекидання помилки далі, зберігаючи тип помилки якщо це UnauthorizedException
      throw error instanceof UnauthorizedException ? error : new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Метод для валідації JWT токена
   * @param token - JWT токен для перевірки
   * @returns корисне навантаження токена або null якщо токен недійсний
   */
  async validateToken(token: string): Promise<IJwtPayload | null> {
    try {
      // Отримання секретного ключа для перевірки JWT
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        // Якщо секретний ключ не налаштований, логуємо помилку
        this.logger.error('JWT_SECRET is not defined in the configuration');
        throw new Error('JWT_SECRET is not configured');
      }

      // Перевірка та декодування токена
      const payload = await this.jwtService.verifyAsync<IJwtPayload>(token, {
        secret: jwtSecret,
      });

      // Логування успішної валідації
      this.logger.log(`Token validated successfully for user ${payload.email}`);

      return payload;
    } catch (error) {
      // Логування попередження при невдалій валідації
      this.logger.warn(`Token validation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Метод для оновлення токену доступу
   * @param refreshToken - токен оновлення
   * @returns об'єкт з новим токеном доступу та існуючим токеном оновлення
   */
  async refreshToken(refreshToken: string): Promise<LoginResponseDTO> {
    try {
      // Валідація токену оновлення
      const payload = await this.validateToken(refreshToken);
      if (!payload) {
        // Якщо токен недійсний, логуємо попередження та викидаємо помилку
        this.logger.warn(`Refresh token invalid`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Пошук користувача за ідентифікатором з токена
      const user = await this.usersService.findById(payload.id);
      if (!user) {
        // Якщо користувача не знайдено, логуємо попередження та викидаємо помилку
        this.logger.warn(`Refresh token failed: User with ID ${payload.id} not found`);
        throw new UnauthorizedException('Invalid user');
      }

      // Створення нового корисного навантаження для JWT токена
      const newPayload: IJwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      // Отримання секретного ключа для підпису JWT
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        // Якщо секретний ключ не налаштований, логуємо помилку
        this.logger.error('JWT_SECRET is not defined in the configuration');
        throw new Error('JWT_SECRET is not configured');
      }

      // Отримання часу життя токену доступу з конфігурації
      const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');

      // Генерація нового токену доступу
      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      });

      // Логування успішного оновлення токену
      this.logger.log(`Token refreshed successfully for user ${user.email}`);

      // Повернення нового токену доступу та існуючого токену оновлення
      return { accessToken, refreshToken };
    } catch (error) {
      // Логування помилки при невдалому оновленні токену
      this.logger.error(`Refresh token failed: ${error.message}`);
      throw new UnauthorizedException('Token refresh failed');
    }
  }
}
