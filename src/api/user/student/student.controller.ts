import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseBoolPipe, ParseIntPipe } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { ApiPagination } from './swagger/api-query';
import { Roles } from 'src/common/enum/roles.enum';
import { StudentSort } from './enum/student-sort';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';
import { ConfirmPhoneDto } from './dto/confirm-phone';

@Controller('student')
@UseGuards(AuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) { }
  // --------------------- CREATE STUDENT ---------------------
  @Post('crate-student')

  @ApiOperation({ summary: 'create student' })
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)

  create(@Body() dto: CreateStudentDto) {
    return this.studentService.createStudent(dto);
  }

  // --------------------- CONFIRM STUDENT ---------------------
  @Post('confirm')

  @ApiOperation({ summary: 'confirm Phone student' })
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)

  confirm(@Body() dto: ConfirmPhoneDto) {
    return this.studentService.confirmPhone(dto);
  }

  // --------------------- GET ALL ---------------------

  @Get()
  @ApiPagination()
  @ApiOperation({ summary: 'for super admin and admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status', new ParseBoolPipe({ optional: true })) status?: boolean,
    @Query('isDeleted', new ParseBoolPipe({ optional: true })) isDeleted?: boolean,
    @Query('sort') sort?: StudentSort,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber

    return this.studentService.findAllStudent(pageNumber, limitNumber, search, status, sort, isDeleted);
  }

  // --------------------- GET ONE ---------------------

  @Get(':id')
  @ApiOperation({ summary: 'for super admin and admin' })
  // @AccessRoles(Roles.SUPER_ADMIN, Roles.STUDENT, 'ID', Roles.ADMIN, Roles.TEACHER)
  @AccessRoles('public')

  findOne(
    @Param('id') id: string) {
    return this.studentService.findOneStudent(+id);
  }

  // --------------------- GET ONE ---------------------

  @Get('telegram/:tgId')
  @ApiOperation({ summary: 'Telegram Id' })
  // @AccessRoles(Roles.SUPER_ADMIN, Roles.STUDENT, 'ID', Roles.ADMIN, Roles.TEACHER)
  @AccessRoles('public')

  findOneTelegramId(
    @Param('tgId') tgId: string) {
    return this.studentService.findOneTelegramId(tgId);
  }

  // --------------------- STUDENT DETAILS ONE ---------------------

  @Get('details')

  @ApiOperation({ summary: 'for student only' })
  @AccessRoles(Roles.STUDENT, 'ID')

  getDetails(
    @CurrentUser() user: IToken) {
    return this.studentService.findOneStudent(user.id);
  }

  // --------------------- UPDATE ---------------------

  @Patch('update/:id')

  @ApiOperation({ summary: 'update student by student,admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.STUDENT)

  update(
    @CurrentUser() user: IToken,
    @Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.updateStudent(+id, dto, user);
  }
  // --------------------- IS ACTIVE ---------------------

  @Patch('is-active/:id')

  @ApiOperation({ summary: 'blocked student by admin and super admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  isActive(
    @Param('id') id: number,
    @Query('active', new ParseBoolPipe({ optional: true })) active: boolean,
  ) {
    return this.studentService.blockedStudent(id, active);
  }

  // -------------------- ADD BALANCE --------------------

  @Patch('add-balance/:id')

  @ApiOperation({ summary: 'add balance for student by super admin' })
  @AccessRoles(Roles.SUPER_ADMIN)
  addBalance(
    @Param('id') id: number,
    @Query('balance', ParseIntPipe) balance: number
  ) {
    return this.studentService.addBalance(id, balance);
  }

  // --------------------- SOFT DELETE ---------------------

  @Delete('soft-delete/:id')

  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @ApiOperation({ summary: 'soft delete student by admin and super admin' })

  softDelete(
    @Param('id', ParseIntPipe) id: number,
    @Query('status', ParseBoolPipe) status?: boolean
  ) {
    return this.studentService.softDelete(+id, status);
  }

  // --------------------- DELETE ---------------------

  @Delete('delete/:id')

  @AccessRoles(Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'delete student by and super admin' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.delete(+id);
  }
}
