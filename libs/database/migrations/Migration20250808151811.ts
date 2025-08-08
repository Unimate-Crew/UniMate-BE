import { Migration } from '@mikro-orm/migrations';

export class Migration20250808151811 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`product_post\` add \`is_hidden\` tinyint(1) not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`alter table \`product_post\` drop column \`is_hidden\`;`);
  }

}
