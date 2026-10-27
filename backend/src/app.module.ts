import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { UserModule } from './users/users.module.js';
import { AuthModule } from './Auth/auth.module.js';
import { BrandModule } from './brand/brand.module.js';
import { ParfumModule } from './parfum/parfum.module.js';
import { StockModule } from './stockBatch/stock.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    UserModule,
    AuthModule,
    BrandModule,
    ParfumModule,
    StockModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
