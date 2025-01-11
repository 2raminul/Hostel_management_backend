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
   * * Postgres Database
   */
  DATABASE_URL: Joi.string().default(
    'postgresql://postgres:postgres@localhost:5432/hostel_admin',
  ),


  JWT_TOKEN_SECRET: Joi.string().required(),

});
