import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LessonTemplateService } from './lesson-template.service';
import { CreateLessonTemplateDto } from './dto/create-lesson-template.dto';
import { UpdateLessonTemplateDto } from './dto/update-lesson-template.dto';

@Controller('lesson-template')
export class LessonTemplateController {
  constructor(private readonly lessonTemplateService: LessonTemplateService) {}

  @Post()
  create(@Body() dto: CreateLessonTemplateDto) {
    return this.lessonTemplateService.createLessonTemplate(dto);
  }

  @Get()
  findAll() {
    return this.lessonTemplateService.findAllLessonTemplate();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonTemplateService.findOneLessonTemplate(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLessonTemplateDto) {
    return this.lessonTemplateService.updateLessonTemplate(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonTemplateService.removeLessonTemplate(+id);
  }
}
