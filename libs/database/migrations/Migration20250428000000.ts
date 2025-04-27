import { Migration } from '@mikro-orm/migrations';

export class Migration20250428000000 extends Migration {
  async up(): Promise<void> {
    // us_state 테이블 생성
    this.addSql(`
      create table us_state (
        id varchar(2) not null primary key,
        name varchar(100) not null,
        stusab varchar(10) null,
        land_area bigint null,
        water_area bigint null,
        land_sqmi decimal(10, 2) null,
        water_sqmi decimal(10, 2) null,
        latitude decimal(10, 6) null,
        longitude decimal(10, 6) null
      );
    `);

    // us_county 테이블 생성 (외래키 포함)
    this.addSql(`
      create table us_county (
        id varchar(5) not null primary key,
        name varchar(100) not null,
        state_id varchar(2) not null,
        land_area bigint null,
        water_area bigint null,
        land_sqmi decimal(10, 2) null,
        water_sqmi decimal(10, 2) null,
        latitude decimal(10, 6) null,
        longitude decimal(10, 6) null,
        constraint fk_state foreign key (state_id) references us_state (id)
      );
    `);

    // us_city 테이블 생성 (외래키 포함)
    this.addSql(`
      create table us_city (
        id varchar(20) not null primary key,
        name varchar(100) not null,
        state_id varchar(2) not null,
        county_id varchar(5) null,
        latitude decimal(10, 6) null,
        longitude decimal(10, 6) null,
        population bigint null,
        constraint fk_city_state foreign key (state_id) references us_state (id)
      );
    `);

    // user 테이블 생성 (이미 존재할 경우 수정)
    this.addSql(`
      create table if not exists user (
        id int unsigned not null auto_increment primary key,
        email varchar(255) not null,
        provider enum('NAVER', 'KAKAO') not null,
        provider_id varchar(255) not null,
        nickname varchar(255) not null,
        profile_image_url varchar(255) null,
        is_sign_up_completed tinyint(1) not null default false,
        created_at datetime not null,
        updated_at datetime not null
      );
    `);
  }

  async down(): Promise<void> {
    // 외래키 참조 관계를 고려한 역순으로 테이블 삭제
    this.addSql('drop table if exists us_city;');
    this.addSql('drop table if exists us_county;');
    this.addSql('drop table if exists us_state;');
    this.addSql('drop table if exists user;');
  }
}
