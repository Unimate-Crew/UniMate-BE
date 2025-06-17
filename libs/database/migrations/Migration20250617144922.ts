import { Migration } from '@mikro-orm/migrations';

export class Migration20250617144922 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`region\` add \`country_code\` varchar(255) null, add \`admin1_code\` varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`region\` drop column \`country_code\`, drop column \`admin1_code\`;`);
  }

}
