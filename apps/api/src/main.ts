import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 4000;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Configuración de CORS segura para cookies y autorización
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // Cookies
  app.use(cookieParser());

  // Prefijo global de API versionada
  app.setGlobalPrefix('api/v1');

  // Validación global estricta de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Documentación OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('TIDESK - API Mesa de Ayuda Universitaria')
    .setDescription(
      'Documentación oficial del backend para el Sistema Integral de Mesa de Ayuda de la Universidad Nacional de Cañete (UNDC).',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`=======================================================`);
  console.log(`🚀 TIDESK API Backend ejecutándose en: http://localhost:${port}/api/v1`);
  console.log(`📚 Documentación Swagger en: http://localhost:${port}/api/docs`);
  console.log(`=======================================================`);
}

bootstrap();
