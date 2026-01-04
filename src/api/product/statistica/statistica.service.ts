import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from '../../user/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';

@Injectable()
export class StatisticaService {
  constructor(@InjectRepository(AdminEntity) private readonly adminRepo: Repository<AdminEntity>,
    @InjectRepository(TeacherEntity) private readonly teacherRepo: Repository<TeacherEntity>,
  ) { }

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

  async getTecher() {
    const [total, active, inactive, deleted, lesson] = await Promise.all([
      this.teacherRepo.count(),
      this.teacherRepo.count({ where: { isActive: true } }),
      this.teacherRepo.count({ where: { isActive: false } }),
      this.teacherRepo.count({ where: { isDeleted: true } }),
      this.teacherRepo.count({ where: { lessons: false } }),
    ]);

    return {
      all: total,
      active: active,
      inactive: inactive,
      deleted: deleted,
      lesson: lesson
    };
  }
}
