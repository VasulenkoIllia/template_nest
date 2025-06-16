// Імпорт необхідних модулів та залежностей
import 'reflect-metadata'; // Необхідно для роботи декораторів
import { NestFactory } from '@nestjs/core'; // Фабрика для створення NestJS додатку
import { AppModule } from './app.module'; // Головний модуль додатку
import { ValidationPipe } from '@nestjs/common'; // Пайп для валідації вхідних даних
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Модулі для генерації Swagger документації

/**
 * Функція ініціалізації додатку
 * Відповідає за створення та налаштування NestJS додатку
 */
async function bootstrap() {
  // Створення екземпляру NestJS додатку
  const app = await NestFactory.create(AppModule);

  // Налаштування глобальних пайпів для валідації
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Видаляє всі властивості, які не мають декораторів валідації
      transform: true, // Автоматично перетворює примітиви до потрібного типу
    }),
  );

  // Налаштування Swagger документації
  const config = new DocumentBuilder()
    .setTitle('Your API') // Назва API
    .setDescription('API description') // Опис API
    .setVersion('1.0') // Версія API
    .addBearerAuth() // Додавання підтримки Bearer автентифікації
    .build();

  // Створення документації
  const document = SwaggerModule.createDocument(app, config);

  // Налаштування ендпоінту для доступу до Swagger документації
  SwaggerModule.setup('api', app, document);

  // Запуск сервера на порту 3000
  await app.listen(3000);
}

// Виклик функції ініціалізації
bootstrap();
