import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { TeacherEntity } from './entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LanguageLevel, TeacherSort, TeacherStatus } from './enum/teacher-enum';
import { SigninTeacherDto } from './dto/signin-teacher.dto';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { IToken } from 'src/infrastructure/token/interface';
import { TokenService } from 'src/infrastructure/token/Token';
import { type Response } from 'express';
import { TokenName } from 'src/common/enum/token-name';
import { successRes } from 'src/infrastructure/response/success.response';
import { Roles } from 'src/common/enum/roles.enum';
@Injectable()
export class TeacherService extends BaseService<CreateTeacherDto, UpdateTeacherDto, TeacherEntity> {
  constructor(@InjectRepository(TeacherEntity) private readonly teacherRepository: Repository<TeacherEntity>,
    private readonly crypto: CryptoService,
    private readonly tokenService: TokenService,
  ) {
    super(teacherRepository)
  }
  // ----------------------- REGISTRATION TEACHER -----------------------

  async createTeacher(dto: CreateTeacherDto) {
    const { email, phoneNumber, password } = dto
    const existEmail = await this.teacherRepository.findOne({ where: { email } })
    if (existEmail) {
      throw new ConflictException(`${email} already exist on Teacher`)
    }
    const existPhoneNumber = await this.teacherRepository.findOne({ where: { phoneNumber } })
    if (existPhoneNumber) {
      throw new ConflictException(`${phoneNumber} already exist on Teacher`)
    }
    const hashedPassword = await this.crypto.encrypt(password)
    return super.create({ ...dto, password: hashedPassword });
  }
  // ----------------------- SIGN IN -----------------------

  async signIn(dto: SigninTeacherDto, res: Response) {

    const { email, password } = dto;
    const teacher = await this.teacherRepository.findOne({ where: { email } });
    console.log(teacher);

    const checkPassword = await this.crypto.decrypt(
      password, teacher?.password || ''
    );

    if (!teacher || !checkPassword)
      throw new HttpException('Email or password is incorrect', 400);

    const payload: IToken = {
      id: teacher.id,
      isActive: teacher.isActive,
      role: teacher.role,
    };
    const accessToken = await this.tokenService.accessToken(payload);

    res.clearCookie(TokenName.TEACHER_TOKEN)
    res.clearCookie(TokenName.ADMIN_TOKEN)
    res.clearCookie(TokenName.STUDENT_TOKEN)

    await this.tokenService.writeCookie(res, TokenName.TEACHER_TOKEN, accessToken, 30);

    return successRes({
      token: accessToken,
      user: {
        id: teacher.id,
        username: teacher.email,
        fullname: teacher.fullname,
        role: teacher.role,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt,
      },
    });
  }
  // ----------------------- FIND ALL -----------------------

  async findAllTeacher(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: TeacherStatus,
    level?: LanguageLevel,
    sort: TeacherSort = TeacherSort.CREATED_AT,
    lang?: string,
  ) {
    const skip = (page - 1) * limit;

    const baseQb = this.teacherRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.certificates', 'c')
      .leftJoinAndSelect('t.googles', 'g')
      .where('t.isDeleted = :isDeleted', { isDeleted: false });

    baseQb.select(['t', 'c', 'g']);

    if (status) {
      baseQb.andWhere('t.isActive = :isActive', {
        isActive: status === TeacherStatus.ACTIVE,
      });
    }

    if (level) {
      baseQb.andWhere('c.level = :level', { level });
    }

    if (search) {
      baseQb.andWhere(
        new Brackets((qb) => {
          if (!isNaN(Number(search))) {
            qb.orWhere('t.id = :id', { id: Number(search) });
          }
          qb.orWhere('t.email ILIKE :search', { search: `%${search}%` })
            .orWhere('t.phoneNumber ILIKE :search', { search: `%${search}%` })
            .orWhere('t.fullname ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (lang) {
      baseQb.andWhere('c.specificationName ILIKE :lang', { lang: `%${lang}%` });
    }

    const orderByField =
      sort === TeacherSort.FULLNAME ? 't.fullname'
        : sort === TeacherSort.EMAIL ? 't.email'
          : sort === TeacherSort.RATING ? 't.rating'
            : 't.createdAt';

    const [teachers, total] = await baseQb
      .orderBy(orderByField, 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const activeCount = await this.teacherRepository.count({ where: { isActive: true, isDeleted: false } });
    const inactiveCount = await this.teacherRepository.count({ where: { isActive: false, isDeleted: false } });
    const deletedCount = await this.teacherRepository.count({ where: { isDeleted: true } });

    return {
      data: teachers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        active: activeCount,
        inactive: inactiveCount,
        deleted: deletedCount
      },
    };
  }

  // ----------------------- SIGN OUT -----------------------

  async singOut(res: Response) {
    res.clearCookie(TokenName.TEACHER_TOKEN)
    res.clearCookie(TokenName.ADMIN_TOKEN)
    res.clearCookie(TokenName.STUDENT_TOKEN)
  }

  // ----------------------- FIND ONE -----------------------

  async findOneTeacher(id: number) {
    const teacher = await this.teacherRepository.findOne({
      where: {
        id, isDeleted: false,
      },
      relations: { certificates: true, googles: true },
    })
    if (!teacher) {
      throw new NotFoundException(`${id} not found on Teacher`)
    }
    return successRes({
      ...teacher
    })
  }

  // ----------------------- UPDATE TEACHER -----------------------

  async updateTeacher(id: number, dto: UpdateTeacherDto, user: IToken) {
    const teacher = await this.teacherRepository.findOne({ where: { id } })
    if (!teacher) {
      throw new NotFoundException(`${id} not found on Teacher`)
    }
    const { cardNumber, email, expirence, fullname,
      imageUrl, password, phoneNumber, portfolioLink } = dto

    const newFullname = fullname ?? teacher.fullname;
    const newPortfolioLink = portfolioLink ?? teacher.portfolioLink;

    if (user.role == Roles.ADMIN || user.role == Roles.SUPER_ADMIN) {

      const newExpirence = expirence ?? teacher.expirence;
      const newImageUrl = imageUrl ?? teacher.imageUrl;

      if (user.role === Roles.SUPER_ADMIN) {

        const newCardNumber = cardNumber ?? teacher.cardNumber;
        const newEmail = email ?? teacher.email;
        let hashedPassword = teacher.password
        if (password) hashedPassword = await this.crypto.encrypt(password)
        const newPhoneNumber = phoneNumber ?? teacher.phoneNumber

        await this.teacherRepository.update({ id }, {
          fullname: newFullname,
          portfolioLink: newPortfolioLink,
          expirence: newExpirence,
          imageUrl: newImageUrl,
          cardNumber: newCardNumber,
          email: newEmail,
          phoneNumber: newPhoneNumber
        })
        return this.findOneTeacher(id)
      }
      await this.teacherRepository.update({ id }, {
        fullname: newFullname,
        portfolioLink: newPortfolioLink,
        expirence: newExpirence,
        imageUrl: newImageUrl,
      })

      return this.findOneTeacher(id)
    }
    await this.teacherRepository.update({ id }, {
      fullname: newFullname,
      portfolioLink: newPortfolioLink
    })
    return this.findOneTeacher(id)
  }

  // ----------------------- SIGN IN -----------------------
  async blockedStudent(id: number, blocked: boolean) {
    await this.findOneById(id)
    const blockedAt = new Date
    await this.teacherRepository.update({ id }, { isActive: blocked })
    return super.findOneById(id)

  }
}