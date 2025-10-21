import { Migration } from '@mikro-orm/migrations';

export class Migration20251019094622 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`update_popup\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`platform\` enum('IOS', 'ANDROID') not null, \`version\` varchar(255) not null, \`min_version\` varchar(255) not null, \`title\` varchar(255) not null, \`content\` text not null, \`is_active\` tinyint(1) not null default true) default character set utf8mb4 engine = InnoDB;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
  }

}
