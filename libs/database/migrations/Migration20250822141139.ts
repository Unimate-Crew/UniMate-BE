import { Migration } from '@mikro-orm/migrations';

export class Migration20250822141139 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`user\` add \`price_changed_notification_enabled\` tinyint(1) not null default true, add \`sale_ended_notification_enabled\` tinyint(1) not null default true;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `alter table \`user\` drop column \`price_changed_notification_enabled\`, drop column \`sale_ended_notification_enabled\`;`,
    );
  }
}
