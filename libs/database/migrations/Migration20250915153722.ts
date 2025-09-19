import { Migration } from '@mikro-orm/migrations';

export class Migration20250915153722 extends Migration {
  override async up(): Promise<void> {
    // 1단계: 임시 컬럼 추가
    this.addSql(
      'alter table `conversation_participant` add column `status_new` json null;',
    );

    // 2단계: 기존 enum 값을 JSON 배열로 변환
    this.addSql(`
      update \`conversation_participant\` set \`status_new\` =
      case
        when \`status\` = 'JOIN' then JSON_ARRAY('JOIN')
        when \`status\` = 'PRES' then JSON_ARRAY('JOIN') -- PRES를 JOIN으로 변환
        when \`status\` = 'BLOCK' then JSON_ARRAY('BLOCK')
        when \`status\` = 'MUTE' then JSON_ARRAY('MUTE')
        when \`status\` = 'LEFT' then JSON_ARRAY('LEFT')
        else JSON_ARRAY('JOIN')
      end;
    `);

    // 3단계: 기존 컬럼 삭제
    this.addSql('alter table `conversation_participant` drop column `status`;');

    // 4단계: 새 컬럼을 원래 이름으로 변경하고 NOT NULL 설정
    this.addSql(
      'alter table `conversation_participant` change `status_new` `status` json not null;',
    );
  }

  override async down(): Promise<void> {
    // 롤백: JSON을 다시 enum으로 변환
    this.addSql(
      "alter table `conversation_participant` add column `status_old` enum('JOIN', 'LEFT', 'BLOCK', 'MUTE') not null default 'JOIN';",
    );

    this.addSql(`
      update \`conversation_participant\` set \`status_old\` =
      case
        when JSON_CONTAINS(\`status\`, '"JOIN"') then 'JOIN'
        when JSON_CONTAINS(\`status\`, '"LEFT"') then 'LEFT'
        when JSON_CONTAINS(\`status\`, '"BLOCK"') then 'BLOCK'
        when JSON_CONTAINS(\`status\`, '"MUTE"') then 'MUTE'
        else 'JOIN'
      end;
    `);

    this.addSql('alter table `conversation_participant` drop column `status`;');
    this.addSql(
      "alter table `conversation_participant` change `status_old` `status` enum('JOIN', 'LEFT', 'BLOCK', 'MUTE') not null default 'JOIN';",
    );
  }
}
