import { defineConfig } from '@mikro-orm/mysql';
import { LoadStrategy } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 환경 변수 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = defineConfig({
  // 엔티티 수동 지정 대신 자동 검색 설정
  entities: ['./dist/libs/database/src/entites/**/*.entity.js'],
  entitiesTs: ['./libs/database/src/entites/**/*.entity.ts'],
  discovery: {
    warnWhenNoEntities: false, // 엔티티가 없어도 경고하지 않음
    requireEntitiesArray: false, // 엔티티 배열 필수 여부
    alwaysAnalyseProperties: true, // 항상 프로퍼티 분석
  },
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  debug: true,
  loadStrategy: LoadStrategy.JOINED,
  metadataProvider: TsMorphMetadataProvider,
  migrations: {
    tableName: 'mikro_orm_migrations', // 마이그레이션 테이블 이름
    path: path.join(__dirname, './migrations'), // 마이그레이션 파일 저장 경로
    glob: '!(*.d).{js,ts}', // 마이그레이션 파일 패턴
    transactional: true, // 트랜잭션 사용 여부
    disableForeignKeys: true, // 마이그레이션 실행 시 외래키 제약조건 비활성화
    allOrNothing: true, // 모든 마이그레이션을 한 번에 실행
    dropTables: false, // 테이블 드롭 여부
    safe: false, // 안전 모드 (프로덕션에서는 true로 설정)
    snapshot: true, // 스냅샷 생성 여부
  },
  seeder: {
    path: path.join(__dirname, './seeders'), // 시더 파일 저장 경로
    defaultSeeder: 'DatabaseSeeder', // 기본 시더 클래스 이름
    glob: '!(*.d).{js,ts}', // 시더 파일 패턴
  },
});

export default config;
