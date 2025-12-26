import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { LessonTemplateEntity } from './entities/lesson-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { google } from 'googleapis';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';

@Injectable()
export class LessonTemplateService extends BaseService<CreateLessonTemplateDto, UpdateLessonTemplateDto, LessonTemplateEntity> {
  constructor(
    @InjectRepository(LessonTemplateEntity)
    private readonly lessonTempRepo: Repository<LessonTemplateEntity>, // Nomi lessonTempRepo
    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
  ) { super(lessonTempRepo) }

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

    try {
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
          summary: `Dars: ${dto.name}`,
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
        name: dto.name,
        teacherId: teacher.id,
        googleEventId: String(event.data.id),
        meetLink: meetLink,
        startTime: startDate,
        endTime: endDate,
        status: 'available',
      });

      return await this.lessonTempRepo.save(newLesson);

    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Xatolik:', error.response?.data || error.message);
      throw new InternalServerErrorException('Google API bilan ishlashda xatolik yuz berdi');
    }
  }

  async bookLessonByStudent(studentId: number, lessonId: number) {
    const lesson = await this.lessonTempRepo.findOne({
      where: { id: lessonId },
      relations: { teacher: true }
    });

    // lesson null bo'lishi mumkinligini tekshirish (Error 95 va 89-90 uchun)
    if (!lesson) throw new NotFoundException("Lesson not found");

    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException("Student not found");

    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: lesson.teacher.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.patch({
      calendarId: 'primary',
      eventId: lesson.googleEventId,
      sendUpdates: 'all',
      requestBody: {
        attendees: [{ email: student.phoneNumber }],
      },
    });

    lesson.studentId = student.id;
    lesson.status = 'booked';

    await this.lessonTempRepo.save(lesson);

    return {
      message: "Dars muvaffaqiyatli band qilindi",
      meetLink: lesson.meetLink
    };
  }
}
