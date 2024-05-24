import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    console.log('Hello World!');
    return this.appService.getHello();
  }
}
