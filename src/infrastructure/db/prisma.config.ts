import { PrismaClient } from '@prisma/client';
import { AppConfig } from '../app-config/app-config.infrastructure';

// Конфігурація для PrismaClient
export const prismaOptions = (appConfig: AppConfig) => ({
  datasourceUrl: `postgresql://${appConfig.DB_USERNAME}:${appConfig.DB_PASSWORD}@${appConfig.DB_HOST}:${appConfig.DB_PORT}/${appConfig.DB_NAME}?schema=public`,
});

// Ініціалізація PrismaClient з конфігурацією
export const prisma = (appConfig: AppConfig) =>
  new PrismaClient({
    datasourceUrl: prismaOptions(appConfig).datasourceUrl,
    log: [
      { emit: 'stdout', level: 'query' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'error' },
    ],
  });

// Функція для підключення до бази даних
export async function connectPrisma(appConfig: AppConfig): Promise<void> {
  try {
    await prisma(appConfig).$connect();
    console.log('Prisma connected to the database successfully.');
  } catch (error) {
    console.error(`Failed to connect to the database: ${error.message}`);
    throw error;
  }
}

// Функція для відключення від бази даних
export async function disconnectPrisma(appConfig: AppConfig): Promise<void> {
  try {
    await prisma(appConfig).$disconnect();
    console.log('Prisma disconnected from the database successfully.');
  } catch (error) {
    console.error(`Failed to disconnect from the database: ${error.message}`);
    throw error;
  }
}
