import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { LessonTemplateEntity } from './entities/lesson-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { StudentEntity } from 'src/api/user/student/entities/student.entity';

@Injectable()
export class LessonTemplateService extends BaseService<CreateLessonTemplateDto,
  UpdateLessonTemplateDto, LessonTemplateEntity> {
  constructor(@InjectRepository(LessonTemplateEntity)
  private readonly lessonTempRepo: Repository<LessonTemplateEntity>,
    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
  ) { super(lessonTempRepo) }

  // ----------------------- CREATE LESSON TEMPLATE -----------------------
  async createLessonByTeacher(teacherId: number, dto: CreateLessonTemplateDto) {
    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException(`${teacherId} is not found on Teacher`)
    }

    if (!teacher.googleRefreshToken) {
      throw new NotFoundException(`${teacherId} is not found refresh token`)
    }
    // 1. Google Auth sozlash
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: teacher.googleRefreshToken })
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 2. Google Calendar'da dars yaratish
    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Dars: ${dto.name}`,
        start: { dateTime: new Date(dto.startTime).toISOString() },
        end: { dateTime: new Date(dto.finishTime).toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `req-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    // 3. Bazaga saqlash (Keyinchalik talaba yozilishi uchun)
    const newLesson = await this.lessonTempRepo.save({
      teacherId: teacher.id,
      googleEventId: event.data.id,
      meetLink: event.data.hangoutLink,
      startTime: dto.startTime,
      endTime: dto.finishTime,
      status: 'available',
    });

    return newLesson;
  }

  async bookLessonByStudent(studentId: number, lessonId: number) {
    const lesson = await this.lessonTempRepo.findOne({ where: { id: lessonId }, relations: ['teacher'] });
    const student = await this.studentRepo.findOne({ where: { id: studentId } });

    // 1. O'qituvchining tokeni bilan Calendar'ga ulanish
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    // oauth2Client.setCredentials({ refresh_token: lesson });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 2. Mavjud event'ni yangilash (Talabani qo'shish)
    await calendar.events.patch({
      calendarId: 'primary',
      eventId: lesson.googleEventId,
      sendUpdates: 'all', // Talabaga email boradi
      requestBody: {
        attendees: [{ email: student.email }], // Talaba emailini qo'shish
      },
    });

    // 3. Bazada darsni band qilingan deb belgilash
    lesson.studentId = student.id;
    lesson.status = 'booked';
    await this.lessonRepo.save(lesson);

    return {
      message: "Dars muvaffaqiyatli band qilindi",
      meetLink: lesson.meetLink // Talabaga linkni ko'rsatish
    };
  }
}
