import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Query } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { SigninTeacherDto } from './dto/signin-teacher.dto';
import { type Response } from 'express';
import { ApiPagination } from './swagger/teacher-swagger';
import { Roles } from 'src/common/enum/roles.enum';
import { TeacherSort, TeacherStatus } from './enum/teacher-enum';

@Controller('teacher')
@UseGuards(AuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) { }

  // --------------------- CREATE TEACHER ---------------------
  @Post('create-teacher')

  @ApiOperation({ summary: 'registration teacher' })
  @AccessRoles('public')

  createTeacher(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }
  // --------------------- SIGN IN TEACHER ---------------------
  @Post('signin')

  @ApiOperation({ summary: 'public' })
  @AccessRoles('public')

  signIn(@Body() dto: SigninTeacherDto, @Res({ passthrough: true }) res: Response) {
    // return this.adminService.signIn(dto, res);
  }

  // --------------------- GET ALL TEACHER ---------------------

  @Get('all')

  @ApiPagination()
  @ApiOperation({ summary: 'get all teacher' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.STUDENT)

  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('level') level?: string,
    @Query('lang') lang?: string,
    @Query('status') status?: TeacherStatus,
    @Query('sort') sort?: TeacherSort,
  ) {

    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber
    return this.teacherService.findAllTeacher(pageNumber, limitNumber, search, status, sort, level, lang);
  }
  // --------------------- CREATE TEACHER ---------------------

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherService.findOneById(+id);
  }
  // --------------------- CREATE TEACHER ---------------------

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.update(+id, dto);
  }
  // --------------------- CREATE TEACHER ---------------------

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherService.delete(+id);
  }
}
