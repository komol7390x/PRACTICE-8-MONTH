import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { PaymentEntity } from './entities/payment.entity';
import { Brackets, DataSource, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { Roles } from 'src/common/enum/roles.enum';
import { PaymentStatus } from './enum/payment-status';
import { CourseSetting } from '../course/enum/cours-name';
import { CourseEntity } from '../course/entities/course.entity';
import { ScheduleEntity } from '../schedule/entities/schedule.entity';
import { use } from 'passport';

@Injectable()
export class PaymentService extends BaseService<CreatePaymentDto, UpdatePaymentDto, PaymentEntity> {
  constructor(private dataSource: DataSource,
    @InjectRepository(PaymentEntity) private readonly paymanetRepo: Repository<PaymentEntity>,
    @InjectRepository(StudentEntity) private readonly studentRepo: Repository<StudentEntity>,

  ) { super(paymanetRepo) }
  // ------------------ PROCCESS LESSON PAYMENT ------------------

  async processLessonPayment(dto: {
    price: number,
    studentId: number,
    role?: Roles,
    lessonId: number
  }) {
    const { studentId, role, lessonId } = dto;
    const price = Number(dto.price);

    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Dars mavjudligini tekshirish
        const lesson = await manager.findOne(ScheduleEntity, { where: { id: lessonId } });
        if (!lesson) {
          throw new BadRequestException(`${lessonId}-IDli dars topilmadi`);
        }

        // 2. Studentni tekshirish
        const student = await manager.findOne(StudentEntity, {
          where: { id: studentId, isActive: true, isDeleted: false },
          lock: { mode: 'pessimistic_write' }
        });

        if (!student) {
          throw new BadRequestException(`${studentId}-IDli aktiv student topilmadi`);
        }

        const studentWallet = Number(student.wallet);
        if (studentWallet < price) {
          throw new BadRequestException(`Balans yetarli emas. Balans: ${studentWallet}`);
        }

        // 3. Tizim hamyoni
        const courseWalletEntity = await manager.findOne(CourseEntity, {
          where: { name: CourseSetting.NAME }
        });

        if (!courseWalletEntity) {
          throw new BadRequestException("Tizim hamyoni topilmadi");
        }

        // 4. Balanslarni yangilash
        student.wallet = studentWallet - price;
        courseWalletEntity.wallet = Number(courseWalletEntity.wallet) + price;

        await manager.save(student);
        await manager.save(courseWalletEntity);

        // 5. To'lov tarixini yaratish
        const payment = manager.create(PaymentEntity, {
          lessonId,
          studentId,
          price: price,
          status: PaymentStatus.PAID,
          role: role,
          reason: 'Lesson booking'
        });

        return await manager.save(payment);

      } catch (error) {
        // Xatoni konsolga chiqarish (Siz so'ragan qism)
        console.error('--- PAYMENT ERROR LOG ---');
        console.error('Message:', error.message);
        console.error('Detail:', error.detail); // Baza xatosi (FK xatosi bo'lsa, qaysi ID ekanini ko'rsatadi)
        console.error('Stack:', error.stack);
        throw error;
      }
    });
  }

  // ------------------ FIND ALL LESSON PAYMENT ------------------

  async findAllPayment(filters: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    role?: Roles;
    search?: string;
    active?: boolean;
    deleted?: boolean;
    userId?: number;
  }) {
    const {
      page = 1,
      limit = 100,
      status,
      role,
      search,
      active,
      deleted = false,
      userId
    } = filters;

    const queryBuilder = this.paymanetRepo.createQueryBuilder('payment');

    // 1. Oddiy filtrlar
    queryBuilder.where('payment.isDeleted = :deleted', { deleted });

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }
    if (role) {
      queryBuilder.andWhere('payment.role = :role', { role });
    }
    if (active !== undefined) {
      queryBuilder.andWhere('payment.isActive = :active', { active });
    }

    if (userId) {
      queryBuilder.andWhere('payment.studentId = :userId OR payment.teacherId = :userId ', { userId });
    }

    // 2. Maxsus Qidiruv (lessonId, studentId, teacherId, reason)
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('payment.reason ILIKE :search', { search: `%${search}%` })
            .orWhere('CAST(payment.id AS TEXT) ILIKE :search', { search: `%${search}%` }) // ID
            .orWhere('CAST(payment.lessonId AS TEXT) ILIKE :search', { search: `%${search}%` }) // Dars ID
            .orWhere('CAST(payment.studentId AS TEXT) ILIKE :search', { search: `%${search}%` }) // Talaba ID
            .orWhere('CAST(payment.teacherId AS TEXT) ILIKE :search', { search: `%${search}%` }); // O'qituvchi ID
        }),
      );
    }

    // 3. Pagination va Ma'lumotlarni yuklash
    const skip = (page - 1) * limit;

    const [data, total] = await queryBuilder
      .orderBy('payment.createdAt', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    // 4. Statistika (Siz so'ragandek)
    const activeCount = await this.paymanetRepo.count({
      where: { isActive: true, isDeleted: false },
    });
    const inactiveCount = await this.paymanetRepo.count({
      where: { isActive: false, isDeleted: false },
    });
    const deletedCount = await this.paymanetRepo.count({
      where: { isDeleted: true },
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      stats: {
        active: activeCount,
        inactive: inactiveCount,
        deleted: deletedCount,
      },
    };
  }
  // ------------------ FIND ALL USER PAYMENT ------------------

  async findAllForUser(
    id: number,
    status?: PaymentStatus,
    search?: string,
    page: number = 1,
    limit: number = 100,
    role?: string,
  ) {
    // 1. Asosiy shart (Kim so'rayotganiga qarab)
    const baseWhere: any = {};
    if (role === Roles.TEACHER) {
      baseWhere.teacher = { id };
    } else if (role === Roles.STUDENT) {
      baseWhere.student = { id };
    }

    // 2. Status filtri
    if (status) {
      baseWhere.status = status;
    }

    // 3. Search mantiqi (Massiv ko'rinishida OR operatori bo'ladi)
    let whereConditions: any | any[] = baseWhere;

    if (search) {
      const searchPattern = ILike(`%${search}%`);

      if (role === Roles.TEACHER) {
        // Teacher bo'lsa: Student ismi/familiyasi yoki to'lov sababidan qidiradi
        whereConditions = [
          { ...baseWhere, student: { firstName: searchPattern } },
          { ...baseWhere, student: { lastName: searchPattern } },
          { ...baseWhere, reason: searchPattern },
        ];
      } else {
        // Student bo'lsa: Teacher ismi/familiyasi yoki to'lov sababidan qidiradi
        whereConditions = [
          { ...baseWhere, teacher: { fullname: searchPattern } },
          { ...baseWhere, reason: searchPattern },
        ];
      }
    }

    // 4. Ma'lumotlarni olish va hisoblash
    const skip = (page - 1) * limit;

    const [data, total] = await this.paymanetRepo.findAndCount({
      where: whereConditions,
      relations: {
        student: true,
        teacher: true,
        lesson: true
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    const stats = {
      pending: await this.paymanetRepo.count({ where: { ...baseWhere, status: PaymentStatus.PENDING } }),
      pendingCanceled: await this.paymanetRepo.count({ where: { ...baseWhere, status: PaymentStatus.PENDING_CANCELED } }),
      paid: await this.paymanetRepo.count({ where: { ...baseWhere, status: PaymentStatus.PAID } }),
      paidCanceled: await this.paymanetRepo.count({ where: { ...baseWhere, status: PaymentStatus.PAID_CANCELED } }),
    };

    // 6. Natija qaytarish
    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      stats
    };
  }
}
