import { Injectable, Logger } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common/interfaces';
import { AppConfig } from '../app-config/app-config.infrastructure';


@Injectable()
export class SwaggerInfrastructure {
  private readonly logger = new Logger(SwaggerInfrastructure.name);
  private readonly swaggerUrl = '/swagger';
  private readonly swaggerFileName = 'swagger.json';

  constructor(private readonly appConfig: AppConfig) {}

  // Ініціалізація Swagger для додатку
  public initialize(app: INestApplication): void {
    try {
      const swaggerDoc = this.getSwaggerSpecDocument(app);

      SwaggerModule.setup(this.swaggerUrl, app, swaggerDoc, {
        explorer: true,
        swaggerOptions: {
          persistAuthorization: true,
          urls: [{ url: `/${this.swaggerFileName}`, name: 'API' }],
        },
      });

      this.logger.log(`Swagger UI initialized at ${this.swaggerUrl}`);
      this.logger.log(`Swagger JSON available at /${this.swaggerFileName}`);
    } catch (error) {
      this.logger.error(`Failed to initialize Swagger: ${error.message}`);
      throw error;
    }
  }

  // Генерація Swagger-документа
  private getSwaggerSpecDocument(app: INestApplication): OpenAPIObject {
    const title = this.appConfig.SWAGGER_TITLE || 'Banners API';
    const description = this.appConfig.SWAGGER_DESCRIPTION || 'API for managing banners';

    const options = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build();

    return SwaggerModule.createDocument(app, options);
  }
}
