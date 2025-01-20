import { ConfigService } from '@nestjs/config';
import { KnexModuleOptions } from 'nestjs-knex';

export const getConnectionConfig = (
  configService: ConfigService,
): KnexModuleOptions => ({
  config: {
    client: 'mysql2',
    connection: {
      host: configService.get<string>('HM_DB_HOST'),
      port: +configService.get<number>('HM_DB_PORT'),
      database: configService.get<string>('HM_DB_NAME'),
      user: configService.get<string>('HM_DB_USER'),
      password: configService.get<string>('HM_DB_PASS'),
    },
  },
});
