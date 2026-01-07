import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { ScheduleEntity } from './entities/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
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
    console.log(newSchedule);


    return await this.scheduleRepo.save(newSchedule);

  }
  // ------------------------- FIND ALL SCHEDULE -------------------------

  async findAllSchedule() {
    return `This action returns all schedule`;
  }
  // ------------------------- FIND ONE SCHEDULE -------------------------

  async findOneSchedule(id: number) {
    return `This action returns a #${id} schedule`;
  }
  // ------------------------- UPDATE SCHEDULE -------------------------

  async updateSchedule(id: number, dto: UpdateScheduleDto) {
    return `This action updates a #${id} schedule`;
  }
  // ------------------------- DELETE SCHEDULE -------------------------

  async removeSchedule(id: number) {
    return `This action removes a #${id} schedule`;
  }
}
