import { Migration } from '@mikro-orm/migrations';

export class Migration20251019150329 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`interest_region\` drop foreign key \`interest_region_region_id_foreign\`;`);

    this.addSql(`alter table \`product_post\` modify \`region_id\` int not null;`);

    this.addSql(`alter table \`region\` add \`geoid\` varchar(255) null;`);
    this.addSql(`alter table \`region\` modify \`id\` int unsigned not null auto_increment, modify \`state_id\` int not null, modify \`county_id\` int;`);

    this.addSql(`alter table \`us_county\` add \`geoid\` varchar(255) null;`);
    this.addSql(`alter table \`us_county\` modify \`id\` int unsigned not null auto_increment, modify \`state_id\` int not null;`);

    this.addSql(`alter table \`interest_region\` modify \`region_id\` int unsigned not null;`);
    this.addSql(`alter table \`interest_region\` add constraint \`interest_region_region_id_foreign\` foreign key (\`region_id\`) references \`region\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`us_state\` add \`geoid\` varchar(255) null;`);
    this.addSql(`alter table \`us_state\` modify \`id\` int unsigned not null auto_increment;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`us_city\` (\`id\` varchar(255) not null, \`name\` varchar(255) not null, \`state_id\` varchar(255) not null, \`county_id\` varchar(255) null, \`latitude\` decimal(10,6) null, \`longitude\` decimal(10,6) null, \`population\` bigint null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`alter table \`interest_region\` drop foreign key \`interest_region_region_id_foreign\`;`);

    this.addSql(`alter table \`interest_region\` modify \`region_id\` varchar(255) not null;`);
    this.addSql(`alter table \`interest_region\` add constraint \`interest_region_region_id_foreign\` foreign key (\`region_id\`) references \`region\` (\`id\`) on update cascade on delete no action;`);

    this.addSql(`alter table \`product_post\` modify \`region_id\` varchar(255) not null;`);

    this.addSql(`alter table \`region\` drop column \`geoid\`;`);

    this.addSql(`alter table \`region\` modify \`id\` varchar(255) not null, modify \`state_id\` varchar(255) not null, modify \`county_id\` varchar(255);`);

    this.addSql(`alter table \`us_county\` drop column \`geoid\`;`);

    this.addSql(`alter table \`us_county\` modify \`id\` varchar(255) not null, modify \`state_id\` varchar(255) not null;`);

    this.addSql(`alter table \`us_state\` drop column \`geoid\`;`);

    this.addSql(`alter table \`us_state\` modify \`id\` varchar(255) not null;`);
  }

}
