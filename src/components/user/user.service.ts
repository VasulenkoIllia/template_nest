// Імпорт необхідних модулів та залежностей
import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt'; // Бібліотека для хешування паролів
import { PrismaService } from '../../infrastructure/db/prisma.service';
import { UserResponseDTO, UserWithRole } from '../../common/dto/user/user.response.dto';

/**
 * Сервіс для роботи з користувачами
 * Відповідає за створення, пошук та перевірку користувачів
 */
@Injectable()
export class UserService implements OnModuleInit {
  // Створення логера для запису подій сервісу
  private readonly logger = new Logger(UserService.name);

  /**
   * Конструктор сервісу з ін'єкцією залежностей
   * @param prisma - сервіс для роботи з базою даних через Prisma ORM
   * @param configService - сервіс для доступу до конфігурації
   */
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Метод, що виконується при ініціалізації модуля
   * Реалізує інтерфейс OnModuleInit
   */
  async onModuleInit() {
    this.logger.log('UserService initialized.');
  }

  /**
   * Перевіряє чи існує користувач з вказаною електронною поштою
   * @param email - електронна пошта для перевірки
   * @returns true якщо користувач існує, false якщо ні
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      // Пошук користувача за електронною поштою
      const user = await this.prisma.client.user.findUnique({
        where: { email },
      });
      return !!user; // Перетворення об'єкта на булеве значення
    } catch (error) {
      // Логування помилки при невдалій перевірці
      this.logger.error(`Failed to check user existence: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }

  /**
   * Створює користувача з роллю адміністратора
   * @param email - електронна пошта нового адміністратора
   * @param password - пароль нового адміністратора
   * @returns об'єкт з даними створеного адміністратора
   */
  async createAdminUser(email: string, password: string): Promise<UserResponseDTO> {
    try {
      // Пошук ролі адміністратора в базі даних
      const adminRole = await this.prisma.client.role.findUnique({
        where: { name: 'ADMIN' },
      });

      // Перевірка наявності ролі адміністратора
      if (!adminRole) {
        this.logger.error('ADMIN role does not exist.');
        throw new Error('ADMIN role not found.');
      }

      // Отримання кількості раундів хешування з конфігурації
      const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
      // Хешування пароля
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Створення користувача в базі даних
      const user = await this.prisma.client.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: adminRole.id,
        },
        include: { role: true }, // Включення даних про роль у результат
      });

      // Логування успішного створення адміністратора
      this.logger.log(`Admin user created successfully: ${email}`);

      // Повернення даних створеного користувача
      return {
        id: user.id,
        email: user.email,
        role: user.role?.name ?? 'USER', // Якщо роль не визначена, використовуємо 'USER'
      };
    } catch (error) {
      // Логування помилки при невдалому створенні адміністратора
      this.logger.error(`Failed to create admin user: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }

  /**
   * Знаходить користувача за ідентифікатором
   * @param id - ідентифікатор користувача
   * @returns об'єкт з даними користувача або null якщо користувача не знайдено
   */
  async findById(id: number): Promise<UserResponseDTO | null> {
    try {
      // Перевірка валідності ідентифікатора
      if (!id || isNaN(id)) {
        this.logger.warn(`Invalid user ID: ${id}`);
        throw new BadRequestException('Invalid user ID');
      }

      // Пошук користувача за ідентифікатором
      const user = await this.prisma.client.user.findUnique({
        where: { id },
        include: { role: true }, // Включення даних про роль у результат
      });

      // Якщо користувача не знайдено, повертаємо null
      if (!user) {
        return null;
      }

      // Повернення даних знайденого користувача
      return {
        id: user.id,
        email: user.email,
        role: user.role?.name ?? 'USER', // Якщо роль не визначена, використовуємо 'USER'
      };
    } catch (error) {
      // Логування помилки при невдалому пошуку користувача
      this.logger.error(`Failed to find user by ID ${id}: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }

  /**
   * Знаходить користувача за електронною поштою
   * @param email - електронна пошта користувача
   * @returns об'єкт з даними користувача або null якщо користувача не знайдено
   */
  async findByEmail(email: string): Promise<UserResponseDTO | null> {
    try {
      // Пошук користувача за електронною поштою
      const user = await this.prisma.client.user.findUnique({
        where: { email },
        include: { role: true }, // Включення даних про роль у результат
      });

      // Якщо користувача не знайдено, повертаємо null
      if (!user) {
        return null;
      }

      // Повернення даних знайденого користувача
      return {
        id: user.id,
        email: user.email,
        role: user.role?.name ?? 'USER', // Якщо роль не визначена, використовуємо 'USER'
      };
    } catch (error) {
      // Логування помилки при невдалому пошуку користувача
      this.logger.error(`Failed to find user by email ${email}: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }

  /**
   * Знаходить користувача за електронною поштою для автентифікації
   * Повертає повні дані користувача включно з паролем для перевірки
   * @param email - електронна пошта користувача
   * @returns повний об'єкт користувача або null якщо користувача не знайдено
   */
  async findByEmailForAuth(email: string): Promise<UserWithRole | null> {
    try {
      // Пошук користувача за електронною поштою
      const user = await this.prisma.client.user.findUnique({
        where: { email },
        include: { role: true }, // Включення даних про роль у результат
      });

      // Якщо користувача не знайдено, повертаємо null
      if (!user) {
        return null;
      }

      // Повернення повних даних користувача
      return user as UserWithRole;
    } catch (error) {
      // Логування помилки при невдалому пошуку користувача
      this.logger.error(`Failed to find user by email for auth ${email}: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }

  /**
   * Створює нового користувача з вказаною роллю
   * @param email - електронна пошта нового користувача
   * @param password - пароль нового користувача
   * @param roleName - назва ролі для нового користувача
   * @returns об'єкт з даними створеного користувача
   */
  async createUser(email: string, password: string, roleName: string): Promise<UserResponseDTO> {
    try {
      // Пошук ролі за назвою
      const role = await this.prisma.client.role.findUnique({
        where: { name: roleName },
      });

      // Перевірка наявності ролі
      if (!role) {
        this.logger.error(`Role ${roleName} does not exist.`);
        throw new Error(`Role ${roleName} not found.`);
      }

      // Отримання кількості раундів хешування з конфігурації
      const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
      // Хешування пароля
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Створення користувача в базі даних
      const user = await this.prisma.client.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: role.id,
        },
        include: { role: true }, // Включення даних про роль у результат
      });

      // Логування успішного створення користувача
      this.logger.log(`User created successfully: ${email}`);

      // Повернення даних створеного користувача
      return {
        id: user.id,
        email: user.email,
        role: user.role?.name ?? 'USER', // Якщо роль не визначена, використовуємо 'USER'
      };
    } catch (error) {
      // Логування помилки при невдалому створенні користувача
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error; // Перекидання помилки далі
    }
  }
}
