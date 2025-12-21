import { Migration } from '@mikro-orm/migrations';

export class Migration20251221071624 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`like\` modify \`updated_at\` datetime not null;`,
    );

    this.addSql(`alter table \`product_post\` drop column \`university_id\`;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `alter table \`like\` modify \`updated_at\` datetime not null default CURRENT_TIMESTAMP;`,
    );

    this.addSql(`alter table \`product_post\` add \`university_id\` int null;`);
  }
}
