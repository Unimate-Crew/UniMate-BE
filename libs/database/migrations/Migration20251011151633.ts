import { Migration } from '@mikro-orm/migrations';

export class Migration20251011151633 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`trade_progress\` (\`id\` bigint unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`product_post_id\` int not null, \`buyer_id\` int not null, \`status\` enum('RESERVED', 'COMPLETED') not null) default character set utf8mb4 engine = InnoDB;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);
  }

}
