import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(8023),
  NODE_ENV: Joi.string()
    .valid('development', 'local', 'production')
    .default('development'),

  /**
   * * Redis Database
   */
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  /**
   * * Postgres Database (admin panel)
   */
  DATABASE_URL: Joi.string().default(
    'postgresql://postgres:postgres@localhost:5432/hostel_admin',
  ),

  JWT_TOKEN_SECRET: Joi.string().required(),

  /**
   * * MySQL Database (hostel management)
   */
  HM_DB_HOST: Joi.string().default('localhost'),
  HM_DB_PORT: Joi.number().default(3306),
  HM_DB_NAME: Joi.string().default('hm_db'),
  HM_DB_USER: Joi.string().default('root'),
  HM_DB_PASS: Joi.string().default(''),

  /**
   * * JWT Access / Refresh tokens
   */
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRE_TIME: Joi.number().default(3600),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRE_TIME: Joi.number().default(7200),
});
