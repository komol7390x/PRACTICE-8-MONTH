import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { PaymentEntity } from './entities/payment.entity';
import { DataSource, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { Roles } from 'src/common/enum/roles.enum';
import { PaymentStatus } from './enum/payment-status';
import { CourseSetting } from '../course/enum/cours-name';
import { CourseEntity } from '../course/entities/course.entity';
import { successRes } from 'src/infrastructure/response/success.response';

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

  // ------------------ FIND ALL PAYMENT ------------------
  async findAllPayment(
    page: number = 1,
    limit: number = 100,
    active?: boolean,
    status?: PaymentStatus,
    role?: Roles,
    search?: string
  ) {
    const skip = (page - 1) * limit;

    // 1. Umumiy filtrlar (har doim qo'shiladigan)
    const baseCondition: any = { isDeleted: false };
    if (active !== undefined) baseCondition.isActive = active;
    if (status) baseCondition.status = status;
    if (role) baseCondition.role = role;

    // 2. "where" shartini shakllantirish
    let where: any;

    if (search) {
      const isNumber = !isNaN(Number(search));
      const searchNum = isNumber ? Number(search) : null;

      if (isNumber) {
        // Raqam bo'lsa OR mantiqi: lessonId YOKI studentId
        where = [
          { ...baseCondition, lessonId: searchNum },
          { ...baseCondition, studentId: searchNum }
        ];
      } else {
        // Matn bo'lsa: reason bo'yicha
        where = { ...baseCondition, reason: ILike(`%${search}%`) };
      }
    } else {
      // Search bo'lmasa shunchaki asosiy filtrlar
      where = baseCondition;
    }

    // 3. Ma'lumotlarni olish
    const [data, total] = await this.paymanetRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    // 4. Statistika (Xatolik chiqmasligi uchun baseCondition dan foydalanamiz)
    const activeCount = await this.paymanetRepo.count({
      where: { ...baseCondition, isActive: true }
    });

    const inactiveCount = await this.paymanetRepo.count({
      where: { ...baseCondition, isActive: false }
    });

    const deletedCount = await this.paymanetRepo.count({
      where: { isDeleted: true }
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
      }
    };
  }

  // ------------------ FIND ONE PAYMENT ------------------
  async findOnePayment(id: number) {
    const data = await this.paymanetRepo.findOne({ where: { id } });
    if (!data) {
      throw new NotFoundException(`${id} id payment not found`)
    }
    return successRes(data)
  }
}
