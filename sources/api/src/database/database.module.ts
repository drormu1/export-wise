import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './data-source.options';

/**
 * Global TypeORM root connection. Uses forRootAsync so the factory runs during
 * bootstrap (after dotenv has loaded), and re-exports TypeOrmModule so the
 * shared DataSource is injectable everywhere.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => buildDataSourceOptions(),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
