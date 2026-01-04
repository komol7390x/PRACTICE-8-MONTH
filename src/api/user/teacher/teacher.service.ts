import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { TeacherEntity } from './entities/teacher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LanguageLevel, TeacherSort } from './enum/teacher-enum';
import { SigninTeacherDto } from './dto/signin-teacher.dto';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { IToken } from 'src/infrastructure/token/interface';
import { TokenService } from 'src/infrastructure/token/Token';
import { type Response } from 'express';
import { TokenName } from 'src/common/enum/token-name';
import { successRes } from 'src/infrastructure/response/success.response';
import { Roles } from 'src/common/enum/roles.enum';
import { RegisterStep2Dto } from './dto/register-step2';
import { generateOTP } from 'src/infrastructure/otp-generator/otp-generator';
import { CustomCacheService } from 'src/infrastructure/cashe-service/nest-cashe-service';
import { AuthService } from '../auth/auth.service';
import { ConfirmmTelEmailDto } from './dto/confirmm-tel-email';

export interface ICheckOTP {
  id: number,
  phoneNumber: string,
  password: string,
  otp: number,
  sek: number
}


@Injectable()
export class TeacherService extends BaseService<CreateTeacherDto, UpdateTeacherDto, TeacherEntity> {
  constructor(@InjectRepository(TeacherEntity) private readonly teacherRepository: Repository<TeacherEntity>,
    private readonly crypto: CryptoService,
    private readonly tokenService: TokenService,
    private readonly casheService: CustomCacheService,
  ) {
    super(teacherRepository)
  }
  // ----------------------- CREATE TEACHER -----------------------

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
  // ----------------------- CONFIRM PHONE AND EMAIL -----------------------
  async confirmPhoneEmail(dto: ConfirmmTelEmailDto) {
    const { phoneNumber, email } = dto
    let otpData: any = {}
    if (email) {
      const existEmail = await this.teacherRepository.findOne({ where: { email } })
      if (existEmail) {
        throw new ConflictException(`${email} already exist on Teacher`)
      }
      otpData.emailOtp = generateOTP()
    }
    if (phoneNumber) {
      const existPhoneNumber = await this.teacherRepository.findOne({ where: { phoneNumber } })
      if (existPhoneNumber) {
        throw new ConflictException(`${phoneNumber} already exist on Teacher`)
      }
      otpData.phoneOtp = generateOTP()
    }

    return successRes({ ...otpData, sek: 300 })
  }
  // --------------------- REGISTER STEP-2 TEACHER ---------------------

  async registrationStep2(id: number, dto: RegisterStep2Dto) {
    const { phoneNumber, password } = dto
    const existTeacher = await this.teacherRepository.findOne({ where: { id } })
    if (!existTeacher) {
      throw new NotFoundException(`${id} not found on Teacher`)
    }
    const existPhoneNumber = await this.teacherRepository.findOne({ where: { phoneNumber } })
    if (existPhoneNumber) {
      throw new ConflictException(`${phoneNumber} already exist on Teacher`)
    }
    const hashedPassword = await this.crypto.encrypt(password)
    const otp = generateOTP()
    const payload = {
      phoneNumber,
      password: hashedPassword,
      otp,
      id,
      sek: 300
    }
    this.casheService.set(String(otp), payload, 300)
    return successRes({ otp, sek: 300, id })
  }
  // --------------------- REGISTER STEP-3 TEACHER ---------------------

  async registrationStep3(id: number, otp: number) {
    const checkOTP: ICheckOTP | null = this.casheService.get(String(otp))

    if (!checkOTP) {
      throw new NotFoundException(`OTP ${otp} has expired or is invalid`);
    }
    if (checkOTP.id != id) {
      throw new BadRequestException(`${id} is not your id`)
    }

    await this.teacherRepository.update({ id }, { password: checkOTP.password, phoneNumber: checkOTP.phoneNumber })
    return successRes({ id, phoneNumber: checkOTP.phoneNumber })
  }

  // ----------------------- SIGN IN -----------------------

  async signIn(dto: SigninTeacherDto, res: Response) {

    const { email, password } = dto;
    const teacher = await this.teacherRepository.findOne({ where: { email } });

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
    status?: boolean,
    level?: LanguageLevel,
    sort: TeacherSort = TeacherSort.CREATED_AT,
    lang?: string,
    isDeleted?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const baseQb = this.teacherRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.certificates', 'c')
      .leftJoinAndSelect('t.lessons', 'l')

    baseQb.select(['t', 'c', 'l']);

    if (typeof status == 'boolean') {
      baseQb.andWhere('t.isActive = :isActive', {
        isActive: status = Boolean(status)
      });
    }
    if(isDeleted !== undefined){
      baseQb.andWhere('t.isDeleted = :isDeleted', {
        isDeleted: isDeleted = Boolean(isDeleted)
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
        totalItems: total,
        itemCount: teachers.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      stats: {
        active: activeCount,
        inactive: inactiveCount,
        deleted: deletedCount,
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
      relations: { certificates: true, lessons: true },
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
    console.log(111);

    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException(`${id} not found on Teacher`);
    }

    // 2. Yangilanadigan ma'lumotlarni tayyorlash (Object destructuring)
    const updateData: Partial<TeacherEntity> = {
      fullname: dto.fullname ?? teacher.fullname,
      portfolioLink: dto.portfolioLink ?? teacher.portfolioLink,
    };

    // 3. Rollarga qarab ruxsatlarni tekshirish
    if (user.role === Roles.ADMIN || user.role === Roles.SUPER_ADMIN) {
      updateData.expirence = dto.expirence ?? teacher.expirence;

      if (user.role === Roles.SUPER_ADMIN) {
        updateData.cardNumber = dto.cardNumber ?? teacher.cardNumber;
        updateData.email = dto.email ?? teacher.email;
        updateData.phoneNumber = dto.phoneNumber ?? teacher.phoneNumber;

        if (dto.password) {
          updateData.password = await this.crypto.encrypt(dto.password);
        }
      }
    }
    await this.teacherRepository.update(id, updateData);
    return await this.findOneTeacher(id);
  }

  // ----------------------- SIGN IN -----------------------
  async blockedTeacher(id: number, blocked: boolean) {
    await this.findOneById(id)
    await this.teacherRepository.update({ id }, { isActive: blocked })
    return super.findOneById(id)
  }

}