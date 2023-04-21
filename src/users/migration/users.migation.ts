import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeNameToUsername1632469571799 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE name username VARCHAR(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE username name VARCHAR(255) NOT NULL`,
    );
  }
}
