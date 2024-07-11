import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('RolesController', () => {
  let controller: RolesController;
  let roleRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository
        }
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
