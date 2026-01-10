import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { ScheduleEntity } from './entities/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { WeekDays } from '../lesson-template/enum/week-day';
import { AuthService } from 'src/api/user/auth/auth.service';
import { google } from 'googleapis';

@Injectable()
export class ScheduleService extends BaseService<CreateScheduleDto, UpdateScheduleDto, ScheduleEntity> {
  constructor(
    @InjectRepository(ScheduleEntity) private readonly scheduleRepo: Repository<ScheduleEntity>,
    @InjectRepository(TeacherEntity) private readonly teacherRepo: Repository<TeacherEntity>,
    private readonly authService: AuthService
  ) { super(scheduleRepo) }

  // ------------------------- CREATE SCHEDULE -------------------------

  async createSchedule(teacherId: number, dto: CreateScheduleDto) {
    const { finishTime, lessonName, lessonPrice, startTime } = dto;

    // 1. O'qituvchini va Google Tokenni tekshirish
    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    if (!teacher) {
      throw new NotFoundException(`O'qituvchi topilmadi (ID: ${teacherId})`);
    }
    if (!teacher.googleRefreshToken) {
      throw new BadRequestException(`O'qituvchining Google hisobi ulanmagan!`);
    }

    // 2. Vaqtlarni formatlash (Unix timestamp yoki ISO string bo'lishi mumkin)
    const start = new Date(Number(startTime) * (Number(startTime) < 10000000000 ? 1000 : 1));
    const end = new Date(Number(finishTime) * (Number(finishTime) < 10000000000 ? 1000 : 1));
    const now = new Date();

    // 3. Vaqt validatsiyasi
    if (start <= now) {
      const formattedNow = now.toLocaleString('uz-UZ');
      throw new BadRequestException(`O'tib ketgan vaqtga dars qo'shib bo'lmaydi! Hozirgi vaqt: ${formattedNow}`);
    }

    if (end <= start) {
      throw new BadRequestException(`Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak!`);
    }

    // --- 4. DATABASE OVERLAP CHECK ---
    const overlappingSchedule = await this.scheduleRepo.findOne({
      where: {
        teacherId: teacherId,
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });
    
    if (overlappingSchedule) {
      const sTime = overlappingSchedule.startTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const eTime = overlappingSchedule.endTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      throw new BadRequestException(
        `Sizning jadvalingizda bu vaqt band: ${sTime} - ${eTime}`
      );
    }

    // --- 5. GOOGLE CALENDAR INTEGRATSIYASI ---
    // Tokenni yangilash
    await this.authService.refreshGoogleToken(teacher.id);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: teacher.googleRefreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Google Calendar'da bo'shligini tekshirish
    const googleEvents = await calendar.events.list({
      calendarId: 'primary',
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
    });

    if (googleEvents.data.items && googleEvents.data.items.length > 0) {
      const firstEvent = googleEvents.data.items[0];
      throw new BadRequestException(
        `Google Calendar'da bu vaqtda tadbir bor: ${firstEvent.summary || 'Band'}`
      );
    }

    // Google Meet havola bilan tadbir yaratish
    const event = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Dars: ${lessonName}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `schedule-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = event.data.hangoutLink;
    if (!meetLink) {
      throw new InternalServerErrorException("Google Meet havolasini yaratishda muammo bo'ldi.");
    }

    // 6. Haftaning kunini aniqlash
    const daysMap = [
      WeekDays.SUNDAY,
      WeekDays.MONDAY,
      WeekDays.TUESDAY,
      WeekDays.WEDNESDAY,
      WeekDays.THURSDAY,
      WeekDays.FRIDAY,
      WeekDays.SATURDAY,
    ];
    const currentWeekDay = daysMap[start.getDay()];

    // 7. BAZAGA SAQLASH
    const newSchedule = this.scheduleRepo.create({
      teacherId: teacher.id,
      lessonName: lessonName,
      price: lessonPrice,
      startTime: start,
      endTime: end,
      weekDays: currentWeekDay,
      googleEventId: String(event.data.id),
      meetLink: meetLink,
    });

    return await this.scheduleRepo.save(newSchedule);
  }

  // ------------------------- FIND ALL SCHEDULE -------------------------

  async findAllSchedule(
    teacherId?: number,
    active?: boolean,
    search?: string,
    page: number = 1,
    limit: number = 100,
    day?: WeekDays,
  ) {
    let where: any = { isDeleted: false };

    // 3. Dinamik filtrlar
    if (teacherId) where.teacherId = teacherId;
    if (active !== undefined) where.isActive = active;
    if (day) where.weekDays = day;

    // 4. Search mantiqi (ID yoki lessonName bo'yicha)
    if (search) {
      const isNumber = !isNaN(Number(search)) && /^\d+$/.test(search);
      if (isNumber) {
        where.id = Number(search);
      } else {
        where.lessonName = ILike(`%${search}%`);
      }
    }

    const skip = (page - 1) * limit;

    // 6. Ma'lumotlarni bazadan olish
    const [data, total] = await this.scheduleRepo.findAndCount({
      where,
      relations: {
        teacher: true,
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    // 7. Statistika (Stats) hisoblash
    const activeCount = await this.scheduleRepo.count({
      where: { ...where, isActive: true },
    });

    const inactiveCount = await this.scheduleRepo.count({
      where: { ...where, isActive: false },
    });

    // 8. Natijani qaytarish
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
      },
    };
  }

  // ------------------------- FIND ONE SCHEDULE -------------------------

  async findOneSchedule(id: number) {
    const schedule = await this.scheduleRepo.findOne({
      where: { id },
      relations: { teacher: true }
    });
    if (!schedule) throw new BadRequestException('Schedule not found');
    return schedule;
  }

  // ------------------------- UPDATE SCHEDULE -------------------------

  async updateSchedule(id: number, dto: UpdateScheduleDto) {
    const { startTime, finishTime } = dto;

    // 1. Jadval mavjudligini tekshirish
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    // 2. Yangi vaqtlarni aniqlash (agar dto'da kelmasa, eskisini qoldirish)
    const start = startTime ? new Date(startTime) : schedule.startTime;
    const end = finishTime ? new Date(finishTime) : schedule.endTime;
    const now = new Date();

    // 3. Agar vaqt o'zgargan bo'lsa, o'tmishni tekshirish
    if (startTime && start < now) {
      const formattedNow = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      throw new BadRequestException(`Dars vaqti xato: O'tmishga o'zgartira olmaysiz. Hozir: ${formattedNow}`);
    }

    // 4. Start va End mantiqsizligini tekshirish
    if (start >= end) {
      throw new BadRequestException("Dars tugash vaqti boshlanish vaqtidan keyin bo'lishi shart.");
    }

    // 5. Overlap (ustma-ust tushish) tekshiruvi
    // Faqat vaqt yoki teacher o'zgargandagina bazani tekshirish resursni tejaydi
    const finalTeacherId = schedule.teacherId;

    const overlappingSchedule = await this.scheduleRepo.findOne({
      where: {
        id: Not(id), // O'zini tekshiruvdan chiqarib tashlaymiz
        teacherId: finalTeacherId,
        startTime: LessThan(end),
        endTime: MoreThan(start),
        isDeleted: false,
      },
    });

    if (overlappingSchedule) {
      const oStart = overlappingSchedule.startTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const oEnd = overlappingSchedule.endTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      throw new BadRequestException(
        `O'zgartirib bo'lmaydi! Bu o'qituvchining soat ${oStart} - ${oEnd} oralig'ida boshqa darsi bor.`
      );
    }

    // 6. Haftaning qaysi kuni ekanligini qayta hisoblash (agar vaqt o'zgargan bo'lsa)
    const daysMap = [
      WeekDays.SUNDAY, WeekDays.MONDAY, WeekDays.TUESDAY,
      WeekDays.WEDNESDAY, WeekDays.THURSDAY, WeekDays.FRIDAY, WeekDays.SATURDAY
    ];
    const currentWeekDay = daysMap[start.getDay()];

    // 7. Ma'lumotlarni yangilash
    Object.assign(schedule, {
      startTime: start,
      endTime: end,
      weekDays: currentWeekDay,
    });

    return await this.scheduleRepo.save(schedule);
  }

  // ------------------------- UPDATE SCHEDULE -------------------------
  async deleteSchedule(scheduleId: number) {
    // 1. Darsni va unga biriktirilgan o'qituvchini topish
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: { teacher: true }
    });

    if (!schedule) {
      throw new NotFoundException(`Dars topilmadi (ID: ${scheduleId})`);
    }

    const teacher = schedule.teacher;

    // 2. Google Calendar'dan o'chirish
    if (schedule.googleEventId && teacher?.googleRefreshToken) {
      try {
        // Tokenni yangilash (Service ichidagi metod orqali)
        await this.authService.refreshGoogleToken(teacher.id);

        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({ refresh_token: teacher.googleRefreshToken });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Google tadbirini o'chirish
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: schedule.googleEventId,
        });

        console.log(`✅ Google tadbir o'chirildi: ${schedule.googleEventId}`);
      } catch (error) {
        // Agar dars kalendarda topilmasa ham bazadan o'chaverishi uchun catch qilamiz
        console.error("❌ Google Calendar xatosi:", error.response?.data || error.message);
      }
    }

    await this.scheduleRepo.remove(schedule);

    return {
      success: true,
      message: "Dars bazadan va Google Calendardan muvaffaqiyatli o'chirildi"
    };
  }
}
