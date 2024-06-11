import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule} from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { AuthService } from 'src/auth/auth.service';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { PermissionsModule } from 'src/permissions/permissions.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }, //30 min
    }),
  ],
  controllers: [
    UsersController
  ],
  providers: [
    UsersService,
    AuthService,
    PermissionsModule
  ],
  exports: [UsersService]
})
export class UsersModule {}
