import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/db/prisma.service';
import { RoleService } from '../../infrastructure/db/role.service';

// Модуль для роботи з користувачами
@Module({
  imports: [
    // Налаштування конфігурації через .env
    ConfigModule,
  ],
  controllers: [UserController],
  providers: [
    UserService, // Сервіс для керування користувачами
    PrismaService, // Сервіс для роботи з Prisma
    RoleService, // Сервіс для керування ролями
  ],
  exports: [UserService],
})
export class UserModule {}
