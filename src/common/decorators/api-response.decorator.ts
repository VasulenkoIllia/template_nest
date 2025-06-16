import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResultDTO } from '../dto/common/paginated-result.dto';
import { SearchParameterDTO } from '../dto/common/search-parameter.dto';

// Список базових типів JavaScript, які не потребують $ref у Swagger
const valueTypes: string[] = ['Boolean', 'Number', 'String', 'BigInt', 'Symbol'];

// Декоратор для документування API-відповіді з одним об’єктом
export const ApiResponse = <DataDto extends Type<unknown>>(dataDto: DataDto) => {
  return applyDecorators(
    ApiExtraModels(dataDto),
    ApiOkResponse({
      description: `Successful response with a single ${dataDto.name}`,
      schema: {
        type: 'object',
        properties: {
          data: valueTypes.includes(dataDto.name)
            ? { type: dataDto.name.toLowerCase() }
            : { $ref: getSchemaPath(dataDto) },
        },
      },
    }),
  );
};

// Декоратор для документування API-відповіді з масивом об’єктів
export const ApiArrayResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) => {
  return applyDecorators(
    ApiExtraModels(dataDto),
    ApiOkResponse({
      description: `Successful response with an array of ${dataDto.name}`,
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: valueTypes.includes(dataDto.name)
              ? { type: dataDto.name.toLowerCase() }
              : { $ref: getSchemaPath(dataDto) },
          },
        },
      },
    }),
  );
};

// Декоратор для документування API-відповіді з пагінованими результатами
export const ApiPaginatedResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) => {
  return applyDecorators(
    ApiExtraModels(PaginatedResultDTO, dataDto),
    ApiOkResponse({
      description: `Successful paginated response with ${dataDto.name} items`,
      schema: {
        type: 'object',
        properties: {
          data: {
            allOf: [
              { $ref: getSchemaPath(PaginatedResultDTO) },
              {
                properties: {
                  items: {
                    type: 'array',
                    items: valueTypes.includes(dataDto.name)
                      ? { type: dataDto.name.toLowerCase() }
                      : { $ref: getSchemaPath(dataDto) },
                  },
                },
              },
            ],
          },
        },
      },
    }),
  );
};

// Декоратор для документування параметрів пошуку
export const ApiSearchParameter = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) => {
  return applyDecorators(
    ApiExtraModels(SearchParameterDTO, dataDto),
    ApiOkResponse({
      description: `Search parameters for ${dataDto.name}`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SearchParameterDTO) },
          {
            properties: {
              searchBy: {
                type: 'array',
                items: valueTypes.includes(dataDto.name)
                  ? { type: dataDto.name.toLowerCase() }
                  : { $ref: getSchemaPath(dataDto) },
              },
            },
          },
        ],
      },
    }),
  );
};
