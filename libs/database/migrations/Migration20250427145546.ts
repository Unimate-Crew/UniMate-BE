import { Migration } from '@mikro-orm/migrations';

export class Migration20250427145546 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10, 6) null, \`longitude\` decimal(10, 6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`us_county\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`land_area\` bigint null, \`water_area\` bigint null, \`land_sqmi\` decimal(10, 2) null, \`water_sqmi\` decimal(10, 2) null, \`latitude\` decimal(10, 6) null, \`longitude\` decimal(10, 6) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`user\` (\`id\` int unsigned not null auto_increment primary key, \`email\` varchar(255) null, \`name\` varchar(255) null, \`nickname\` varchar(255) not null, \`profile_image_url\` varchar(255) null, \`phone_number\` varchar(255) null, \`provider\` enum('NAVER', 'KAKAO') not null, \`provider_id\` varchar(255) null, \`refresh_token\` varchar(255) null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`is_sign_up_completed\` tinyint(1) not null default false) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`us_state\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`stusab\` varchar(255) null, \`land_area\` bigint null, \`water_area\` bigint null, \`land_sqmi\` decimal(10, 2) null, \`water_sqmi\` decimal(10, 2) null, \`latitude\` decimal(10, 6) null, \`longitude\` decimal(10, 6) null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );
  }
}
