import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { config, DotenvConfigOutput } from 'dotenv';
import { join } from 'path';
const envFound: DotenvConfigOutput = config();
if (!envFound) {
  throw new Error('.env file was not found.');
}

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3305,
  username: 'root',
  password: '123456',
  database: 'thuongthuong',
  entities: [join(__dirname, '/../**/**.entity{.ts,.js}')],
  synchronize: true,
  
};
