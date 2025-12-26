import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';

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
    return this.lessonTemplateService.createLessonByTeacher(user.id, dto);
  }
  // ------------------------CREATE LESSON TABLE ------------------------

  // @Get()
  // findAll() {
  //   return this.lessonTemplateService.findAllLessonTemplate();
  // }
  // // ------------------------CREATE LESSON TABLE ------------------------

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.lessonTemplateService.findOneLessonTemplate(+id);
  // }
  // // ------------------------CREATE LESSON TABLE ------------------------

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() dto: UpdateLessonTemplateDto) {
  //   return this.lessonTemplateService.updateLessonTemplate(+id, dto);
  // }
  // // ------------------------CREATE LESSON TABLE ------------------------

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.lessonTemplateService.removeLessonTemplate(+id);
  // }
}
