import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { AppConfig } from '../app-config/app-config.infrastructure';
import { connectPrisma, disconnectPrisma, prisma } from './prisma.config';



@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly appConfig: AppConfig) {}

  get client() {
    return prisma(this.appConfig);
  }

  async onModuleInit() {
    try {
      await connectPrisma(this.appConfig);
      this.logger.log('PrismaService initialized and connected to the database.');
    } catch (error) {
      this.logger.error(`Failed to initialize PrismaService: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await disconnectPrisma(this.appConfig);
      this.logger.log('PrismaService disconnected from the database.');
    } catch (error) {
      this.logger.error(`Failed to disconnect PrismaService: ${error.message}`);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      await this.client.$executeRaw`TRUNCATE TABLE "Role" CASCADE;`;
      await this.client.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
      this.logger.log('Database cleared successfully.');
    } catch (error) {
      this.logger.error(`Failed to clear database: ${error.message}`);
      throw error;
    }
  }
}
