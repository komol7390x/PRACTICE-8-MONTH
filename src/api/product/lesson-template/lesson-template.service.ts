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
      throw new NotFoundException(`Teacher or Google Token not found`);
    }

    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: teacher.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

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

    const newLesson = this.lessonTempRepo.create({
      name: dto.name,
      teacherId: teacher.id,
      googleEventId: event.data.id ?? undefined,
      meetLink: event.data.hangoutLink ?? undefined,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.finishTime),
      status: 'available',
    } as Partial<LessonTemplateEntity>);

    return await this.lessonTempRepo.save(newLesson);
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
      eventId: lesson.googleEventId, // Teacher ID emas, Google Event ID bo'lishi kerak
      sendUpdates: 'all',
      requestBody: {
        attendees: [{ email: student.phoneNumber }], // Agar studentda email bo'lsa email qo'ying
      },
    });

    // Endi xato bermaydi, chunki lesson null emasligini tekshirdik
    lesson.studentId = student.id;
    lesson.status = 'booked';

    // this.lessonRepo emas, this.lessonTempRepo!
    await this.lessonTempRepo.save(lesson);

    return {
      message: "Dars muvaffaqiyatli band qilindi",
      meetLink: lesson.meetLink
    };
  }
}
