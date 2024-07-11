
import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let permissionsRepository: Repository<Permission>; // Con mongoose sería Model<Permission>
  let rolesRepository: Repository<Role>; // Con mongoose sería Model<Role>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<PermissionsService>(PermissionsService);
    permissionsRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
