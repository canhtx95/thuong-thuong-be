import { DataSource, QueryRunner } from 'typeorm';
import {
  Injectable,
} from '@nestjs/common';
@Injectable()
export class DatabaseTransactionManagerService {
  queryRunner: QueryRunner;

  constructor(private dataSource: DataSource) {}

  async createTransaction(): Promise<QueryRunner> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    return this.queryRunner;
  }
  async commit() {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
  }
  async rollBack() {
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
  }
}
