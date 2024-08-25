import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFindDto } from './dto/find-user.dto';
import { HttpException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        JwtService,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the profile of the active user', async () => {
      const result = { id: 1, username: 'testuser', roles: ['USER'] };
      jest.spyOn(service, 'getProfile').mockResolvedValue(result);

      expect(await controller.getProfile({ id: 1, username: 'testuser', roles: ['USER'] })).toBe(result);
      expect(service.getProfile).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = { username: 'testuser', email: 'test@test.com', password: 'password123' };
      const result = { ...createUserDto, id: 1 };

     
      if (result instanceof HttpException) {
        // Handle the case where the user creation failed and an exception was thrown
        throw result;
      }
      
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const userFindDto: UserFindDto = { username: 'testuser', email: 'test@test.com', state: 1, order: 'ASC', skip: 0, take: 10 };
      const result = {
        data: [{ id: 1, username: 'testuser', email: 'test@test.com' }],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 }
      };
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(userFindDto)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(userFindDto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updatedUser', email: 'updated@test.com', password: 'newpassword123', roles: ['USER'] };
      const result = { ...updateUserDto, id: 1 };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update('1', updateUserDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = { id: 1, username: 'testuser', email: 'test@test.com', isActive: false };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove('1')).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('enableUser', () => {
    it('should enable a user', async () => {
      const result = { id: 1, username: 'testuser', email: 'test@test.com', isActive: true };
      jest.spyOn(service, 'enableUser').mockResolvedValue(result);

      expect(await controller.enableUser('1')).toBe(result);
      expect(service.enableUser).toHaveBeenCalledWith(1);
    });
  });
});
