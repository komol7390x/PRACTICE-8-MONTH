import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { PaymentEntity } from './entities/payment.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { Roles } from 'src/common/enum/roles.enum';
import { PaymentStatus } from './enum/payment-status';
import { CourseSetting } from '../course/enum/cours-name';
import { CourseEntity } from '../course/entities/course.entity';

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
    // 1. Kiruvchi price'ni raqamga o'girish
    const price = Number(dto.price);
    const { studentId, role, lessonId } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const student = await queryRunner.manager.findOne(StudentEntity, {
        where: { id: studentId, isActive: true, isDeleted: false },
        lock: { mode: 'pessimistic_write' }
      });

      if (!student) {
        throw new BadRequestException(`${studentId} student topilmadi`);
      }

      // 2. Student hamyonini raqamga o'girib tekshirish
      const studentWallet = Number(student.wallet);

      if (studentWallet < price) {
        throw new BadRequestException(`Student balansida mablag' yetarli emas. Balans: ${studentWallet}, Narx: ${price}`);
      }

      const courseWalletEntity = await queryRunner.manager.findOne(CourseEntity, {
        where: { name: CourseSetting.NAME }
      });

      if (!courseWalletEntity) {
        throw new BadRequestException("Tizim hamyoni topilmadi");
      }

      // 3. Hisob-kitob qismini Number bilan bajarish
      const currentCourseWallet = Number(courseWalletEntity.wallet);

      student.wallet = studentWallet - price;
      courseWalletEntity.wallet = currentCourseWallet + price;

      // 4. Ma'lumotlarni saqlash
      await queryRunner.manager.save(student);
      await queryRunner.manager.save(courseWalletEntity);

      // 5. To'lov tarixini saqlash
      const payment = queryRunner.manager.create(PaymentEntity, {
        lessonId,
        studentId,
        price: price,
        status: PaymentStatus.PAID,
        role: role,
        reason: 'Lesson booking'
      });
      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();
      return true;

    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      if (!(error instanceof BadRequestException)) {
        await this.paymanetRepo.save(this.paymanetRepo.create({
          lessonId,
          studentId,
          price: price,
          status: PaymentStatus.PAID_CANCELED,
          role: role
        }));
      }

      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException("To'lov jarayonida xato: " + error.message);

    } finally {
      await queryRunner.release();
    }
  }

  async findAllPayment(filters: {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    role?: Roles;
    search?: string;
    active?: boolean;
    deleted?: boolean;
  }) {
    const {
      page = 1,
      limit = 100,
      status,
      role,
      search,
      active,
      deleted = false,
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

    // 2. Maxsus Qidiruv (lessonId, studentId, teacherId, reason)
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('payment.reason ILIKE :search', { search: `%${search}%` }) // Sababi bo'yicha
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
}
