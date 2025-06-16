// Імпорт необхідних модулів та залежностей
import { Module } from '@nestjs/common'; // Основний декоратор для створення модулів NestJS
import { UserModule } from './components/user/user.module'; // Модуль для роботи з користувачами
import { AuthModule } from './components/auth/auth.module'; // Модуль для автентифікації
import { AppConfigInfrastructureModule } from './infrastructure/app-config/app-config.infrastructure.module'; // Модуль конфігурації додатку
import { DbInfrastructureModule } from './infrastructure/db/db.infrastructure.module'; // Модуль для роботи з базою даних
import { MappingInfrastructureModule } from './infrastructure/mapping/mapping.infrastructure.module'; // Модуль для маппінгу об'єктів

/**
 * Головний модуль додатку
 * Відповідає за конфігурацію та ініціалізацію всіх компонентів системи
 */
@Module({
  imports: [
    AppConfigInfrastructureModule, // Імпорт модуля конфігурації додатку
    DbInfrastructureModule, // Імпорт модуля для роботи з базою даних
    MappingInfrastructureModule.registerProfilesAsync(), // Імпорт та реєстрація профілів маппінгу
    UserModule, // Імпорт модуля для роботи з користувачами
    AuthModule, // Імпорт модуля для автентифікації
  ],
})
/**
 * Клас головного модуля додатку
 * Служить точкою входу для NestJS фреймворку
 */
export class AppModule {
  // Клас порожній, оскільки вся конфігурація відбувається через декоратор @Module
}
