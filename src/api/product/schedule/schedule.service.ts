import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { ScheduleEntity } from './entities/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { TeacherEntity } from 'src/api/user/teacher/entities/teacher.entity';
import { WeekDays } from '../lesson-template/enum/week-day';

@Injectable()
export class ScheduleService extends BaseService<CreateScheduleDto, UpdateScheduleDto, ScheduleEntity> {
  constructor(
    @InjectRepository(ScheduleEntity) private readonly scheduleRepo: Repository<ScheduleEntity>,
    @InjectRepository(TeacherEntity) private readonly teacherRepo: Repository<TeacherEntity>,
  ) { super(scheduleRepo) }
  // ------------------------- CREATE SCHEDULE -------------------------
  async createSchedule(teacherId: number, dto: CreateScheduleDto) {
    const { finishTime, lessonName, lessonPrice, startTime } = dto

    const start = new Date(startTime);
    const end = new Date(finishTime);
    const now = new Date();

    if (start < now) {
      const formattedNow = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      throw new BadRequestException(
        `Dars vaqti xato: Siz o'tmishga dars belgilay olmaysiz. Hozirgi vaqt: ${formattedNow}`
      );
    }

    // 2. Start va End mantiqsizligini tekshirish
    if (start >= end) {
      const duration = start.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      throw new BadRequestException(
        `Vaqt oralig'i noto'g'ri: Dars tugash vaqti boshlanish vaqtidan (${duration}) keyinroq bo'lishi shart.`
      );
    }

    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } })
    if (!teacher) {
      throw new NotFoundException(`${teacherId} not found on Teacher`)
    }
    const overlappingSchedule = await this.scheduleRepo.findOne({
      where: {
        teacherId: teacherId,
        startTime: LessThan(end),
        endTime: MoreThan(start),
      },
    });

    if (overlappingSchedule) {
      const start = overlappingSchedule.startTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const end = overlappingSchedule.endTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
      const day = overlappingSchedule.weekDays;

      throw new BadRequestException(
        `Kechirasiz, ${day} kuni soat ${start} dan ${end} gacha band. Iltimos, boshqa vaqt tanlang.`
      );
    }

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
    const newSchedule = this.scheduleRepo.create({
      startTime: start,
      endTime: end,
      price: lessonPrice,
      lessonName,
      weekDays: currentWeekDay,
      teacherId
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
    const finalTeacherId =  schedule.teacherId;

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
}
