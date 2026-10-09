import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from "./common/filters/prisma-exception.filter.js"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true
  }))
  app.useGlobalFilters(
    new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter),
  )
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
