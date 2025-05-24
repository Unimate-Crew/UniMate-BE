import { Migration } from '@mikro-orm/migrations';

export class Migration20250522155459 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`interest_region\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`region_id\` varchar(255) not null, \`user_id\` int not null, \`is_primary\` tinyint(1) not null default false) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`like\` (\`id\` int unsigned not null auto_increment primary key, \`product_id\` int not null, \`user_id\` int not null, \`created_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`product_image\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`product_id\` int not null, \`image_url\` varchar(255) not null, \`is_thumbnail\` tinyint(1) not null default false) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`product_post\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`title\` varchar(255) not null, \`description\` varchar(255) null, \`user_id\` int not null, \`price\` int not null, \`currency_type\` enum('KRW', 'USD') not null, \`category\` enum('ELECTRONICS', 'HOME_APPLIANCES', 'FURNITURE_INTERIOR', 'HOUSEHOLD_KITCHEN', 'WOMENS_CLOTHING', 'WOMENS_ACCESSORIES', 'MENS_FASHION', 'BEAUTY_COSMETICS', 'SPORTS_LEISURE', 'HOBBY_GAME', 'BOOKS_RECORDS', 'TICKETS_VOUCHERS', 'FOOD', 'OTHER_GOODS', 'BUYING') not null, \`trade_status\` enum('FOR_SALE', 'RESERVED', 'COMPLETED') not null, \`trade_type\` enum('DIRECT', 'ONLINE') null, \`trade_type_description\` varchar(255) null, \`region_id\` int not null, \`university_id\` int null) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`region\` (\`id\` varchar(255) not null, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10, 6) null, \`longitude\` decimal(10, 6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`report\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`target_user_id\` int not null, \`user_id\` int not null, \`reason\` varchar(255) not null, \`detail\` varchar(255) null) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`university\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`name\` varchar(255) not null, \`domain\` varchar(255) not null, \`country\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`user_block\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`blocker_id\` int not null, \`blocked_id\` int not null) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `alter table \`user\` drop column \`email\`, drop column \`provider_id\`;`,
    );

    this.addSql(
      `alter table \`user\` add \`deleted_at\` datetime null, add \`university_id\` int null;`,
    );
    this.addSql(
      `alter table \`user\` modify \`name\` varchar(255) not null, modify \`provider\` enum('NAVER', 'KAKAO', 'APPLE') not null;`,
    );
    this.addSql(
      `alter table \`user\` change \`is_sign_up_completed\` \`is_deleted\` tinyint(1) not null default false;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10, 6) null, \`longitude\` decimal(10, 6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(`alter table \`user\` drop index \`user_nickname_unique\`;`);
    this.addSql(
      `alter table \`user\` drop column \`deleted_at\`, drop column \`university_id\`;`,
    );

    this.addSql(
      `alter table \`user\` add \`email\` varchar(255) null, add \`provider_id\` varchar(255) null;`,
    );
    this.addSql(
      `alter table \`user\` modify \`name\` varchar(255) null, modify \`provider\` enum('NAVER', 'KAKAO') not null;`,
    );
    this.addSql(
      `alter table \`user\` change \`is_deleted\` \`is_sign_up_completed\` tinyint(1) not null default false;`,
    );
  }
}
