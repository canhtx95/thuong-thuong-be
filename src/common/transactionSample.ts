import { DataSource } from 'typeorm';
import { DatabaseTransactionManagerService } from './database-transaction-manager';
import { UserEntity } from 'src/users/entity/users.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { BaseResponse } from './response/base.response';
export class Sample {
  constructor(
    private dataSource: DataSource,
    private managerTransaction: DatabaseTransactionManagerService,
  ) {}
  async sample() {
    const queryRunner = await this.managerTransaction.createTransaction();
    try {
      const userRepositoryTransaction =
        queryRunner.manager.getRepository(UserEntity);

      await queryRunner.commitTransaction();
      const response = new BaseResponse();
      return response;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
