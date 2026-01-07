import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';

@Controller('schedule')
@UseGuards(AuthGuard, RolesGuard)

export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }
  // ------------------------- CREATE SCHEDULE -------------------------
  @Post()

  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.TEACHER)
  @ApiOperation({ summary: 'Create schedule' })

  create(
    @Body() dto: CreateScheduleDto,
    @CurrentUser('user') user: IToken
  ) {
    if (user.role == Roles.TEACHER) {
      return this.scheduleService.createSchedule(user.id, dto);
    } else {
      if (dto.teacherId) {
        return this.scheduleService.createSchedule(dto.teacherId, dto);
      } else {
        throw new BadRequestException(`teacher Id ${dto.teacherId} need`)
      }
    }
  }
  // ------------------------- FIND ALL SCHEDULE -------------------------

  @Get()
  findAll() {
    return this.scheduleService.findAllSchedule();
  }
  // ------------------------- FIND ONE SCHEDULE -------------------------

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scheduleService.findOneSchedule(+id);
  }
  // ------------------------- UPDATE SCHEDULE -------------------------

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScheduleDto: UpdateScheduleDto) {
    return this.scheduleService.updateSchedule(+id, updateScheduleDto);
  }
  // ------------------------- DELETE SCHEDULE -------------------------

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scheduleService.removeSchedule(+id);
  }
}
