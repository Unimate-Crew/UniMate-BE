import { Migration } from '@mikro-orm/migrations';

export class Migration20260208162841 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`terms\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`type\` enum('AGE_VERIFICATION', 'SERVICE_TERMS', 'PRIVACY_POLICY') not null, \`title\` varchar(255) not null, \`url\` varchar(255) not null, \`is_required\` tinyint(1) not null default true, \`is_active\` tinyint(1) not null default true, \`display_order\` int not null default 1) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`user_agreement\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`user_id\` int not null, \`terms_id\` int not null, \`agreed_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
  }

}
