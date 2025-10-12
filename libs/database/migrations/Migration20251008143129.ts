import { Migration } from '@mikro-orm/migrations';

export class Migration20251008143129 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`user\` add \`university_email\` varchar(255) null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(`alter table \`user\` drop column \`university_email\`;`);
  }
}
