import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { PageOptionsDto } from '../common/dto/page-options.dto';
import { PageDto } from '../common/dto/page.dto';
import { PageMetaDto } from '../common/dto/page-meta.dto';
import { RoleFindDto } from './dto/find-role.dto';


@Injectable()
export class RolesService {

  constructor(
    //inject repository user
    @InjectRepository(Role) 
    private roleRepository: Repository<Role>,
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    createRoleDto.name = createRoleDto.name.toUpperCase();

    const existRole = await this.roleRepository.findOne({ where: { name: createRoleDto.name } });
    
    if (existRole) {
      console.error(`Role "${existRole.name}" already exists.`);
      
      //throw error mesagge
      throw new HttpException(`Role "${existRole.name}" already exists.`, HttpStatus.CONFLICT);
    }

    try {
      const role = this.roleRepository.create({ name: createRoleDto.name });
    
      const newRole = this.roleRepository.save(role);

      return newRole;

    } catch (error) {
      
      console.error('Error creating role:', error);

      return new HttpException(`Error creating role '${existRole.name}'. Description: ${error}`, 500);
    }

  }
  
  
  async findAll(
    roleFindDto: RoleFindDto,
  ): Promise<PageDto<CreateRoleDto>> {
    const queryBuilder = this.roleRepository.createQueryBuilder("role");
    
    //console.log('roleFindDto:', roleFindDto.name);
    
    if (roleFindDto.name !== undefined) {
      queryBuilder.andWhere("role.name LIKE :name", { name: `%${roleFindDto.name}%` });
      //queryBuilder.andWhere("role.name LIKE :name", { name: `%${roleFindDto.name.toUpperCase()}%` });
    }

    queryBuilder
      .orderBy("role.createdAt", roleFindDto.order)
      .skip(roleFindDto.skip)
      .take(roleFindDto.take);

    const itemCount = await queryBuilder.getCount();
    
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageOptionsDto = new PageOptionsDto(roleFindDto);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    
    return new PageDto(entities, pageMetaDto);  
  }


  async findAllActive(pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<CreateRoleDto>> {
    const queryBuilder = this.roleRepository.createQueryBuilder("role");

    queryBuilder
      .orderBy("role.createdAt", pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  async remove(name: string) {
    name = name.toUpperCase();
    const existRole = await this.roleRepository.findOne({where: {name}});
    if (!existRole) {
      console.error(`Error, Role with name '${name}' not found.`);
      throw new HttpException(`Error deleting role. Role with id '${name}' not found.`, 500);
    }
    return this.roleRepository.delete(existRole.id);
  }

  async findByName(name: string){
    const existRole = await this.roleRepository.findOne({ where: { name } });

    if (!existRole) {
      console.error(`El rol "${name}" no existe. Debe crearlo antes de continuar.`);
    }

    return existRole;
  }

  async createDefaultRoles() {
    try {
      const existingRole = await this.roleRepository.findOne({ where: { name: 'USER' } });
      const existingRoleAdmin = await this.roleRepository.findOne({ where: { name: 'ADMIN' } });
      
      // Si no existe, crea el rol 'user'
      if (!existingRole) {
        const newUserRole = this.roleRepository.create({ name: 'USER' });

        await this.roleRepository.save(newUserRole);
        console.log('Default role "USER" created successfully.');
      } else {
        console.log('The role "USER" already exists.');
      }

      // Si no existe, crea el rol 'admin'
      if (!existingRoleAdmin) {
        const newAdminRole = this.roleRepository.create({ name: 'ADMIN' });
        await this.roleRepository.save(newAdminRole);
        console.log('Default role "ADMIN" created successfully.');
      } else {
        console.log('The role "ADMIN" already exists.');
      }

    } catch (error) {
      console.error('Error try create rol:', error);
    }
  }
  
}
