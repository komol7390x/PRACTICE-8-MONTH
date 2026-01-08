import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { LessonTemplateEntity } from './entities/lesson-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { google } from 'googleapis';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { BookedLesson } from './enum/booked-type';
import { Cron } from '@nestjs/schedule';
import { WeekDays } from './enum/week-day';
import { PaymentService } from '../payment/payment.service';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthService } from 'src/api/user/auth/auth.service';
import { CourseEntity } from '../course/entities/course.entity';
import { CourseSetting } from '../course/enum/cours-name';
import { ScheduleEntity } from '../schedule/entities/schedule.entity';

@Injectable()
export class LessonTemplateService extends BaseService<CreateLessonTemplateDto, UpdateLessonTemplateDto, LessonTemplateEntity> {
  private readonly logger = new Logger('DAILY_CLEANUP');

  constructor(
    @InjectRepository(LessonTemplateEntity)
    private readonly lessonTempRepo: Repository<LessonTemplateEntity>,

    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,

    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepo: Repository<ScheduleEntity>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,


    private readonly dataSource: DataSource,
    private readonly paymentService: PaymentService,

  ) { super(lessonTempRepo) }

  // ------------------------BOOKED LESSON BY STUDENT------------------------

  async bookScheduleByStudent(studentId: number, scheduleId: number, dto: CreateLessonTemplateDto) {
    const { startTime, finishTime } = dto;

    // 1. Student va Schedule topish (relations bilan)
    const [student, schedule] = await Promise.all([
      this.studentRepo.findOne({ where: { id: studentId } }),
      this.scheduleRepo.findOne({ where: { id: scheduleId }, relations: { teacher: true } })
    ]);

    if (!student) throw new NotFoundException("Talaba topilmadi.");
    if (!schedule) throw new NotFoundException("Dars jadvali topilmadi.");

    // 2. Vaqtlarni aniqlash
    const startMs = Number(startTime) * (startTime < 10000000000 ? 1000 : 1);
    const endMs = Number(finishTime) * (finishTime < 10000000000 ? 1000 : 1);
    const selectedStart = new Date(startMs);
    const selectedEnd = new Date(endMs);

    // --- MUHIM TUZATISH: SANA VA VAQTNI TO'LIQ TEKSHIRISH ---
    if (selectedStart < schedule.startTime || selectedEnd > schedule.endTime) {
      throw new BadRequestException("Tanlangan vaqt o'qituvchi jadvalidan tashqarida.");
    }

    // Tanlangan vaqt dars vaqti bilan bir xil kunda ekanligini tekshirish (Optional lekin tavsiya etiladi)
    if (selectedStart.toDateString() !== schedule.startTime.toDateString()) {
      throw new BadRequestException("Tanlangan sana o'qituvchi belgilagan sanaga mos emas.");
    }

    // 3. Overlap check
    const overlapping = await this.lessonTempRepo.findOne({
      where: {
        teacherId: schedule.teacherId,
        status: BookedLesson.BOOKED,
        startTime: LessThan(selectedEnd),
        endTime: MoreThan(selectedStart),
        isDeleted: false
      },
    });
    if (overlapping) throw new BadRequestException("Bu vaqt allaqachon band qilingan.");

    // 4. Narxni soatbay hisoblash
    const durationInHours = (endMs - startMs) / (1000 * 60 * 60);
    if (durationInHours <= 0) throw new BadRequestException("Vaqt oralig'i noto'g'ri.");
    const totalPrice = Math.round(Number(schedule.price) * durationInHours);

    // 5. To'lov (Tranzaksiya ichida bo'lishi tavsiya etiladi)
    const payment = await this.paymentService.processLessonPayment({
      price: totalPrice,
      lessonId: schedule.id,
      studentId,
      role: Roles.STUDENT
    });
    if (!payment) throw new ConflictException("To'lov amalga oshmadi.");

    // 6. Saqlash
    const bookedLesson = this.lessonTempRepo.create({
      teacherId: schedule.teacherId,
      studentId: studentId,
      lessonName: schedule.lessonName,
      price: totalPrice,
      startTime: selectedStart,
      endTime: selectedEnd,
      googleEventId: schedule.googleEventId,
      meetLink: schedule.meetLink,
      status: BookedLesson.BOOKED,
      weekDays: schedule.weekDays
    });

    return await this.lessonTempRepo.save(bookedLesson);
  }

 

  // ------------------GET ALL LESSON BOOK ------------------

  async findAllBookLesson(filters: {
    page?: number;
    limit?: number;
    status?: BookedLesson;
    weekday?: WeekDays;
    teacherId?: number;
    studentId?: number;
    isPaid?: boolean;
    search?: string;
    active?: boolean;
  }) {
    // Obyektdan o'zgaruvchilarni ajratib olamiz (default qiymatlar bilan)
    const {
      page = 1,
      limit = 100,
      status,
      weekday,
      teacherId,
      studentId,
      isPaid,
      search,
      active,
    } = filters;
    // 1. Asosiy shartlar
    let where: any = { isDeleted: false };

    // 2. Filtrlar
    if (status) where.status = status;
    if (teacherId) where.teacherId = teacherId;
    if (studentId) where.studentId = studentId;
    if (isPaid !== undefined) where.isPaidToTeacher = isPaid;
    if (active !== undefined) where.isActive = active;
    if (weekday) where.weekDays = weekday;

    // 3. Search mantiqi
    if (search) {
      const isNumber = !isNaN(Number(search));
      if (isNumber) {
        where.id = Number(search);
      } else {
        where.lessonName = ILike(`%${search}%`);
      }
    }

    // 4. Pagination hisoblash
    const skip = (page - 1) * limit;

    const [data, total] = await this.lessonTempRepo.findAndCount({
      where,
      relations: {
        student: true,
        teacher: true
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip
    });

    const activeCount = await this.lessonTempRepo.count({
      where: { ...where, isActive: true, isDeleted: false },
    });

    const inactiveCount = await this.lessonTempRepo.count({
      where: { ...where, isActive: false, isDeleted: false },
    });

    const deletedCount = await this.lessonTempRepo.count({
      where: { ...where, isDeleted: true },
    });

    // 5. Natijani qaytarish
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

  // ------------------ UPDATE LESSON ------------------

  async updateBookedLessonByStudent(lessonId: number, studentId: number, dto: UpdateLessonTemplateDto) {
    const { startTime, finishTime } = dto;

    if (!startTime || !finishTime) {
      throw new BadRequestException("Boshlanish va tugash vaqti yuborilishi shart!");
    }

    // 1. Darsni topish va unga tegishli ekanligini tekshirish
    const lesson = await this.lessonTempRepo.findOne({
      where: { id: lessonId, studentId, isDeleted: false },
      relations: { teacher: true }
    });

    if (!lesson) {
      throw new NotFoundException("Dars topilmadi yoki sizga tegishli emas");
    }

    // 2. MUHIM: Faqat ertangi va undan keyingi kunlar uchun update ruxsat berish
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Ertaga 00:00:00

    // Hozirgi dars vaqti bugun bo'lsa o'zgartirib bo'lmaydi
    if (lesson.startTime < tomorrow) {
      throw new BadRequestException("Bugungi darslarni o'zgartira olmaysiz. Faqat kelajakdagi darslar uchun.");
    }

    // 3. Yangi vaqtlarni formatlash
    const startMs = Number(startTime) * (startTime < 10000000000 ? 1000 : 1);
    const endMs = Number(finishTime) * (finishTime < 10000000000 ? 1000 : 1);
    const newStartDate = new Date(startMs);
    const newEndDate = new Date(endMs);

    if (newStartDate < tomorrow) {
      throw new BadRequestException("Yangi vaqt kamida ertangi kundan boshlanishi kerak.");
    }

    if (newEndDate <= newStartDate) {
      throw new BadRequestException("Tugash vaqti boshlanish vaqtidan keyin bo'lishi shart.");
    }

    const oldDuration = (lesson.endTime.getTime() - lesson.startTime.getTime()) / (1000 * 60 * 60);
    const hourlyRate = Number(lesson.price) / oldDuration;

    const newDuration = (endMs - startMs) / (1000 * 60 * 60);
    const newTotalPrice = Math.round(hourlyRate * newDuration);

    const overlapping = await this.lessonTempRepo.findOne({
      where: {
        id: Not(lesson.id), // O'zini hisobga olmaydi
        teacherId: lesson.teacherId,
        status: BookedLesson.BOOKED,
        startTime: LessThan(newEndDate),
        endTime: MoreThan(newStartDate),
      },
    });

    if (overlapping) {
      throw new BadRequestException("Bu vaqtda o'qituvchining boshqa darsi bor.");
    }

    lesson.startTime = newStartDate;
    lesson.endTime = newEndDate;
    lesson.price = newTotalPrice;

    const weekDayMap = [
      WeekDays.SUNDAY, WeekDays.MONDAY, WeekDays.TUESDAY,
      WeekDays.WEDNESDAY, WeekDays.THURSDAY, WeekDays.FRIDAY, WeekDays.SATURDAY
    ];
    lesson.weekDays = weekDayMap[newStartDate.getDay()];

    await this.lessonTempRepo.save(lesson);

    return {
      message: "Dars vaqti muvaffaqiyatli o'zgartirildi",
      meetLink: lesson.meetLink, // O'sha eski link qaytadi
      newPrice: newTotalPrice,
      newTime: `${newStartDate.toLocaleString()} - ${newEndDate.toLocaleTimeString()}`
    };
  }

  // ------------------ CRON EXPIRE TIME ------------------

  // Cron logikasini bitta joyda jamlash tavsiya etiladi
  @Cron('1 1 * * *')
  async handleLessonStatusAndPayouts() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const now = new Date();

      // 1. Kurs hamyonini tekshirish (Muhim joyi!)
      const courseWallet = await queryRunner.manager.findOne(CourseEntity, {
        where: { name: CourseSetting.NAME }
      });

      if (!courseWallet) {
        this.logger.error("Course wallet topilmadi. To'lovlar to'xtatildi.");
        await queryRunner.rollbackTransaction();
        return;
      }

      await queryRunner.manager.update(LessonTemplateEntity,
        { startTime: LessThan(now), status: BookedLesson.PENDING },
        { status: BookedLesson.EXPIRED, isActive: false }
      );

      const finishedLessons = await queryRunner.manager.find(LessonTemplateEntity, {
        where: {
          endTime: LessThan(now), // Dars tugagan bo'lishi kerak
          status: BookedLesson.BOOKED,
          isPaidToTeacher: false
        },
        relations: { teacher: true }
      });

      for (const lesson of finishedLessons) {
        const teacherShare = Math.floor(Number(lesson.price) * 0.9);

        if (courseWallet.wallet >= teacherShare) {
          courseWallet.wallet = Number(courseWallet.wallet) - teacherShare;
          lesson.teacher.wallet = Number(lesson.teacher.wallet) + teacherShare;

          lesson.status = BookedLesson.COMPLETED;
          lesson.isPaidToTeacher = true;
          lesson.isActive = false;

          await queryRunner.manager.save(lesson.teacher);
          await queryRunner.manager.save(lesson);
        } else {
          this.logger.warn(`Kurs hamyonida mablag' yetarli emas. Lesson ID: ${lesson.id}`);
        }
      }
      await queryRunner.manager.save(courseWallet);

      await queryRunner.commitTransaction();
      this.logger.log("Darslar holati yangilandi va to'lovlar yakunlandi.");

    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      this.logger.error("Cron xatosi: " + error.message);
    } finally {
      await queryRunner.release();
    }
  }

}
