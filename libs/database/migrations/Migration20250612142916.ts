import { Migration } from '@mikro-orm/migrations';

export class Migration20250612142916 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`user\` add \`provider_id\` varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`user\` drop column \`provider_id\`;`);
  }

}
