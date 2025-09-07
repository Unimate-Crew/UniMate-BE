import { Migration } from '@mikro-orm/migrations';

export class Migration20250906150946 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`conversation\` (\`id\` bigint unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`product_post_id\` int not null, \`last_message_number\` bigint null, \`last_sent_at\` datetime null) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`conversation_message\` (\`id\` bigint unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`conversation_id\` int not null, \`sender_id\` int not null, \`message_number\` bigint not null, \`content\` text null, \`type\` enum('TEXT', 'IMAGE', 'VIDEO', 'SYSTEM') not null default 'TEXT') default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`conversation_participant\` (\`id\` bigint unsigned not null auto_increment primary key, \`is_deleted\` tinyint(1) not null default false, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`deleted_at\` datetime null, \`conversation_id\` int not null, \`user_id\` int not null, \`last_read_message_number\` int null, \`left_at\` datetime null, \`status\` enum('JOIN', 'PRES', 'BLOCK', 'MUTE') not null default 'JOIN') default character set utf8mb4 engine = InnoDB;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );
  }
}
