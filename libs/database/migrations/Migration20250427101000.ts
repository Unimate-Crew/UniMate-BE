import { Migration } from '@mikro-orm/migrations';

export class Migration20250427101000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`us_city\` drop foreign key \`fk_city_state\`;`);

    this.addSql(`alter table \`us_county\` drop foreign key \`fk_state\`;`);

    this.addSql(`alter table \`us_city\` drop index \`fk_city_state\`;`);

    this.addSql(`alter table \`us_city\` modify \`id\` varchar(255) not null, modify \`name\` varchar(255) not null, modify \`state_id\` varchar(255) not null, modify \`county_id\` varchar(255);`);

    this.addSql(`alter table \`us_county\` drop index \`fk_state\`;`);

    this.addSql(`alter table \`us_county\` modify \`id\` varchar(255) not null, modify \`name\` varchar(255) not null, modify \`state_id\` varchar(255) not null;`);

    this.addSql(`alter table \`user\` add \`name\` varchar(255) null, add \`phone_number\` varchar(255) null, add \`test\` varchar(255) null, add \`refresh_token\` varchar(255) null;`);
    this.addSql(`alter table \`user\` modify \`email\` varchar(255) null, modify \`provider_id\` varchar(255) null;`);

    this.addSql(`alter table \`us_state\` modify \`id\` varchar(255) not null, modify \`name\` varchar(255) not null, modify \`stusab\` varchar(255);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`us_city\` modify \`id\` varchar(20) not null, modify \`name\` varchar(100) not null, modify \`state_id\` varchar(2) not null, modify \`county_id\` varchar(5);`);
    this.addSql(`alter table \`us_city\` add constraint \`fk_city_state\` foreign key (\`state_id\`) references \`us_state\` (\`id\`) on update no action on delete no action;`);
    this.addSql(`alter table \`us_city\` add index \`fk_city_state\`(\`state_id\`);`);

    this.addSql(`alter table \`us_county\` modify \`id\` varchar(5) not null, modify \`name\` varchar(100) not null, modify \`state_id\` varchar(2) not null;`);
    this.addSql(`alter table \`us_county\` add constraint \`fk_state\` foreign key (\`state_id\`) references \`us_state\` (\`id\`) on update no action on delete no action;`);
    this.addSql(`alter table \`us_county\` add index \`fk_state\`(\`state_id\`);`);

    this.addSql(`alter table \`us_state\` modify \`id\` varchar(2) not null, modify \`name\` varchar(100) not null, modify \`stusab\` varchar(10);`);

    this.addSql(`alter table \`user\` drop column \`name\`, drop column \`phone_number\`, drop column \`test\`, drop column \`refresh_token\`;`);

    this.addSql(`alter table \`user\` modify \`email\` varchar(255) not null, modify \`provider_id\` varchar(255) not null;`);
  }

}
