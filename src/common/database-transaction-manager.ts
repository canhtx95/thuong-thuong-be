import { DataSource, QueryRunner } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  HttpException,
  HttpStatus,
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
  async commitTransaction() {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.release();
  }
  async rollBackTransaction() {
    await this.queryRunner.rollbackTransaction();
    await this.queryRunner.release();
  }
}
