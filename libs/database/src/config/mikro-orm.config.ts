import { defineConfig } from '@mikro-orm/mysql';
import { LoadStrategy } from '@mikro-orm/core';
import { User } from '../entity/user.entity';

export default defineConfig({
  discovery: {
    warnWhenNoEntities: false,
  },
  // 직접 엔티티 클래스를 지정
  entities: [User],
  
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345!',
  dbName: process.env.DB_NAME || 'market_for_u_dev',

  // 마이그레이션 파일 위치
  migrations: {
    path: 'migrations', // ex: ./migrations
    pathTs: 'migrations', // TS 소스
  },
  debug: true,
});
