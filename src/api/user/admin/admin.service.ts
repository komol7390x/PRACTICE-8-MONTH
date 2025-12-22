import { HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { BaseService } from 'src/infrastructure/base/base.service';
import { appConfig } from 'src/config';
import { Roles } from 'src/common/enum/roles.enum';
import { AdminEntity } from './entities/admin.entity';
import { successRes } from 'src/infrastructure/response/success.response';
import { IToken } from 'src/infrastructure/token/interface';
import { IResponse } from 'src/infrastructure/pagination/successResponse';
import { Brackets, FindOptionsOrder, Not, Repository } from 'typeorm';
import { SigninDto } from 'src/common/dto/signin.dto';
import { UpdatePasswordDto } from 'src/common/dto/update-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenService } from 'src/infrastructure/token/Token';
import { CryptoService } from 'src/infrastructure/crypto/crypto.service';
import { type Response } from 'express';
import { TokenName } from 'src/common/enum/token-name';
import { SortEnum } from './enum/admin-enum';
import { StudentEntity } from '../student/entities/student.entity';
@Injectable()
export class AdminService
  extends BaseService<CreateAdminDto, UpdateAdminDto, AdminEntity>
  implements OnModuleInit {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,
    @InjectRepository(StudentEntity) private readonly studentRepository: Repository<StudentEntity>,
    private readonly tokenService: TokenService,
    private readonly crypto: CryptoService,
  ) {
    super(adminRepo);
  }

  async onModuleInit() {
    const superAdmin = await this.adminRepo.findOne({
      where: { role: Roles.SUPER_ADMIN },
    });
    if (!superAdmin) {
      const password = await this.crypto.encrypt(
        appConfig.SUPER_ADMIN.PASSWORD,
      );
      const data = this.adminRepo.create({
        username: appConfig.SUPER_ADMIN.USERNAME,
        password,
        fullname: appConfig.SUPER_ADMIN.FULLNAME,
        role: Roles.SUPER_ADMIN,
      });
      await this.adminRepo.save(data);
      console.log('Super Admin created');
    }
  }
  // --------------------- CREATE ADMIN ---------------------

  async createAdmin(dto: CreateAdminDto) {
    const existsUsername = await this.adminRepo.findOneBy({
      username: dto.username,
    });

    if (existsUsername) throw new HttpException('Username already exists', 409);

    dto.password = await this.crypto.encrypt(dto.password);

    const adminData = this.adminRepo.create(dto);
    const data = await this.adminRepo.save(adminData);

    return successRes(data, 201);
  }
  // --------------------- DASHBOARD ---------------------
  async getDashboard() {
    const allStudent = await this.studentRepository.findAndCount({ where: { isActive: true, isDeleted: false } })
    console.log(allStudent);

  }

  // --------------------- FIND ALL ADMIN ---------------------
  async findAllAdmin(
    page: number = 1,
    limit: number = 100,
    search?: string,
    sort: SortEnum = SortEnum.CREATED_AT,
  ) {
    const skip = (page - 1) * limit;

    // Default where
    const where: any = {
      isDeleted: false,
    };

    // Sort
    const order: FindOptionsOrder<AdminEntity> = {
      [sort]: 'DESC',
    };
    if (search) {
      const qb = this.adminRepo.createQueryBuilder('a')
        .where('a.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere(
          new Brackets(qb => {
            if (!isNaN(Number(search))) {
              qb.orWhere('a.id = :id', { id: Number(search) });
            }
            qb.orWhere('a.phoneNumber = :phoneNumber', { phoneNumber: search });
            qb.orWhere('a.username ILIKE :username', { username: `%${search}%` });
          })
        )
        .orderBy(`a.${sort}`, 'DESC')
        .skip(skip)
        .take(limit);

      const [admins, total] = await qb.getManyAndCount();
      return { admins, total };
    }

    // Agar search bo‘lmasa oddiy findAndCount
    const [admins, total] = await this.adminRepo.findAndCount({
      where,
      order,
      skip,
      take: limit,
      select: {
        id: true,
        fullname: true,
        createdAt: true,
        username: true,
        role: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    return { admins, total };
  }
  // --------------------- UPDATE ---------------------

  async updateAdmin(id: number, dto: UpdateAdminDto, user: IToken): Promise<IResponse> {

    const { fullname, username, password } = dto

    const admin = await this.adminRepo.findOne({ where: { id } });

    let newPassword = admin?.password
    if (!admin) throw new HttpException('Admin not found', 404);

    if (dto.username) {
      const existsUsername = await this.adminRepo.findOne({
        where: { username: dto.username, id: Not(id) },
      });

      if (existsUsername)
        throw new HttpException('Username already exists', 409);
    }
    if (password && user.role == Roles.SUPER_ADMIN) {
      newPassword = await this.crypto.encrypt(password);
    }

    await this.adminRepo.update({ id }, { fullname, username, password: newPassword });
    const updated = await this.adminRepo.findOne({ where: { id } });

    return successRes(updated);
  }
  // --------------------- SIGN IN ADMIN ---------------------

  async signIn(dto: SigninDto, res: Response) {

    const { username, password } = dto;
    const admin = await this.adminRepo.findOne({ where: { username } });

    const isMatchPassword = await this.crypto.decrypt(
      password,
      admin?.password || '',
    );

    if (!admin || !isMatchPassword)
      throw new HttpException('Username or password is incorrect', 400);

    const payload: IToken = {
      id: admin.id,
      isActive: admin.isActive,
      role: admin.role,
    };
    const accessToken = await this.tokenService.accessToken(payload);
    
    res.clearCookie(TokenName.TEACHER_TOKEN)
    res.clearCookie(TokenName.ADMIN_TOKEN)
    res.clearCookie(TokenName.STUDENT_TOKEN)

    await this.tokenService.writeCookie(res, TokenName.ADMIN_TOKEN, accessToken, 30);

    return successRes({
      token: accessToken,
      user: {
        id: admin.id,
        username: admin.username,
        fullname: admin.fullname,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  }
  // --------------------- SIGN OUT ---------------------

  async signOut(res: Response, tokenKey: string) {
    res.clearCookie(tokenKey);
    return successRes({});
  }

  // --------------------- UPDATE PASSWORD ADMIN ---------------------

  async updatePassword(id: number, dto: UpdatePasswordDto): Promise<IResponse> {

    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new HttpException('Admin not found', 404);

    const isMatchPassword = await this.crypto.decrypt(
      dto.oldPassword,
      admin.password,
    );
    if (!isMatchPassword)
      throw new HttpException('Old password is incorrect', 400);

    const newPassword = await this.crypto.encrypt(dto.newPassword);
    const updated = await this.adminRepo.update(id, { password: newPassword });

    return successRes(updated);
  }
}