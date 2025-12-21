import { Migration } from '@mikro-orm/migrations';

export class Migration20251208135220 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`like\` add \`is_deleted\` tinyint(1) not null default false, add \`updated_at\` datetime not null default CURRENT_TIMESTAMP, add \`deleted_at\` datetime null;`);

    this.addSql(`alter table \`notification\` modify \`notification_type\` enum('SALE_ENDED', 'PRICE_CHANGED', 'NEW_CHAT_MESSAGE') not null;`);

    this.addSql(`alter table \`user\` drop index \`user_nickname_unique\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`alter table \`like\` drop column \`is_deleted\`, drop column \`updated_at\`, drop column \`deleted_at\`;`);

    this.addSql(`alter table \`notification\` modify \`notification_type\` enum('SALE_ENDED', 'PRICE_CHANGED') not null;`);

    this.addSql(`alter table \`user\` add unique \`user_nickname_unique\`(\`nickname\`);`);
  }

}
