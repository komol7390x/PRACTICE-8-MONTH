import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Query, ParseBoolPipe, ParseEnumPipe, ParseIntPipe } from '@nestjs/common';
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
import { WeekDays } from '../lesson-template/enum/week-day';
import { ApiScheduleQueries } from 'src/common/decorator/schedule.decorator';

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

  // @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @AccessRoles('public')
  @ApiOperation({ summary: 'find all schedule' })
  @ApiScheduleQueries()

  findAll(
    @Query('teacherId') teacherId?: number,
    @Query('active', new ParseBoolPipe({ optional: true })) active?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('day', new ParseEnumPipe(WeekDays, { optional: true })) day?: WeekDays,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber
    return this.scheduleService.findAllSchedule(teacherId, active, search, pageNumber, limitNumber, day);
  }
  // ------------------------- FIND ONE TEACHER SCHEDULE -------------------------

  @Get('teacher')

  @AccessRoles(Roles.TEACHER)
  @ApiOperation({ summary: 'find one schedule' })
  @ApiScheduleQueries()

  findOneTeacherSchedule(@CurrentUser('user') user: IToken,
    @Query('active', new ParseBoolPipe({ optional: true })) active?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('day', new ParseEnumPipe(WeekDays, { optional: true })) day?: WeekDays,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber
    return this.scheduleService.findAllSchedule(user.id, active, search, pageNumber, limitNumber, day);
  }
  // ------------------------- FIND ONE SCHEDULE -------------------------

  @Get(':id')

  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'find one schedule' })

  findOne(@Param('id') id: string) {
    return this.scheduleService.findOneSchedule(+id);
  }

  // ------------------------- UPDATE SCHEDULE -------------------------

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.scheduleService.updateSchedule(+id, dto);
  }
  // --------------------- IS ACTIVE ---------------------

  @Patch('is-active/:id')

  @ApiOperation({ summary: 'is active admin and teacher' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.TEACHER, 'ID')

  isActive(
    @Param('id', ParseIntPipe) id: number,
    @Query('active', new ParseBoolPipe) active: boolean,
  ) {
    return this.scheduleService.updateStatus(id, active);
  }

  // ------------------------- SOFT DELETE SCHEDULE -------------------------

  @Delete('soft-delete/:id')


  @ApiOperation({ summary: 'for super admin and admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.TEACHER)

  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.softDelete(id);
  }

  // ---------------------  DELETE ---------------------

  @Delete('delete/:id')

  @ApiOperation({ summary: 'for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN)

  delete(@Param('id', ParseIntPipe) id: number) {
    return this.scheduleService.delete(id);
  }

}
