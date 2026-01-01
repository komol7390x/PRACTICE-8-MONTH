import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from 'src/api/user/admin/entities/admin.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatisticaService {
  constructor(@InjectRepository(AdminEntity) private readonly adminRepo: Repository<AdminEntity>) { }

  async getAdmin() {
    const [total, active, inactive, deleted] = await Promise.all([
      this.adminRepo.count(),
      this.adminRepo.count({ where: { isActive: true } }),
      this.adminRepo.count({ where: { isActive: false } }),
      this.adminRepo.count({ where: { isDeleted: true } }),
    ]);

    return {
      all: total,
      active: active,
      inactive: inactive,
      deleted: deleted
    };
  }
}
