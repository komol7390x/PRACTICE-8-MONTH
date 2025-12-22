import { Injectable } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { TeacherEntity } from './entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LanguageLevel, TeacherSort, TeacherStatus } from './enum/teacher-enum';

@Injectable()
export class TeacherService extends BaseService<CreateTeacherDto, UpdateTeacherDto, TeacherEntity> {
  constructor(@InjectRepository(TeacherEntity) private readonly teacherRepository: Repository<TeacherEntity>) {
    super(teacherRepository)
  }
  async createTeacher(dto: CreateTeacherDto) {
    return 'This action adds a new teacher';
  }

  async findAllTeacher(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: TeacherStatus,
    level?: LanguageLevel,
    sort: TeacherSort = TeacherSort.CREATED_AT,
    lang?: string
  ) {
    const skip = (page - 1) * limit;

    const baseQb = this.teacherRepository
      .createQueryBuilder('t')
      .where('t.isDeleted = :isDeleted', { isDeleted: false });

    // status filter (ACTIVE / INACTIVE)
    if (status) {
      baseQb.andWhere('t.isActive = :isActive', {
        isActive: status === TeacherStatus.ACTIVE,
      });
    }
    baseQb.leftJoin('t.certificates', 'c');

    // level filter
    if (level) {
      baseQb.andWhere('c.level = :level', { level });
    }

    // search
    if (search) {
      baseQb.andWhere(
        new Brackets(qb => {
          if (!isNaN(Number(search))) {
            qb.orWhere('t.id = :id', { id: Number(search) });
          }

          qb.orWhere('t.email ILIKE :search', { search: `%${search}%` })
            .orWhere('t.phoneNumber ILIKE :search', { search: `%${search}%` })
            .orWhere('t.fullName ILIKE :search', { search: `%${search}%` });
        }),
      );
    }
    
    // search by certificate specificationName (lang)
    if (lang) {
      baseQb.andWhere('c.specificationName ILIKE :lang', { lang: `%${lang}%` });
    }

    // sorting
    const orderByField =
      sort === TeacherSort.FULLNAME ? 't.fullName'
        : sort === TeacherSort.EMAIL ? 't.email'
          : sort === TeacherSort.RATING ? 't.rating'
              : 't.createdAt';

    // list
    const [teachers, total] = await baseQb
      .clone()
      .orderBy(orderByField, 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // statistics
    const activeCount = await this.teacherRepository.count({
      where: { isActive: true, isDeleted: false },
    });

    const inactiveCount = await this.teacherRepository.count({
      where: { isActive: false, isDeleted: false },
    });

    const deletedCount = await this.teacherRepository.count({
      where: { isDeleted: true },
    });

    return {
      data: teachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        active: activeCount,
        inactive: inactiveCount,
        deleted: deletedCount,
      },
    };
  }


  async findOneTeacher(id: number) {
    return `This action returns a #${id} teacher`;
  }

  async updateTeacher(id: number, dto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  async remove(id: number) {
    return `This action removes a #${id} teacher`;
  }
}
