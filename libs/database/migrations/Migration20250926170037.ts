import { Migration } from '@mikro-orm/migrations';

export class Migration20250926170037 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`conversation_participant\` drop column \`status\`;`,
    );

    this.addSql(
      `alter table \`conversation_participant\` add \`is_blocking_other\` tinyint(1) not null default false, add \`is_muted\` tinyint(1) not null default false;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `alter table \`conversation_participant\` drop column \`is_blocking_other\`, drop column \`is_muted\`;`,
    );

    this.addSql(
      `alter table \`conversation_participant\` add \`status\` json not null;`,
    );
  }
}
