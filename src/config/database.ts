import { Knex } from 'knex';
import { config } from './index';

export const knexConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
    charset: 'utf8mb4',
  },
  pool: {
    min: 2,
    max: 10,
  },
  acquireConnectionTimeout: 30000,
};
