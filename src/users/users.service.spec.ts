import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => { //Este bloque define un conjunto de pruebas para el UsersService. describe es una función de Jest que agrupa pruebas relacionadas.
  let service: UsersService; // Variable que almacenará una instancia de UsersService.
  let userRepository: Repository<User>; //userRepository: Variable que almacenará una instancia de Repository<User>.
  let roleRepository: Repository<Role>; // roleRepository: Variable que almacenará una instancia de Repository<Role>.
  let jwtService: JwtService; // jwtService: Variable que almacenará una instancia de JwtService.

  beforeEach(async () => { // El bloque beforeEach se ejecuta antes de cada prueba individual dentro del bloque describe. Aquí es donde se configura el entorno de prueba.
    const module: TestingModule = await Test.createTestingModule({ // Test.createTestingModule crea un módulo de prueba de NestJS.
      providers: [ // Aquí se definen los proveedores que se utilizarán en el módulo de prueba.
        UsersService, // UsersService es el servicio que se está probando.
        JwtService, // JwtService es una dependencia de UsersService.
        {
          provide: getRepositoryToken(User), // getRepositoryToken(User) devuelve el token que se utiliza para inyectar el repositorio de User.
          useClass: Repository,  // useClass: Repository indica que se debe utilizar la clase Repository como implementación del repositorio de User.
        },
        {
          provide: getRepositoryToken(Role), // getRepositoryToken(Role) devuelve el token que se utiliza para inyectar el repositorio de Role.
          useClass: Repository, // useClass: Repository indica que se debe utilizar la clase Repository como implementación del repositorio de Role.
        },
      ],
    }).compile(); //Compila el módulo de prueba. Esto configura el módulo y resuelve todas las dependencias.

    service = module.get<UsersService>(UsersService); // module.get obtiene una instancia de UsersService del módulo.
    userRepository = module.get<Repository<User>>(getRepositoryToken(User)); // module.get obtiene una instancia de Repository<User> del módulo.
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role)); // module.get obtiene una instancia de Repository<Role> del módulo.
    jwtService = module.get<JwtService>(JwtService); // module.get obtiene una instancia de JwtService del módulo.
  });

  it('should be defined', () => { // Descripcion de la prueba 
    expect(service).toBeDefined(); // expect es una función de Jest que se utiliza para realizar afirmaciones. En este caso, se espera que service esté definido. Si service es undefined o null, la prueba fallará.
  });

  describe('create', () => { //Este bloque agrupa las pruebas relacionadas con el método create.
    
    it('should throw an exception if the username already exists', async () => { // Define una prueba con la descripción 'should throw an exception if the username already exists'.
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce({} as User); // Utiliza jest.spyOn para espiar el método findOneBy del userRepository. mockResolvedValueOnce({} as User) hace que este método devuelva un usuario simulado en la primera llamada.
      await expect(service.create({ username: 'test', email: 'test@test.com', password: '123456' })).rejects.toThrow(HttpException); //  Llama al método create con un username que ya existe y espera que lance una excepción de tipo HttpException.
    });

    it('should throw an exception if the email already exists', async () => {
      jest.spyOn(userRepository, 'findOneBy') // Utiliza jest.spyOn para espiar el método findOneBy del userRepository.  
        .mockResolvedValueOnce(null) //La primera llamada devolverá null 
        .mockResolvedValueOnce({} as User); //y la segunda llamada devolverá un usuario simulado.

      await expect(service.create({ username: 'test', email: 'test@test.com', password: '123456' })).rejects.toThrow(HttpException); // Llama al método create con un email que ya existe y espera que lance una excepción de tipo HttpException.
    });

    it('should create a new user with a hashed password and role USER', async () => { // Define una prueba con la descripción 'should create a new user with a hashed password and role USER'.
      jest.spyOn(userRepository, 'findOneBy') //Utiliza jest.spyOn para espiar el método findOneBy del userRepository.
      .mockResolvedValueOnce(null) //Ambas llamadas devolverán null
      // El primer mockResolvedValueOnce(null) hace referencia a la primer llamada que se realiza al método findOneBy de userRepository.
      //En este caso corresponde a la siguiente porcion de codigo de user.service.ts
      /*
        const userFoundUsername = await this.userRepository.findOneBy({
          username: createUserDto.username,
        });  
        if (userFoundUsername) {
          throw new HttpException('Username already exists', 409);
        }
      */
      .mockResolvedValueOnce(null); //indicando que el username y .el email no existen
      //El segundo mockResolvedValueOnce(null) hace referencia a la segunda llamada que se realiza al método findOneBy de userRepository.
      // En este caso corresponde a la siguiente porcion de codigo de user.service.ts:
      /*
        const userFoundEmail = await this.userRepository.findOneBy({
          email: createUserDto.email,
        });
        if (userFoundEmail) {
          throw new HttpException('Email already exists', 409);
        }
      */



      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashedpassword');//Utiliza jest.spyOn para espiar el método hash de bcrypt. Hace que devuelva 'hashedpassword' cuando se llame.
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce({} as User).mockResolvedValue({} as User); //Utiliza jest.spyOn para espiar el método save del userRepository. Ambas llamadas devolverán un usuario simulado.
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue({ id: 1, name: 'USER' } as Role); //Utiliza jest.spyOn para espiar el método findOne del roleRepository. Devolverá un rol simulado con el nombre 'USER'.

      const user = await service.create({ username: 'test', email: 'test@test.com', password: '123456' }); // Llama al método create con un nuevo usuario y espera que devuelva el usuario creado.
      
      if (user instanceof HttpException) {
        // Handle the case where the user creation failed and an exception was thrown
        throw user;
      }

      expect(user).toBeDefined(); // Verifica que el usuario creado esté definido.
      expect(user.roles).toEqual([{ id: 1, name: 'USER' }]);
      
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
      // La primera llamada al findOne de userRepository devolverá null.
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null); 
      
      //Por lo tanto deberiamos recibir un HttpException
      await expect(service.update(1, { username: 'test', email: 'test@test.com', roles: [] })).rejects.toThrow(HttpException);
    });

    it('should update a user successfully', async () => {
      //Definimos un usuario a actualizar o usuario viejo
      const user = { id: 1, username: 'old', email: 'old@test.com'} as User;
      
      //Definimos los nuevos roles.
      const roles = [
        { id: 1, name: 'ADMIN' } as Role,
        { id: 2, name: 'USER' } as Role,
      ];

      //Definimos el usuario actualizado
      const updatedUser = { ...user, username: 'new', email: 'new@test.com', roles };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user); // La primer llamada a findOne de userRepository devolverá el usuario simulado.
      /*
        Este usuario simulado posee los siguientes datos:
        id: 1
        username: 'old'
        email: 'old@test.com'
        roles: []
      */ 
      
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
