import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class RolePermissionsSeederService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  private permissions = [
    { name: 'MANAGE_ALL_DATA' },
    // { name: 'MANAGE_CATEGORY' },
    // { name: 'VIEW_CATEGORY' },
  ];

  async insertRolePermissions() {
    const permissionsCount = await this.permissionsRepository.count({});

    if (!permissionsCount) {
      Logger.log('Running user role and permissions seeder');
      const permissions = await this.permissionsRepository.save(
        this.permissions,
      );

      const superAdminRole = new Role();
      superAdminRole.name = 'super_admin';
      superAdminRole.permissions = permissions;
      await this.roleRepository.save(superAdminRole);
    }
  }
}
