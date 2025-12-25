import { Controller, Get, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/AuthGuard';

@Controller('course')
@UseGuards(AuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) { }

  @Get()

  @AccessRoles(Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'for super admin' })

  findAll() {
    return this.courseService.findAllCourse();
  }
}
