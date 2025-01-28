import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './common/schema/config-schema';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/exception/exception-filter';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { UserModule } from './modules/v1/user/user.module';
import { AuthModule } from './modules/v1/auth/auth.module';
import { BookingFlatformsModule } from './modules/v1/settings/booking-flatforms/booking-flatforms.module';
import { BookingFlatformsController } from './modules/v1/settings/booking-flatforms/booking-flatforms.controller';
import { BankInfoModule } from './modules/v1/settings/bank-info/bank-info.module';
import { OnlineCardsInfoModule } from './modules/v1/settings/online-cards-info/online-cards-info.module';
import { OnlineCardsInfoController } from './modules/v1/settings/online-cards-info/online-cards-info.controller';
import { OnlineCardsInfoService } from './modules/v1/settings/online-cards-info/online-cards-info.service';
import { ExpenseCategoriesModule } from './modules/v1/expenses/expense-categories/expense-categories.module';
import { ExpenseManagementModule } from './modules/v1/expenses/expense-management/expense-management.module';
import { KnexModule } from 'nestjs-knex';
import { getConnectionConfig } from './config/db/db.connection';
import { CategoryModule } from './modules/v1/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        getConnectionConfig(configService),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: Number(configService.get('REDIS_PORT')) || 6379,
          },
        }),
      }),
      inject: [ConfigService],
    }),
    {
      ...HttpModule.register({}),
      global: true,
    },
    UserModule,
    AuthModule,
    BookingFlatformsModule,
    BankInfoModule,
    OnlineCardsInfoModule,
    ExpenseCategoriesModule,
    ExpenseManagementModule,
    CategoryModule,
  ],
  controllers: [
    AppController,
    BookingFlatformsController,
    OnlineCardsInfoController,
  ],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    OnlineCardsInfoService,
  ],
  exports: [],
})
export class AppModule {}
