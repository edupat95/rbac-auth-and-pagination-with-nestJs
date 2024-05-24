import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initConfig } from './init.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  //CONFIGURACION INICIAL
  try {
    if (await initConfig(app)) {
      console.log('Initial configuration completed successfully');
    }
  } catch (error) {
    console.error(error);
  }
  //FIN CONFIGURACION INICIAL
  app.enableCors(); //habilita los cors
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true, //elimina los campos que no esten en el DTO
      forbidNonWhitelisted: true, //arroja un error si hay campos no permitidos
      transform: true, //transforma los tipos de datos a los especificados en el DTO
    }
  )); //habilita los pipes y validaciones de los DTOs
  
  await app.listen(3000);
}
bootstrap();
