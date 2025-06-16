import { Injectable } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common/interfaces';
import { HttpAdapterHost, ModulesContainer } from '@nestjs/core';
import { appConfigInstance } from '../app-config/app-config.infrastructure';

@Injectable()
export class SwaggerInfrastucture {
  private readonly swaggerUrl: string = '/swagger';
  private readonly swaggerFileName: string = 'swagger.json';
  private readonly swaggerTitle: string = appConfigInstance.SWAGGER_TITLE;
  private readonly swaggerDescription: string = appConfigInstance.SWAGGER_DESCRIPTION;

  // Ініціалізація Swagger для додатку
  public initialize(app: INestApplication) {
    const httpAdapterHost: HttpAdapterHost = app.get(HttpAdapterHost);
    const httpAdapter = httpAdapterHost.httpAdapter;

    const swaggerDoc: OpenAPIObject = this.getSwaggerSpecDocument(app);
    const swaggerUrl = `/${this.swaggerFileName}`;

    httpAdapter.get(swaggerUrl, (req, res) => {
      res.json(swaggerDoc);
    });

    SwaggerModule.setup(this.swaggerUrl, app, undefined, {
      explorer: true,
      swaggerOptions: {
        urls: [{ url: swaggerUrl, name: 'api' }],
      },
    });
  }

  // Генерація Swagger-документа з використанням зареєстрованих модулів
  private getSwaggerSpecDocument(app: INestApplication): OpenAPIObject {
    const modulesContainer = app.get(ModulesContainer);
    const modules = Array.from(modulesContainer.values()).map(module => module.metatype);
    const options = new DocumentBuilder()
      .setTitle(this.swaggerTitle)
      .setDescription(this.swaggerDescription)
      .addBearerAuth()
      .build();
    return SwaggerModule.createDocument(app, options, { include: modules });
  }
}

class SwaggerDocInfo {
  public doc: OpenAPIObject;
  public name: string;
  public url: string;
}