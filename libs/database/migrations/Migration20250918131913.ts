import { Migration } from '@mikro-orm/migrations';

export class Migration20250918131913 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`conversation\` modify \`last_message_number\` bigint not null default 0;`,
    );

    this.addSql(
      `alter table \`conversation_participant\` modify \`last_read_message_number\` bigint not null default 0;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `alter table \`conversation\` modify \`last_message_number\` bigint null;`,
    );

    this.addSql(
      `alter table \`conversation_participant\` modify \`last_read_message_number\` bigint null;`,
    );
  }
}
