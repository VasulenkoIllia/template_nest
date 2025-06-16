import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { RoleService } from './role.service';
import { envValidationSchema, EnvVariables } from '../app-config/env-variables';
import { appConfigProvider } from '../app-config/app-config.infrastructure';
import { UserService } from '../../components/user/user.service';
import { AuthService } from '../../components/auth/auth.service';
import { DbInfrastructure } from './db.infrastructure';
import { JwtGuard } from '../../components/auth/guards/jwt.guard';


@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService<EnvVariables>) => ({
        secret: configService.get<string>('JWT_SECRET', 'default-secret'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    appConfigProvider,
    PrismaService,
    RoleService,
    UserService,
    AuthService,
    DbInfrastructure,
    JwtGuard,
  ],
  exports: [
    appConfigProvider,
    PrismaService,
    RoleService,
    UserService,
    AuthService,
    DbInfrastructure,
    JwtGuard,
  ],
})
export class DbInfrastructureModule {}
