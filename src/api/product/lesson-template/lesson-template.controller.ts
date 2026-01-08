import { Controller, Post, Body, UseGuards, Param, ParseIntPipe, Get, Query, ParseBoolPipe, Patch, Req, Delete } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';
import { BookedLesson } from './enum/booked-type';
import { WeekDays } from './enum/week-day';
import { ApiLessonFilters, ApiLessonFiltersStudent, ApiLessonFiltersTeacher } from 'src/common/decorator/get-lesson-book';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';

@Controller('lesson-template')
@UseGuards(AuthGuard, RolesGuard)
export class LessonTemplateController {
  constructor(private readonly lessonTemplateService: LessonTemplateService) { }

  // --------------------- BOOKED LESSON BY STUDENT ---------------------

  @Post('booked-by-student/:id')

  @ApiOperation({ summary: 'book lesson by student' })
  @AccessRoles(Roles.STUDENT, Roles.ADMIN, Roles.SUPER_ADMIN)
  // @AccessRoles('public')

  async bookLessonByStudent(
    @Param('id', ParseIntPipe) id: number,
    @Query('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: CreateLessonTemplateDto
  ) {    
    return this.lessonTemplateService.bookScheduleByStudent(id, lessonId, dto)
  }

  // --------------------- GET ALL BOOK LESSON ---------------------

  @Get()

  @ApiOperation({ summary: 'get all book lesson for admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @ApiLessonFilters()

  getAllBookLesson(
    @Query('status') status?: BookedLesson,
    @Query('weekday') weekday?: WeekDays,
    @Query('teacherId') teacherId?: number,
    @Query('studentId') studentId?: number,
    @Query('isPaid', new ParseBoolPipe({ optional: true })) isPaid?: boolean,
    @Query('active', new ParseBoolPipe({ optional: true })) active?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber

    return this.lessonTemplateService.findAllBookLesson({
      page: pageNumber,
      limit: limitNumber,
      status,
      weekday,
      teacherId,
      studentId,
      isPaid,
      search,
      active,
    });
  }

  // ------------------ GET ONE LESSON FOR TEACHER ------------------

  @Get('teacher')

  @ApiOperation({ summary: 'Get lesson for teacher' })
  @AccessRoles(Roles.TEACHER, 'ID')
  @ApiLessonFiltersTeacher()


  async teacherLesson(
    @CurrentUser('user') user: IToken,
    @Query('status') status?: BookedLesson,
    @Query('weekday') weekday?: WeekDays,
    @Query('isPaid', new ParseBoolPipe({ optional: true })) isPaid?: boolean,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber

    return this.lessonTemplateService.findAllBookLesson({
      status,
      weekday,
      isPaid,
      search,
      page: pageNumber,
      limit: limitNumber,
      teacherId: user.id
    })
  }

  // ------------------ GET ONE LESSON FOR STUDENT ------------------

  @Get('student')

  @ApiOperation({ summary: 'Get lesson for student' })
  @AccessRoles(Roles.STUDENT, 'ID')
  @ApiLessonFiltersStudent()

  async studentLesson(
    @CurrentUser('user') user: IToken,
    @Query('status') status?: BookedLesson,
    @Query('weekday') weekday?: WeekDays,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber

    return this.lessonTemplateService.findAllBookLesson({
      status,
      weekday,
      search,
      page: pageNumber,
      limit: limitNumber,
      studentId: user.id
    })
  }

  // ------------------ UPDATE LESSON ------------------
  @Patch(':id')
  @ApiOperation({ summary: "Dars ma'lumotlarini yangilash" })
  @AccessRoles(Roles.TEACHER, 'ID', Roles.SUPER_ADMIN)

  async update(
    @Param('id') id: number,
    @CurrentUser('user') user: IToken,
    @Body() dto: UpdateLessonTemplateDto
  ) {
    return this.lessonTemplateService.updateBookedLessonByStudent(id, user.id, dto);
  }

  // --------------------- SOFT DELETE ---------------------

  @Delete('soft-delete/:id')

  @ApiOperation({ summary: 'for super admin and admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.lessonTemplateService.softDelete(id);
  }
  // ---------------------  DELETE ---------------------

  @Delete('delete/:id')

  @ApiOperation({ summary: 'for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN)

  delete(@Param('id', ParseIntPipe) id: number) {
    return this.lessonTemplateService.delete(id);
  }
}