import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';

@Controller('certificate')
@UseGuards(AuthGuard, RolesGuard)
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) { }
  // ---------------------- CREATE ----------------------
  @Post()

  @AccessRoles(Roles.TEACHER, Roles.SUPER_ADMIN, Roles.ADMIN)
  create(@Body() dto: CreateCertificateDto) {
    return this.certificateService.createCertificate(dto);
  }
  // ---------------------- GET ALL ----------------------

  @Get()
  
  @ApiOperation({ summary: 'Find all for super admin' })
  @AccessRoles(Roles.TEACHER, Roles.SUPER_ADMIN, Roles.ADMIN)
  
  findAll() {
    return this.certificateService.findAllCertificate();
  }
  // ---------------------- GET ONE BY TEACHER ----------------------

  @Get('for-teacher')

  @ApiOperation({ summary: 'Find one for teacher' })
  @AccessRoles(Roles.TEACHER, 'ID')
  findOneByTeacher(@CurrentUser('user') user: IToken) {
    return this.certificateService.findOneCertificate(user.id);
  }
  // ---------------------- GET ONE ----------------------
  
  @Get(':id')

  @ApiOperation({ summary: 'Find one for super admin' })
  @AccessRoles(Roles.TEACHER, Roles.SUPER_ADMIN, Roles.ADMIN)

  findOne(@Param('id') id: string) {
    return this.certificateService.findOneCertificate(+id);
  }


  // ---------------------- UPDATE ----------------------

  @Patch(':id')

  @ApiOperation({ summary: 'update for super admin' })
  @AccessRoles(Roles.TEACHER, Roles.SUPER_ADMIN, Roles.ADMIN, 'ID')

  update(@Param('id') id: string, @Body() dto: UpdateCertificateDto) {
    return this.certificateService.updateCertificate(+id, dto);
  }
  // ---------------------- SOFT DELETE ----------------------

  @Delete('soft/:id')

  @ApiOperation({ summary: 'soft delete for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  softDelete(@Param('id') id: string) {
    return this.certificateService.softDelete(+id);
  }

  // ---------------------- DELETE ----------------------

  @Delete(':id')

  @ApiOperation({ summary: ' delete for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN)

  remove(@Param('id') id: string) {
    return this.certificateService.softDelete(+id);
  }
}
