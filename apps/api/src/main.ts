import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:4200';

  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigin,
    credentials: true
  });

  await app.listen(port);
}

void bootstrap();

