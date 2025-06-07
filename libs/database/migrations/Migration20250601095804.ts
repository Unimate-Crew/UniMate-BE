import { Migration } from '@mikro-orm/migrations';

export class Migration20250601095804 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`interest_region\` modify \`user_id\` int unsigned not null;`,
    );
    this.addSql(
      `alter table \`interest_region\` add constraint \`interest_region_region_id_foreign\` foreign key (\`region_id\`) references \`region\` (\`id\`) on update cascade;`,
    );
    this.addSql(
      `alter table \`interest_region\` add constraint \`interest_region_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade;`,
    );
    this.addSql(
      `alter table \`interest_region\` add index \`interest_region_region_id_index\`(\`region_id\`);`,
    );
    this.addSql(
      `alter table \`interest_region\` add index \`interest_region_user_id_index\`(\`user_id\`);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table \`interest_region\` drop foreign key \`interest_region_region_id_foreign\`;`,
    );
    this.addSql(
      `alter table \`interest_region\` drop foreign key \`interest_region_user_id_foreign\`;`,
    );

    this.addSql(
      `alter table \`interest_region\` drop index \`interest_region_region_id_index\`;`,
    );
    this.addSql(
      `alter table \`interest_region\` drop index \`interest_region_user_id_index\`;`,
    );

    this.addSql(
      `alter table \`interest_region\` modify \`user_id\` int not null;`,
    );
  }
}
