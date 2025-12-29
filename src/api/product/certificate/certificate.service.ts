import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { CertificateEntity } from './entities/certificate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherService } from 'src/api/user/teacher/teacher.service';
import { successRes } from 'src/infrastructure/response/success.response';

@Injectable()
export class CertificateService extends BaseService<CreateCertificateDto, UpdateCertificateDto, CertificateEntity> {
  constructor(@InjectRepository(CertificateEntity)
  private readonly certificatyRepo: Repository<CertificateEntity>,
    private readonly teacherService: TeacherService
  ) { super(certificatyRepo) }
  // ------------------- CREATE CERTIFICATE -------------------
  async createCertificate(dto: CreateCertificateDto) {
    const { teacherId, hourPrice, level, specificationName, description } = dto
    await this.teacherService.findOneTeacher(teacherId)
    const data = await this.certificatyRepo.save(
      this.certificatyRepo.create({
        hourPrice,
        description,
        level,
        teacherId,
        specificationName,
      })
    )
    return successRes({ ...data })
  }
  // ------------------- FIND ALL CERTIFICATE -------------------

  async findAllCertificate() {
    return this.certificatyRepo.find()
  }
  // ------------------- FIND ONE CERTIFICATE -------------------

  async findOneCertificate(id: number) {
    const certiface = await this.certificatyRepo.findOne({ where: { id } })
    if (certiface) {
      throw new NotFoundException(`${id} not found `)
    }
    return certiface
  }
  // ------------------- UPDATE CERTIFICATE -------------------

  async updateCertificate(id: number, dto: UpdateCertificateDto) {
    const { teacherId } = dto
    if (teacherId) {
      await this.teacherService.findOneTeacher(teacherId)
    }
    return super.update(id, dto)
  }
}
