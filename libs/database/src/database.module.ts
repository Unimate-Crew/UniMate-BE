import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MySqlDriver } from '@mikro-orm/mysql';
import { LoadStrategy } from '@mikro-orm/core';
import * as path from 'path';
import { User } from './entites/user/user.entity';
import { UsState } from './entites/region/us-state.entity';
import { UsCounty } from './entites/region/us-county.entity';
import { Region } from './entites/region/region.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        driver: MySqlDriver,
        discovery: {
          warnWhenNoEntities: false,
        },
        autoLoadEntities: true,
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        user: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        dbName: configService.get('DB_NAME'),
        loadStrategy: LoadStrategy.JOINED,
        migrations: {
          tableName: 'mikro_orm_migrations',
          path: path.join(__dirname, '../../migrations'),
          pathTs: path.join(__dirname, '../../migrations'),
          glob: '!(*.d).{js,ts}',
          transactional: true,
          disableForeignKeys: true,
          allOrNothing: true,
          dropTables: false,
          safe: false,
          snapshot: true,
        },
        seeder: {
          path: path.join(__dirname, '../../seeders'),
          defaultSeeder: 'DatabaseSeeder',
          glob: '!(*.d).{js,ts}',
        },
        debug: true,
      }),
    }),
    MikroOrmModule.forFeature([User, UsState, UsCounty, Region]),
  ],
  exports: [MikroOrmModule],
})
export class DatabaseModule {}
