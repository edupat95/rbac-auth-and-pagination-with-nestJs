import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageDto } from '../common/dto/page.dto';
import { PageMetaDto } from '../common/dto/page-meta.dto';
import { UserFindDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  constructor(
    //inject repository user
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>, // Asegúrate de tener el repo de Role inyectado
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    //find user by username
    const userFoundUsername = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });
    
    //return exception if user found
    if (userFoundUsername) {
      throw new HttpException('Username already exists', 409);
    }

    const userFoundEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (userFoundEmail) {
      throw new HttpException('Email already exists', 409);
    }

    //hash password. Parametros: password, salto
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10); 

    const newUser = await this.userRepository.save(createUserDto);

    //role user by default
    const userRole = await this.roleRepository.findOne({
      where: { name: 'USER' },
    });
    if (!userRole) {
      console.error(
        'Role USER dont exist. You must create it before continue.',
      );
      return new HttpException(
        'Role USER dont exist. You must create it before continue.',
        500,
      );
    }
   
    newUser.roles = [userRole];
    
    await this.userRepository.save(newUser);

    return newUser;
  } 

  async create_default_admin(createUserDto: CreateUserDto){
    //find user by username
    const userFoundUsername = await this.userRepository.findOneBy({
      username: createUserDto.username,
    });
    //console.log('userFoundUsername', userFoundUsername);
    //return exception if user found
    if (userFoundUsername) {
      throw new HttpException('Username already exists', 409);
    }

    const userFoundEmail = await this.userRepository.findOneBy({
      email: createUserDto.email,
    });
    if (userFoundEmail) {
      throw new HttpException('Email already exists', 409);
    }

    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.userRepository.save(createUserDto);

    const adminRole = await this.roleRepository.findOne({
      where: { name: 'ADMIN' },
    });
    if (!adminRole) {
      console.error(
        'Role ADMIN dont exist. You must create it before continue.',
      );
      return new HttpException(
        'Role ADMIN dont exist. You must create it before continue.',
        500,
      );
    }
   
    newUser.roles = [adminRole];
  
    await this.userRepository.save(newUser);

    return newUser;
  }

  findByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async findAll(userFindDto: UserFindDto): Promise<PageDto<CreateUserDto>> {
      
    const queryBuilder = this.userRepository.createQueryBuilder("user");
    
    // Aplicar filtros si se proporcionan en userFindDto
    if (userFindDto.username != undefined) {
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${userFindDto.username}%` });
    }

    if (userFindDto.email != undefined) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${userFindDto.email}%` });
    }

    if (userFindDto.state !== 2) {
      console.log("entrega")
      if (userFindDto.state === 1) {
        queryBuilder.andWhere('user.isActive = :state', { state: true });
      } else if (userFindDto.state === 0){
        queryBuilder.andWhere('user.isActive = :state', { state: false });
      }
    }

    queryBuilder
      .leftJoinAndSelect("user.roles", "role") // Carga completa de roles
      .orderBy("user.createdAt", userFindDto.order)
      .skip(userFindDto.skip)
      .take(userFindDto.take);

    const itemCount = await queryBuilder.getCount();
    
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageOptionsDto = new PageOptionsDto(userFindDto);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findOneByUsername(username: string) {
    //console.log('username ->', username);
    return this.userRepository.findOneBy({ username });
  }

  async findOneByUsernameWithPassword(username: string) {
    return await this.userRepository.findOne({
      where: { username },
      select: ['id', 'isActive', 'username', 'password'],
    });
  }

  async findOneByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'isActive', 'email', 'username', 'password'],
      relations: ['roles'], // Indicar la relación de roles
    });
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'isActive'],
      relations: ['roles'], // Indicar la relación de roles
    });
  }

  
  async getProfile(id: number) {
    const user = await this.findOne(id);

    const roles = user.roles.map((role: Role) => role.name);

    //const payload = { id: user.id, username: user.username, roles: roles };
    
    return { id: user.id, username: user.username, roles: roles };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    } else{
      user.username = updateUserDto.username;
      user.email = updateUserDto.email;
      if (updateUserDto.password) {
        console.log('updateUserDto.password', updateUserDto.password);
        user.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      //updateUserDto.roles is a string array. I need to find the role by name and assign it to the user
      user.roles = [];
      for (const roleName of updateUserDto.roles) {
        const role = await this.roleRepository.findOne({
          where: { name: roleName },
        });
        if (!role) {
          throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
        }
        user.roles.push(role);
      }

      await this.userRepository.save(user);

      return user;
    }
  }

  async remove(id: number) {
    console.log('service id', id);
    const user = await this.userRepository.findOne({
      where : { id },
    });
    user.isActive = false;
    await this.userRepository.save(user);
    return user;
  }

  async enableUser(id: number) {
    const user = await this.userRepository.findOne({
      where : { id },
    });
    user.isActive = true;
    await this.userRepository.save(user);
    return user;
  }
}
