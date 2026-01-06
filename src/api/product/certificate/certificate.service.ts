import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { CertificateEntity } from './entities/certificate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TeacherService } from 'src/api/user/teacher/teacher.service';
import { successRes } from 'src/infrastructure/response/success.response';
import { LanguageLevel } from './enum/lang-level';

@Injectable()
export class CertificateService extends BaseService<CreateCertificateDto, UpdateCertificateDto, CertificateEntity> {
  constructor(@InjectRepository(CertificateEntity)
  private readonly certificatyRepo: Repository<CertificateEntity>,
    private readonly teacherService: TeacherService
  ) { super(certificatyRepo) }
  // ------------------- CREATE CERTIFICATE -------------------
  async createCertificate(dto: CreateCertificateDto, user: IToken) {
    const { teacherId, hourPrice, level, specificationName, description } = dto
    await this.teacherService.findOneTeacher(teacherId)
    const data = await this.certificatyRepo.save(
      this.certificatyRepo.create({
        hourPrice,
        description,
        level,
        teacherId,
        specificationName,
        isActive: user.role !== Roles.TEACHER ? true : false
      })
    )
    return successRes({ ...data })
  }
  // ------------------- FIND ALL CERTIFICATE -------------------

  async findAllCertificate(
    active?: boolean,
    level?: LanguageLevel,
    search?: string,
    page: number = 1,
    limit: number = 100
  ) {
    const skip = (page - 1) * limit;

    const baseCondition: any = { isDeleted: false };
    if (active !== undefined) baseCondition.isActive = active;
    if (level) baseCondition.level = level;

    let where: any;

    if (search) {
      const isNumber = !isNaN(Number(search));
      const searchNum = isNumber ? Number(search) : null;

      if (isNumber) {
        where = { ...baseCondition, teacherId: searchNum };
      } else {
        where = [
          { ...baseCondition, specificationName: ILike(`%${search}%`) },
          { ...baseCondition, description: ILike(`%${search}%`) }
        ];
      }
    } else {
      where = baseCondition;
    }

    const [data, total] = await this.certificatyRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });
    const activeCount = await this.certificatyRepo.count({
      where: { ...baseCondition, isActive: true }
    });

    const inactiveCount = await this.certificatyRepo.count({
      where: { ...baseCondition, isActive: false }
    });

    const deletedCount = await this.certificatyRepo.count({
      where: { isDeleted: true }
    });

    return {
      data,
      meta: {
        totalItems: total,
        itemCount: data.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      stats: {
        active: activeCount,
        inactive: inactiveCount,
        deleted: deletedCount,
      }
    };
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
