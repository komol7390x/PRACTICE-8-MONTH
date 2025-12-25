import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('lesson-template')
@UseGuards(AuthGuard, RolesGuard)
export class LessonTemplateController {
  constructor(private readonly lessonTemplateService: LessonTemplateService) { }
  // ------------------------CREATE LESSON TABLE ------------------------
  @Post()

  @ApiOperation({ summary: 'registration student' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.TEACHER, 'ID')

  @ApiParam({ type: Number, name: 'teacherId', example: '25' })
  create(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Body() dto: CreateLessonTemplateDto) {
    // return this.lessonTemplateService.createLessonTemplate(teacherId, dto);
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
