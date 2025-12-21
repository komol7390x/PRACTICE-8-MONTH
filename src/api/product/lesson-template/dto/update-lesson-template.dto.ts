import { PartialType } from '@nestjs/swagger';
import { CreateLessonTemplateDto } from './create-lesson-template.dto';

export class UpdateLessonTemplateDto extends PartialType(CreateLessonTemplateDto) {}
