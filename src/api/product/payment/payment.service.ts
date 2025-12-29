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
import { successRes } from 'src/infrastructure/response/success.response';
import { Roles } from 'src/common/enum/roles.enum';
import { LessonTemplateEntity } from '../lesson-template/entities/lesson-template.entity';
import { BookedLesson } from '../lesson-template/enum/booked-type';
import { PaymentStatus } from './enum/payment-status';

@Injectable()
export class PaymentService extends BaseService<CreatePaymentDto, UpdatePaymentDto, PaymentEntity> {
  constructor(private dataSource: DataSource,
    @InjectRepository(PaymentEntity) private readonly paymanetRepo: Repository<PaymentEntity>,
    @InjectRepository(LessonTemplateEntity) private readonly lessonRepo: Repository<LessonTemplateEntity>
  ) { super(paymanetRepo) }
  // ------------------ PROCCESS LESSON PAYMENT ------------------

  async processLessonPayment(dto: {
    price: number,
    studentId: number,
    role?: Roles,
    lessonId: number
  }) {
    const { price, studentId, role, lessonId } = dto
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Studentni transaction ichida topish
      const student = await queryRunner.manager.findOne(StudentEntity, {
        where: { id: studentId, isActive: true, isDeleted: false }
      });

      if (!student || student.wallet < price) {
        throw new BadRequestException("Studentning balansi yetarli emas yoki topilmadi");
      }

      const courseWallet = await queryRunner.manager.findOne(CourseEntity, {
        where: { name: CourseSetting.NAME }
      });

      if (!courseWallet) {
        throw new BadRequestException("Tizim hamyoni topilmadi");
      }

      // 3. MANTIQ: Hamma pulni kurs hamyoniga "muzlatish"
      student.wallet -= price;
      courseWallet.wallet += price;

      // 4. Ma'lumotlarni saqlash (queryRunner orqali)
      await queryRunner.manager.save(student);
      await queryRunner.manager.save(courseWallet);

      await queryRunner.commitTransaction();

      await this.paymanetRepo.save(this.paymanetRepo.create({
        lessonId,
        studentId,
        price,
        status: PaymentStatus.PAID,
        role: role
      }))

      return successRes({
        message: "To'lov qabul qilindi va tizimda muzlatildi",
        balance: student.wallet
      }, 201)

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException("To'lov jarayonida xato: " + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
