import { Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { ScheduleEntity } from './entities/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleService extends BaseService<CreateScheduleDto, UpdateScheduleDto, ScheduleEntity> {
  constructor(
    @InjectRepository(ScheduleEntity) private readonly scheduleRepo: Repository<ScheduleEntity>
  ) { super(scheduleRepo) }
  // ------------------------- CREATE SCHEDULE -------------------------
  createSchedule(id: number, dto: CreateScheduleDto) {
    const { finishTime, lessonName, lessonPrice, startTime } = dto
    
  }
  // ------------------------- FIND ALL SCHEDULE -------------------------

  findAllSchedule() {
    return `This action returns all schedule`;
  }
  // ------------------------- FIND ONE SCHEDULE -------------------------

  findOneSchedule(id: number) {
    return `This action returns a #${id} schedule`;
  }
  // ------------------------- UPDATE SCHEDULE -------------------------

  updateSchedule(id: number, dto: UpdateScheduleDto) {
    return `This action updates a #${id} schedule`;
  }
  // ------------------------- DELETE SCHEDULE -------------------------

  removeSchedule(id: number) {
    return `This action removes a #${id} schedule`;
  }
}
