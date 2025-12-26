import { Controller, Post, Body, UseGuards, Param, ParseIntPipe, Get } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';
import { BookLessonByStudentDto } from './dto/book-lesson-by-student.dto';

@Controller('lesson-template')
@UseGuards(AuthGuard, RolesGuard)
export class LessonTemplateController {
  constructor(private readonly lessonTemplateService: LessonTemplateService) { }
  // ------------------------CREATE LESSON TABLE ------------------------
  @Post('create-lesson')

  @ApiOperation({ summary: 'registration leeson for teacher' })
  @AccessRoles(Roles.TEACHER, 'ID')

  create(
    @CurrentUser('user') user: IToken,
    @Body() dto: CreateLessonTemplateDto) {
    return this.lessonTemplateService.createLessonByTeacher(user?.id, dto);
  }
  // --------------------- BOOKED LESSON BY STUDENT ---------------------
  @Post('booked-by-student/:id')

  @ApiOperation({ summary: 'book lesson by student' })
  // @AccessRoles(Roles.STUDENT)
  async bookLessonByStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BookLessonByStudentDto
  ) {
    return this.lessonTemplateService.bookLessonByStudent(id, dto)
  }
  // --------------------- GET ALL BOOK LESSON ---------------------

  @Get()
  @ApiOperation({ summary: 'get all book lesson for admin' })

  getAllBookLesson() {
    return this.lessonTemplateService.getAllBookLesson()
  }
}
