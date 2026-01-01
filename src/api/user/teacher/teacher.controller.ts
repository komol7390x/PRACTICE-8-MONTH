import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SigninTeacherDto } from './dto/signin-teacher.dto';
import { type Response } from 'express';
import { ApiPagination } from './swagger/teacher-swagger';
import { Roles } from 'src/common/enum/roles.enum';
import { LanguageLevel, TeacherSort } from './enum/teacher-enum';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';
import { RegisterStep2Dto } from './dto/register-step2';

@Controller('teacher')
@UseGuards(AuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) { }

  // --------------------- CREATE TEACHER ---------------------
  @Post('create')

  @ApiOperation({ summary: 'Create teacher for Admin' })
  @AccessRoles('public')

  createTeacher(@Body() dto: CreateTeacherDto) {
    return this.teacherService.createTeacher(dto);
  }

  // --------------------- REGISTER STEP-2 TEACHER ---------------------
  @Post('register-step2/:id')
  @AccessRoles(Roles.TEACHER, 'ID')

  @ApiOperation({ summary: 'registration teacher step ' })

  registrationStep2(@Body() dto: RegisterStep2Dto, @Param('id', ParseIntPipe) id: number) {
    return this.teacherService.registrationStep2(id, dto);
  }

  // --------------------- REGISTER STEP-3 TEACHER ---------------------

  @Post('register-step3/:id')
  @AccessRoles(Roles.TEACHER, 'ID')

  @ApiOperation({ summary: 'registration teacher step ' })
  @ApiQuery({ name: 'otp', type: Number, example: 123456 })

  registrationStep3(
    @Query('otp', ParseIntPipe) otp: number,
    @Param('id', ParseIntPipe) id: number) {
    return this.teacherService.registrationStep3(id, otp);
  }

  // --------------------- SIGN IN TEACHER ---------------------
  @Post('signin')
  @AccessRoles('public')

  @ApiOperation({ summary: 'Sign in Teacher' })

  signIn(@Body() dto: SigninTeacherDto, @Res({ passthrough: true }) res: Response) {
    return this.teacherService.signIn(dto, res);
  }

  // --------------------- SIGN OUT TEACHER ---------------------
  @Post('singOut')
  @AccessRoles(Roles.TEACHER)

  @ApiOperation({ summary: 'Sign Out' })

  signout(@Res({ passthrough: true }) res: Response) {
    return this.teacherService.singOut(res);
  }

  // --------------------- GET ALL TEACHER ---------------------

  @Get('all')

  @ApiPagination()
  @ApiOperation({ summary: 'get all teacher' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status', new ParseBoolPipe({ optional: true })) status?: boolean,
    @Query('level') level?: LanguageLevel,
    @Query('sort') sort?: TeacherSort,
    @Query('lang') lang?: string,
  ) {

    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber;

    return this.teacherService.findAllTeacher(
      pageNumber,
      limitNumber,
      search,
      status,
      level,
      sort,
      lang
    );
  }
  // --------------------- GET ME ---------------------

  @Get('details')

  @ApiOperation({ summary: 'for Teacher details' })
  @AccessRoles(Roles.TEACHER)

  getDetails(@CurrentUser() user: IToken) {
    return this.teacherService.findOneTeacher(user.id)
  }
  // --------------------- FIND ONE ---------------------

  @Get(':id')

  @ApiOperation({ summary: 'get one teacher' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN, 'ID')

  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findOneTeacher(+id);
  }
  // --------------------- IS ACTIVE ---------------------

  @Patch('is-active/:id')

  @ApiOperation({ summary: 'blocked teacher by admin and super admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  isActive(
    @Param('id', ParseIntPipe) id: number,
    @Query('active') active: boolean,
  ) {
    return this.teacherService.blockedTeacher(id, active);
  }

  // --------------------- UPDATE ---------------------

  @Patch(':id')

  @ApiOperation({ summary: 'get one teacher' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN, 'ID')

  update(@Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherDto,
    @CurrentUser() user: IToken) {
    return this.teacherService.updateTeacher(+id, dto, user);
  }
  // --------------------- SOFT DELETE ---------------------

  @Delete('soft-delete/:id')

  @ApiOperation({ summary: 'soft delete teacher' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.softDelete(+id);
  }
  // --------------------- HARD DELETE ---------------------

  @Delete('delete/:id')

  @ApiOperation({ summary: 'delete teacher' })
  @AccessRoles(Roles.SUPER_ADMIN)

  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.delete(+id);
  }



}
