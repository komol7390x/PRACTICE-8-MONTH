import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { ApiOperation } from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { ApiPagination } from './swagger/api-query';
import { StudentStatus } from './enum/student-status';
import { Roles } from 'src/common/enum/roles.enum';
import { StudentSort } from './enum/student-sort';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';

@Controller('student')
@UseGuards(AuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) { }
  // --------------------- CREATE STUDENT ---------------------
  @Post('crate-student')

  @ApiOperation({ summary: 'public' })
  @AccessRoles('public')

  create(@Body() dto: CreateStudentDto) {
    return this.studentService.createStudent(dto);
  }
  // --------------------- GET ALL ---------------------
  @Get()
  @ApiPagination()
  @ApiOperation({ summary: 'for super admin and admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.STUDENT)

  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: StudentStatus,
    @Query('sort') sort?: StudentSort,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber

    return this.studentService.findAllStudent(pageNumber, limitNumber, search, status, sort);
  }
  // --------------------- GET ONE ---------------------

  @Get(':id')
  @ApiOperation({ summary: 'for super admin and admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.STUDENT)

  findOne(
    @CurrentUser() user: IToken,
    @Param('id') id: string) {
    return this.studentService.findOneStudent(+id, user);
  }
  // --------------------- STUDENT DETAILS ONE ---------------------

  @Get('details/:id')

  @ApiOperation({ summary: 'for student' })
  @AccessRoles(Roles.STUDENT, 'ID')

  getDetails(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: IToken) {
    return this.studentService.findOneStudent(id, user);
  }
  // --------------------- UPDATE ---------------------

  @Patch('update/:id')

  @ApiOperation({ summary: 'for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.STUDENT)

  update(
    @CurrentUser() user: IToken,
    @Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.updateStudent(+id, dto, user);
  }
  // --------------------- IS ACTIVE ---------------------

  @Patch('is-active/:id')

  @ApiOperation({ summary: 'for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  isActive(
    @Param('id') id: number,
    @Query('active') active: boolean,
    @Body() dto: UpdateStudentDto
  ) {
    return this.studentService.blockedStudent(id, active, dto);
  }
  // --------------------- SOFT DELETE ---------------------

  @Patch('soft-delete/:id')
  softDelete(@Param('id') id: string) {
    return this.studentService.softDelete(+id);
  }

  // --------------------- SOFT DELETE ---------------------

  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.studentService.delete(+id);
  }
}
