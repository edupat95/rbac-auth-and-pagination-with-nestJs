import {
  HttpException,
  Injectable,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SingUpDto } from './dto/sing-up.dto';
import { SingInDto } from './dto/sing-in.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(singInDto: SingInDto) {

    const user = await this.usersService.findOneByEmailWithPassword(
      singInDto.email,
    );
    
    if(!user){
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(
      singInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is not allowed.');
    }

    //findOne tiene un error, cuando se pasa un id nulo, devuelve el primer registro de la tabla. Que suele ser el admin.
    //Solucion al bug https://pietrzakadrian.com/blog/how-to-hack-your-nodejs-application-which-uses-typeorm
    const roles = user.roles.map((role: Role) => role.name);

    const payload = { id: user.id, email: user.email, username: user.username, roles: roles };

    return {
      //CONFIGURACION DE JWT EN auth.module.ts
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(signUpDto: SingUpDto) {

    const user = await this.usersService.create(signUpDto);

    if (!user) {
      throw new HttpException('Error creating user', 500);
    }
    
    return {
      message: 'User created successfully',
      status: HttpStatus.OK,
    };
  }

  async signOut() {
    return {
      message: 'User signed out successfully',
      status: HttpStatus.OK,
    };
  }

  async getProfile(id: number) {
    const user = await this.usersService.findOne(id);

    const roles = user.roles.map((role: Role) => role.name);

    const payload = { id: user.id, username: user.username, roles: roles };

    return { user: payload };
  }

  async payload(token: string) {
    return this.jwtService.verifyAsync(token);
  }
}
