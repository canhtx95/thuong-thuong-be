import { config, DotenvConfigOutput } from 'dotenv'
import { join } from 'path'
const envFound: DotenvConfigOutput = config()
if (!envFound) {
  throw new Error('.env file was not found.')
}

export const databaseConfig = {
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '/../**/**.entity{.ts,.js}')],
  synchronize: true,
}
