import { Migration } from '@mikro-orm/migrations';

export class Migration20250615071216 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`notification\` (\`id\` int unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`user_id\` int not null, \`product_id\` int not null, \`product_status\` enum('CHAT', 'LIKE') not null, \`notification_type\` enum('SALE_ENDED', 'PRICE_CHANGED') not null, \`content\` varchar(255) not null, \`is_read\` tinyint(1) not null default false) default character set utf8mb4 engine = InnoDB;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );
  }
}
