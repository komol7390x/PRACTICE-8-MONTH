import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { StudentEntity } from './entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindOptionsOrder, Repository } from 'typeorm';
import { StudentStatus } from './enum/student-status';
import { StudentSort } from './enum/student-sort';
import { type IToken } from 'src/infrastructure/token/interface';
import { successRes } from 'src/infrastructure/response/success.response';
import { Roles } from 'src/common/enum/roles.enum';

@Injectable()
export class StudentService extends BaseService<CreateStudentDto, UpdateStudentDto, StudentEntity> {
  constructor(@InjectRepository(StudentEntity) private readonly studentRepository: Repository<StudentEntity>) { super(studentRepository) }
  // --------------------CREATE STUDNENT --------------------
  async createStudent(dto: CreateStudentDto) {
    const { phoneNumber, tgUsername, tgId, firstName, lastName } = dto

    const existStudentTgId = await this.studentRepository.findOne({ where: { tgId } })
    if (existStudentTgId) {
      throw new ConflictException(`Telegram Id ${tgId} already exist on student`)
    }

    const existStudentTel = await this.studentRepository.findOne({ where: { phoneNumber } })
    if (existStudentTel) {
      throw new ConflictException(`Tel ${phoneNumber} already exist on student`)
    }

    const existStudentUsername = await this.studentRepository.findOne({ where: { tgUsername } })
    if (existStudentUsername) {
      throw new ConflictException(`Tgusername ${existStudentUsername} already exist on student`)
    }

    return super.create({ phoneNumber, tgUsername, tgId, firstName, lastName })

  }
  // ----------------------- FIND ALL STUDENTS PAGANATION -----------------------
  async findAllStudent(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: StudentStatus,
    sort: StudentSort = StudentSort.CREATED_AT,
  ) {
    const skip = (page - 1) * limit;

    const qb = this.studentRepository.createQueryBuilder('s')
      .where('s.isDeleted = :isDeleted', { isDeleted: false });

    if (status) {
      qb.andWhere('s.isActive = :isActive', {
        isActive: status === StudentStatus.ACTIVE ? true : false,
      });
    }

    if (search) {
      qb.andWhere(
        new Brackets(qb => {
          if (!isNaN(Number(search))) {
            qb.orWhere('s.id = :id', { id: Number(search) });
          }

          qb.orWhere('s.tgId ILIKE :search', { search: `%${search}%` })
            .orWhere('s.firstName ILIKE :search', { search: `%${search}%` })
            .orWhere('s.lastName ILIKE :search', { search: `%${search}%` })
            .orWhere('s.tgUsername ILIKE :search', { search: `%${search}%` })
            .orWhere('s.phoneNumber ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const orderByField = sort === StudentSort.FIRST_NAME ? 's.firstName'
      : sort === StudentSort.LAST_NAME ? 's.lastName'
        : sort === StudentSort.TG_USERNAME ? 's.tgUsername'
          : `s.${sort}`;

    qb.orderBy(orderByField, 'DESC')
      .skip(skip)
      .take(limit);

    const [students, total] = await qb.getManyAndCount();

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }



  async findOneStudent(id: number, user: IToken) {
    if (user.role == Roles.SUPER_ADMIN) {
      const student = await this.studentRepository.findOne({ where: { id, role: user.role } })
      if (!student) {
        throw new NotFoundException(`${id} id student not found`)
      }
      return successRes(student)
    }
    const student = await this.studentRepository.findOne({
      where: { id, isActive: true, isDeleted: false, role: Roles.STUDENT }
    });
    if (!student) {
      throw new NotFoundException(`${id} id student not found`)
    }
    const { blockedAt, blockedReason, firstName, id: studentId, isActive, lastName, phoneNumber, role, tgId, tgUsername } = student
    const data = { blockedAt, blockedReason, firstName, id: studentId, isActive, lastName, phoneNumber, role, tgId, tgUsername }
    return successRes({ ...data })

  }

  async updateStudent(id: number, dto: UpdateStudentDto, user: IToken) {
    const { firstName, lastName, phoneNumber, tgUsername, tgId, blockedAt, blockedReason } = dto
    const student = await this.studentRepository.findOne({ where: { id, isDeleted: true } })

  }

  async removeStudent(id: number) {
    return `This action removes a #${id} student`;
  }
}
