import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { LessonTemplateEntity } from './entities/lesson-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import { google } from 'googleapis';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';
import { BookedLesson } from './enum/booked-type';
import { Cron } from '@nestjs/schedule';
import { BookLessonByStudentDto } from './dto/book-lesson-by-student.dto';
import { CourseEntity } from 'src/api/user/course/entities/course.entity';
import { CourseSetting } from 'src/api/user/course/enum/cours-name';

@Injectable()
export class LessonTemplateService extends BaseService<CreateLessonTemplateDto, UpdateLessonTemplateDto, LessonTemplateEntity> {
  private readonly logger = new Logger('DAILY_CLEANUP');
  constructor(
    @InjectRepository(LessonTemplateEntity)
    private readonly lessonTempRepo: Repository<LessonTemplateEntity>,

    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,

    @InjectRepository(CourseEntity)
    private readonly coursRepo: Repository<CourseEntity>,

    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,

    private dataSource: DataSource
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

    // 5. BAZAGA SAQLASH
    const newLesson = this.lessonTempRepo.create({
      lessonName: dto.lessonName,
      teacherId: teacher.id,
      googleEventId: String(event.data.id),
      meetLink: meetLink,
      startTime: startDate,
      endTime: endDate,
      status: BookedLesson.AVAILABLE,
      price: dto.lessonPrice
    });

    return await this.lessonTempRepo.save(newLesson);
  }
  // ------------------------BOOKED LESSON BY STUDENT------------------------

  async bookLessonByStudent(studentId: number, dto: BookLessonByStudentDto) {
    const { lessonId, price } = dto
    
    const lesson = await this.lessonTempRepo.findOne({
      where: { id: lessonId, isActive: true, isDeleted: false, status: BookedLesson.AVAILABLE },
      relations: { teacher: true }
    });

    if (!lesson) throw new NotFoundException("Lesson not found");

    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException("Student not found");

    await this.processLessonPayment(studentId, price)
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

  async getAllBookLesson() {
    const bookLesson = await this.lessonTempRepo.find({
      relations: { student: true, teacher: true },
      where: { isDeleted: false },
      select: { student: true, teacher: true }
    })
    return bookLesson
  }

  // ------------------ PROCCESS LESSON PAYMENT ------------------

  async processLessonPayment(studentId: number, price: number) {

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
      student.wallet -= price;         // Studentdan to'liq ayiramiz
      courseWallet.wallet += price;    // Kursga to'liq qo'shamiz

      // 4. Ma'lumotlarni saqlash (queryRunner orqali)
      await queryRunner.manager.save(student);
      await queryRunner.manager.save(courseWallet);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: "To'lov qabul qilindi va tizimda muzlatildi",
        balance: student.wallet
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException("To'lov jarayonida xato: " + error.message);
    } finally {
      await queryRunner.release();
    }
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
