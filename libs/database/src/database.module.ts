import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import mikroOrmConfig from './config/mikro-orm.config';
import { User } from './entity/user.entity';
import { UserRepository } from './repository/user.repository';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    MikroOrmModule.forFeature([User])
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, MikroOrmModule],
})
export class DatabaseModule {}
