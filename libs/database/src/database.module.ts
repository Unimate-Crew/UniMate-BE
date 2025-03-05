import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MySqlDriver } from '@mikro-orm/mysql';
import { DatabaseService } from './database.service';
import { User } from './entity/user/user.entity';

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
        migrations: {
          path: 'migrations',
          pathTs: 'migrations',
        },
        debug: true,
      }),
    }),
    MikroOrmModule.forFeature([User])
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, MikroOrmModule],
})
export class DatabaseModule {}
