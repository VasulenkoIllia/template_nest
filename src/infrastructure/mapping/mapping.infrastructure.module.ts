import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { AutomapperModule, AutomapperProfile } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import * as path from 'path';
import * as fs from 'fs/promises';

@Module({
  imports: [AutomapperModule.forRoot({ strategyInitializer: classes() })],
})
export class MappingInfrastructureModule {
  private static readonly logger = new Logger(MappingInfrastructureModule.name);
  private static readonly pathsToModelsFolder: string[] = [
    path.join(__dirname, '../../common/dto'),
  ];

  static async registerProfilesAsync(): Promise<DynamicModule> {
    try {
      const filesPaths = await this.getAllFilesFromFolders(this.pathsToModelsFolder);
      const automapperProfiles: Provider[] = [];
      for (const pathToFile of filesPaths) {
        if (!['.js', '.ts'].includes(path.extname(pathToFile)) || path.basename(pathToFile) === 'index') {
          continue;
        }
        try {
          const file = await import(pathToFile);
          for (const [, profile] of Object.entries(file)) {
            if (typeof profile === 'function' && profile.prototype instanceof AutomapperProfile) {
              automapperProfiles.push(profile as Provider);
              this.logger.debug(`Registered AutoMapper profile from ${pathToFile}`);
            }
          }
        } catch (error) {
          this.logger.warn(`Failed to import profile from ${pathToFile}: ${error.message}`);
        }
      }
      if (automapperProfiles.length === 0) {
        this.logger.warn('No AutoMapper profiles found in specified folders.');
      }
      return {
        global: true,
        module: MappingInfrastructureModule,
        providers: automapperProfiles,
        exports: automapperProfiles,
      };
    } catch (error) {
      this.logger.error(`Unable to initialize mappings: ${error.message}`);
      throw new Error(`Failed to register AutoMapper profiles: ${error.message}`);
    }
  }

  private static async getAllFilesFromFolders(dirPaths: string[]): Promise<string[]> {
    const resultFiles: string[] = [];
    for (const dirPath of dirPaths) {
      resultFiles.push(...(await this.getAllFilesFromFolder(dirPath)));
    }
    return resultFiles;
  }

  private static async getAllFilesFromFolder(dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
          await this.getAllFilesFromFolder(fullPath, arrayOfFiles);
        } else {
          arrayOfFiles.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to read directory ${dirPath}: ${error.message}`);
    }
    return arrayOfFiles;
  }
}
