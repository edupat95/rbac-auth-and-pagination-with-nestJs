import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SingUpDto } from './dto/sing-up.dto';
import { SingInDto } from './dto/sing-in.dto';
import { Public } from '../public.decorator';
import { AuthRole } from './decorators/auth.decorator';
import { ActiveUser } from '../common/decorators/active-user.decorator';
import { UserActiveIterface } from '../common/interfaces/ative-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  signIn(@Body() signInDto: SingInDto) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Public()
  @Post('register')
  signUp(@Body() signUpDto: SingUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Get('profile')
  @AuthRole(['USER']) // ATUH ES UN DECORADOR QUE JUNTA LOS DECORADORES DE ROLES Y AUTHGUARD. Revisar archivo auth.decorator.ts
  getProfile(@ActiveUser() user: UserActiveIterface) {
    return this.authService.getProfile(user.id);
  }

}
