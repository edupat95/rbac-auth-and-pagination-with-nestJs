import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let permissionsRepository: Repository<Permission>;
  let rolesRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(Permission),
          useClass: Repository  
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository
        }
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    permissionsRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
