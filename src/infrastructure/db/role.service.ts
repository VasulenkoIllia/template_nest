import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Role } from '@prisma/client'; // Використовуємо тип Role з Prisma

// Сервіс для керування ролями в базі даних
@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Отримує всі ролі з бази даних
  async getAllRoles(): Promise<Role[]> {
    try {
      const roles = await this.prisma.client.role.findMany();
      this.logger.log(`Retrieved ${roles.length} roles from the database.`);
      return roles;
    } catch (error) {
      this.logger.error(`Failed to retrieve roles: ${error.message}`);
      throw error;
    }
  }

  // Створює початкові ролі (наприклад, ADMIN, USER)
  async createInitialRoles(): Promise<void> {
    try {
      const defaultRoles = [
        { name: 'ADMIN', description: 'Administrator role with full permissions' },
        { name: 'USER', description: 'Standard user role with limited permissions' },
      ];

      for (const role of defaultRoles) {
        const existingRole = await this.prisma.client.role.findUnique({
          where: { name: role.name },
        });

        if (!existingRole) {
          await this.prisma.client.role.create({
            data: {
              name: role.name,
              description: role.description,
            },
          });
          this.logger.log(`Created role: ${role.name}`);
        } else {
          this.logger.log(`Role ${role.name} already exists, skipping creation.`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to create initial roles: ${error.message}`);
      throw error;
    }
  }

  // Додає нову роль (для майбутнього розширення)
  async createRole(name: string, description?: string): Promise<Role> {
    try {
      const role = await this.prisma.client.role.create({
        data: {
          name,
          description,
        },
      });
      this.logger.log(`Created new role: ${name}`);
      return role;
    } catch (error) {
      this.logger.error(`Failed to create role ${name}: ${error.message}`);
      throw error;
    }
  }

  // Видаляє роль за назвою (для майбутнього розширення)
  async deleteRole(name: string): Promise<void> {
    try {
      await this.prisma.client.role.delete({
        where: { name },
      });
      this.logger.log(`Deleted role: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to delete role ${name}: ${error.message}`);
      throw error;
    }
  }
}
