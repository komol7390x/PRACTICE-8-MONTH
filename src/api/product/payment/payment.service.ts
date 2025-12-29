import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { PaymentEntity } from './entities/payment.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from 'src/api/user/course/entities/course.entity';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { CourseSetting } from 'src/api/user/course/enum/cours-name';
import { Roles } from 'src/common/enum/roles.enum';
import { LessonTemplateEntity } from '../lesson-template/entities/lesson-template.entity';
import { PaymentStatus } from './enum/payment-status';

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
}
