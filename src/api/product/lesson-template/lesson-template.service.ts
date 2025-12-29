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
import { CourseEntity } from 'src/api/user/course/entities/course.entity';
import { CourseSetting } from 'src/api/user/course/enum/cours-name';
import { WeekDays } from './enum/week-day';
import { PaymentService } from '../payment/payment.service';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthService } from 'src/api/user/auth/auth.service';

@Injectable()
export class LessonTemplateService extends BaseService<CreateLessonTemplateDto, UpdateLessonTemplateDto, LessonTemplateEntity> {
  private readonly logger = new Logger('DAILY_CLEANUP');

  constructor(
    @InjectRepository(LessonTemplateEntity)
    private readonly lessonTempRepo: Repository<LessonTemplateEntity>,

    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,

    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,

    private readonly dataSource: DataSource,
    private readonly paymentService: PaymentService,
    private readonly authService: AuthService
  ) { super(lessonTempRepo) }

  // --------------------------- CREATE TEACHER LESSON ---------------------------

  async createLessonByTeacher(teacherId: number, dto: CreateLessonTemplateDto) {
    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    if (!teacher || !teacher.googleRefreshToken) {
      throw new NotFoundException(`O'qituvchi yoki Google Token topilmadi`);
    }

    // 2. Vaqtlarni Date formatiga o'tkazish
    const startDate = new Date(Number(dto.startTime) * (dto.startTime < 10000000000 ? 1000 : 1));
    const endDate = new Date(Number(dto.finishTime) * (dto.finishTime < 10000000000 ? 1000 : 1));
    const now = new Date(); // Hozirgi vaqt

    // --- 1-TEKSHIRUV: O'TMISHGA DARS QO'SHISHNI TAQIQLASH ---
    if (startDate <= now) {
      throw new BadRequestException(`O'tib ketgan vaqtga dars qo'shib bo'lmaydi! Hozirgi vaqt: ${now.toLocaleString()}`);
    }

    if (endDate <= startDate) {
      throw new BadRequestException(`Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak!`);
    }

    // --- 2-TEKSHIRUV: DATABASE (DB) TEKSHIRUVI ---
    const existingInDb = await this.lessonTempRepo.findOne({
      where: {
        teacherId: teacher.id,
        startTime: LessThan(endDate),
        endTime: MoreThan(startDate),
      },
    });

    if (existingInDb) {
      throw new BadRequestException(`Bazada bu vaqtda dars mavjud!`);
    }
    await this.authService.refreshGoogleToken(teacher.id)
    // 3. Google Calendar API sozlash
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: teacher.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // --- 3-TEKSHIRUV: GOOGLE CALENDAR TEKSHIRUVI ---
    const googleEvents = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
    });

    if (googleEvents.data.items && googleEvents.data.items.length > 0) {
      const firstEvent = googleEvents.data.items[0];
      throw new BadRequestException(`Google Calendar'da bu vaqt band: ${firstEvent.summary || 'Band'}`);
    }

    // 4. HAMMASI TO'G'RI BO'LSA - TADBIR YARATISH
    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Dars: ${dto.lessonName}`,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `lesson-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = event.data.hangoutLink;
    if (!meetLink) {
      throw new InternalServerErrorException("Google Meet havolasini yaratishda muammo bo'ldi.");
    }
    const getDays = new Date(startDate).getDay()
    const weekDayMap = [
      WeekDays.SUNDAY,    // 0
      WeekDays.MONDAY,    // 1
      WeekDays.TUESDAY,   // 2
      WeekDays.WEDNESDAY, // 3
      WeekDays.THURSDAY,  // 4
      WeekDays.FRIDAY,    // 5
      WeekDays.SATURDAY,  // 6
    ];
    const weekDay = weekDayMap[getDays]

    // 5. BAZAGA SAQLASH
    const newLesson = this.lessonTempRepo.create({
      lessonName: dto.lessonName,
      teacherId: teacher.id,
      googleEventId: String(event.data.id),
      meetLink: meetLink,
      weekDays: weekDay,
      startTime: startDate,
      endTime: endDate,
      status: BookedLesson.AVAILABLE,
      price: dto.lessonPrice
    });

    return await this.lessonTempRepo.save(newLesson);
  }
  // ------------------------BOOKED LESSON BY STUDENT------------------------

  async bookLessonByStudent(studentId: number, lessonId: number) {

    const lesson = await this.lessonTempRepo.findOne({
      where: { id: lessonId, isActive: true, isDeleted: false, status: BookedLesson.AVAILABLE },
      relations: { teacher: true }
    });
    if (!lesson) throw new NotFoundException("Lesson not found");

    const price = lesson.price

    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException("Student not found");

    const payment = await this.paymentService.processLessonPayment({ price, lessonId, studentId, role: Roles.STUDENT })
    if (!payment) {
      throw new ConflictException(`${studentId} not paid`)
    }
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET);

    oauth2Client.setCredentials({ refresh_token: lesson.teacher.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.patch({
      calendarId: 'primary',
      eventId: lesson.googleEventId,
      sendUpdates: 'all',
      requestBody: {
        attendees: [{ email: `${student.phoneNumber}@example.com` }],
      },
    });

    lesson.studentId = student.id;
    lesson.status = BookedLesson.BOOKED

    await this.lessonTempRepo.save(lesson);

    return {
      message: "Dars muvaffaqiyatli band qilindi",
      meetLink: lesson.meetLink
    };
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
    // skip - nechtasini tashlab yuborish, take - nechtasini olish
    const skip = (page - 1) * limit;

    // 5. Ma'lumotlarni olish (findAndCount jami sonini ham qaytaradi)
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

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      }
    };
  }
  // ------------------ UPDATE LESSON ------------------

  async updateLessonByTeacher(lessonId: number, teacherId: number, dto: UpdateLessonTemplateDto) {
    // 1. Darsni va o'qituvchini tekshirish
    const lesson = await this.lessonTempRepo.findOne({
      where: { id: lessonId, teacherId, isDeleted: false },
      relations: { teacher: true }
    });

    if (!lesson) {
      throw new NotFoundException("Dars topilmadi yoki sizga tegishli emas");
    }

    if (lesson.status === BookedLesson.BOOKED) {
      throw new BadRequestException("Band qilingan darsni o'zgartirib bo'lmaydi");
    }

    // 2. Vaqtlarni yangilash (agar DTO da kelgan bo'lsa)
    let startDate = lesson.startTime;
    let endDate = lesson.endTime;
    let timeChanged = false;

    if (dto.startTime || dto.finishTime) {
      timeChanged = true;
      startDate = dto.startTime
        ? new Date(Number(dto.startTime) * (dto.startTime < 10000000000 ? 1000 : 1))
        : lesson.startTime;
      endDate = dto.finishTime
        ? new Date(Number(dto.finishTime) * (dto.finishTime < 10000000000 ? 1000 : 1))
        : lesson.endTime;

      // Vaqt mantiqi tekshiruvi
      const now = new Date();
      if (startDate <= now) throw new BadRequestException("O'tmishga darsni ko'chirib bo'lmaydi");
      if (endDate <= startDate) throw new BadRequestException("Tugash vaqti noto'g'ri");

      // DB To'qnashuvni tekshirish (o'zini hisobga olmagan holda)
      const existingInDb = await this.lessonTempRepo.findOne({
        where: {
          id: Not(lesson.id), // O'zini tekshirmaydi
          teacherId: teacherId,
          startTime: LessThan(endDate),
          endTime: MoreThan(startDate),
        },
      });
      if (existingInDb) throw new BadRequestException("Bu vaqtda boshqa darsingiz bor");
    }

    // 3. Google Calendar yangilash
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: lesson.teacher.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    try {
      await calendar.events.patch({
        calendarId: 'primary',
        eventId: lesson.googleEventId,
        requestBody: {
          summary: dto.lessonName ? `Dars: ${dto.lessonName}` : undefined,
          start: timeChanged ? { dateTime: startDate.toISOString() } : undefined,
          end: timeChanged ? { dateTime: endDate.toISOString() } : undefined,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException("Google Calendar'da yangilashda xato: " + error.message);
    }

    // 4. Hafta kunini qayta hisoblash (agar vaqt o'zgargan bo'lsa)
    if (timeChanged) {
      const weekDayMap = [
        WeekDays.SUNDAY, WeekDays.MONDAY, WeekDays.TUESDAY,
        WeekDays.WEDNESDAY, WeekDays.THURSDAY, WeekDays.FRIDAY, WeekDays.SATURDAY
      ];
      lesson.weekDays = weekDayMap[startDate.getDay()];
      lesson.startTime = startDate;
      lesson.endTime = endDate;
    }

    // 5. Boshqa maydonlarni yangilash
    if (dto.lessonName) lesson.lessonName = dto.lessonName;
    if (dto.lessonPrice) lesson.price = dto.lessonPrice;

    return await this.lessonTempRepo.save(lesson);
  }

  // ------------------ CRON EXPIRE TIME ------------------

  @Cron('1 0 * * *')
  async handleDailyCleanup() {
    this.logger.log('Kundalik tozalash boshlandi (00:01)...');

    const now = new Date();

    // 1. Vaqti o'tib ketgan va hali aktiv bo'lgan darslarni topish
    const expiredLessons = await this.lessonTempRepo.find({
      where: {
        startTime: LessThan(now),
        isActive: true,
      },
      relations: { teacher: true },
    });

    if (expiredLessons.length === 0) {
      this.logger.log("Tozalash uchun darslar topilmadi.");
      return;
    }

    this.logger.log(`${expiredLessons.length} ta darsni qayta ishlash boshlandi.`);

    for (const lesson of expiredLessons) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );
      oauth2Client.setCredentials({ refresh_token: lesson.teacher.googleRefreshToken });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      if (lesson.googleEventId) {
        try {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: lesson.googleEventId,
          });
          this.logger.log(`Google Event o'chirildi: ${lesson.googleEventId}`);
        } catch (googleError: any) {
          this.logger.warn(`Google Event o'chirishda xato (ID: ${lesson.googleEventId}): ${googleError.message}`);
        }
      }

      await this.lessonTempRepo.update(lesson.id, {
        isActive: false
      });
      this.logger.log(`Bazada dars deaktiv qilindi: ID ${lesson.id}`);
    }
    this.logger.log('Kundalik tozalash yakunlandi.');
  }
  // ------------------ LESSON PAYMENT TO TECHER------------------

  @Cron('1 1 * * *')
  async handleLessonStatusAndPayouts() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const now = new Date();

      // 1. Muddati o'tgan va sotilmagan darslarni EXPIRED qilish
      await queryRunner.manager.update(LessonTemplateEntity,
        { startTime: LessThan(now), status: BookedLesson.AVAILABLE },
        { status: BookedLesson.EXPIRED, isActive: false }
      );

      // 2. Kecha bo'lib o'tgan va BOOKED bo'lgan darslarni COMPLETED qilish va pulni o'tkazish
      const finishedLessons = await queryRunner.manager.find(LessonTemplateEntity, {
        where: {
          startTime: LessThan(now),
          status: BookedLesson.BOOKED,
          isPaidToTeacher: false
        },
        relations: { teacher: true }
      });

      const courseWallet = await queryRunner.manager.findOne(CourseEntity, { where: { name: CourseSetting.NAME } });
      if (!courseWallet) {
        throw new NotFoundException("Course wallet topilmadi");
      }

      for (const lesson of finishedLessons) {
        const teacherShare = lesson.price * 0.9;

        // Pul taqsimoti
        courseWallet.wallet -= teacherShare;
        lesson.teacher.wallet += teacherShare;

        // Statuslarni yangilash
        lesson.status = BookedLesson.COMPLETED;
        lesson.isPaidToTeacher = true;

        await queryRunner.manager.save(lesson.teacher);
        await queryRunner.manager.save(lesson);
      }

      await queryRunner.manager.save(courseWallet);
      await queryRunner.commitTransaction();

      this.logger.log("Darslar holati yangilandi va to'lovlar yakunlandi.");
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("Cron xatosi: " + error.message);
    } finally {
      await queryRunner.release();
    }
  }

}
