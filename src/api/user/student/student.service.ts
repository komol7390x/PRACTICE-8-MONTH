import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
  constructor(@InjectRepository(StudentEntity)
  private readonly studentRepository: Repository<StudentEntity>) { super(studentRepository) }

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
    status?: boolean,
    sort: StudentSort = StudentSort.CREATED_AT,
  ) {
    const skip = (page - 1) * limit;

    const baseQb = this.studentRepository
      .createQueryBuilder('s')
      .where('s.isDeleted = :isDeleted', { isDeleted: false });

    // status filter
    if (typeof status == 'boolean') {
      baseQb.andWhere('s.isActive = :isActive', {
        isActive: status = Boolean(status)
      });
    }

    // search
    if (search) {
      baseQb.andWhere(
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

    // sorting
    const orderByField =
      sort === StudentSort.FIRST_NAME ? 's.firstName'
        : sort === StudentSort.LAST_NAME ? 's.lastName'
          : sort === StudentSort.TG_USERNAME ? 's.tgUsername'
            : `s.${sort}`;

    // list query
    const [students, total] = await baseQb
      .clone()
      .orderBy(orderByField, 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // statistics
    const activeCount = await this.studentRepository.count({
      where: { isActive: true, isDeleted: false },
    });

    const inactiveCount = await this.studentRepository.count({
      where: { isActive: false, isDeleted: false },
    });

    const deletedCount = await this.studentRepository.count({
      where: { isDeleted: true },
    });

    return {
      data: students,
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


  // --------------------- FIND ONE STUDENT ---------------------

  async findOneStudent(id: number, user?: IToken) {

    if (isNaN(id)) {
      throw new BadRequestException('id type is NaN is not true')
    }
    const student = await this.studentRepository.findOne({
      where: { id, isDeleted: false, role: Roles.STUDENT },
      relations: { lessons: true }
    });
    if (!student) {
      throw new NotFoundException(`${id} id student not found`)
    }
    return successRes({ ...student })

  }
  // -------------------- UPDATE STUDENT --------------------
  async updateStudent(id: number, dto: UpdateStudentDto, user: IToken) {
    const { firstName, lastName, phoneNumber, tgUsername, tgId } = dto
    const student = await this.studentRepository.findOne({ where: { id, isDeleted: true } })

    if (!student) {
      throw new NotFoundException(`${id} not found on Student`)
    }
    if (user.role == Roles.ADMIN || user.role == Roles.STUDENT) {
      await this.studentRepository.update({ id }, {
        firstName: firstName ?? student.firstName,
        lastName: lastName ?? student.lastName,
      })
      return this.findOneStudent(id, user)
    }

    if (user.role == Roles.SUPER_ADMIN) {
      await this.studentRepository.update({ id }, {
        firstName: firstName ?? student.firstName,
        lastName: lastName ?? student.lastName,
        phoneNumber: phoneNumber ?? student.phoneNumber,
        tgUsername: tgUsername ?? student.tgUsername,
        tgId: tgId ?? student.tgId
      })
      return this.findOneStudent(id, user)
    }
  }
  // -------------------- ADD BALANCE --------------------
  async addBalance(id: number, balance: number) {
    const student = await this.studentRepository.findOne({ where: { id } })
    if (!student) {
      throw new NotFoundException(`${id} not found on Student`)
    }
    const newBalance = student.wallet + balance
    await this.studentRepository.update(id, { wallet: newBalance })
    return await this.findOneStudent(id)
  }

  // -------------------- BLOCKED AT --------------------

  async blockedStudent(id: number, active: boolean) {
    await this.findOneById(id)
    const blockedAt = new Date
    await this.studentRepository.update({ id }, { blockedAt, isActive: active })
    return super.findOneById(id)
  }
}
