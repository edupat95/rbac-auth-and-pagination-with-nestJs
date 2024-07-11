import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let roleRepository: Repository<Role>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw an exception if the username already exists', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce({} as User);

      await expect(service.create({ username: 'test', email: 'test@test.com', password: '123456' })).rejects.toThrow(HttpException);
    });

    it('should throw an exception if the email already exists', async () => {
      jest.spyOn(userRepository, 'findOneBy')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({} as User);

      await expect(service.create({ username: 'test', email: 'test@test.com', password: '123456' })).rejects.toThrow(HttpException);
    });

    it('should create a new user with a hashed password and role USER', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedpassword');
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({} as User).mockResolvedValue({} as User);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue({ id: 1, name: 'USER' } as Role);

      const user = await service.create({ username: 'test', email: 'test@test.com', password: '123456' });
      expect(user).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, email: 'test@test.com' } as User;
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(user);
    });
  });

  describe('findOneByUsername', () => {
    it('should return a user by username', async () => {
      const user = { id: 1, username: 'test' } as User;
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

      const result = await service.findOneByUsername('test');
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should throw an exception if the user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update(1, { username: 'test', email: 'test@test.com', roles: [] })).rejects.toThrow(HttpException);
    });

    it('should update a user successfully', async () => {
      const user = { id: 1, username: 'old', email: 'old@test.com', roles: [] } as User;
      const roles = [
        { id: 1, name: 'ADMIN' } as Role,
        { id: 2, name: 'USER' } as Role,
      ];
      const updatedUser = { ...user, username: 'new', email: 'new@test.com', roles };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);
      jest.spyOn(roleRepository, 'findOne').mockImplementation(async (options: FindOneOptions<Role>) => {
        if (options && options.where && typeof options.where === 'object' && 'name' in options.where) {
          return roles.find(role => role.name === (options.where as FindOptionsWhere<Role>).name) || null;
        }
        return null;
      });

      const result = await service.update(1, { username: 'new', email: 'new@test.com', roles: ['ADMIN', 'USER'] });
      expect(result).toEqual({ ...updatedUser, roles });
    });
  });

  describe('remove', () => {
    it('should set isActive to false', async () => {
      const user = { id: 1, isActive: true } as User;
      const updatedUser = { ...user, isActive: false };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);

      const result = await service.remove(1);
      expect(result.isActive).toBe(false);
    });
  });

  describe('enableUser', () => {
    it('should set isActive to true', async () => {
      const user = { id: 1, isActive: false } as User;
      const updatedUser = { ...user, isActive: true };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);

      const result = await service.enableUser(1);
      expect(result.isActive).toBe(true);
    });
  });
});
