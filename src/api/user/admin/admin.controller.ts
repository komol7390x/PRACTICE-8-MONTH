import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { SigninDto } from 'src/common/dto/signin.dto';
import { CookieGetter } from 'src/common/decorator/cookieGetter.decorator';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { UpdatePasswordDto } from 'src/common/dto/update-password.dto';
import { type Response } from 'express';
import { type IToken } from 'src/infrastructure/token/interface';
import { TokenName } from 'src/common/enum/token-name';
import { SortEnum } from './enum/admin-enum';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) { }

  // --------------------- CREATE ADMIN ---------------------
  @Post('create-admin')

  @ApiOperation({ summary: 'for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN)

  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }
  // --------------------- SIGN IN ADMIN ---------------------

  @Post('signin')

  @ApiOperation({ summary: 'public' })
  @AccessRoles('public')

  signIn(@Body() dto: SigninDto, @Res({ passthrough: true }) res: Response) {
    return this.adminService.signIn(dto, res);
  }
  // --------------------- SIGN OUT ADMIN ---------------------

  @Post('signout')

  @ApiOperation({ summary: 'for super admin and admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  signOut(
    @CookieGetter(TokenName.ADMIN_TOKEN) token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.signOut(res, TokenName.ADMIN_TOKEN);
  }

  // --------------------- FOR SUPER ADMIN ---------------------

  @Get('all')

  @ApiOperation({ summary: 'for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, enum: SortEnum })

  getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: SortEnum,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber
    return this.adminService.findAllAdmin(pageNumber, limitNumber, search, sort);
  }
  // --------------------- GET ME ---------------------
  // @Get('me')

  @ApiOperation({ summary: 'for super admin and admin' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)

  getProfile(@CurrentUser() user: IToken) {
    return this.adminService.findOneById(user.id, {
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  // --------------------- ADMIN ONE ---------------------

  @Get('details')

  @ApiOperation({ summary: 'for admin' })
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)

  getDetails(@CurrentUser() user: IToken) {
    return this.adminService.findOneById(user.id, {
      select: {
        avatarUrl: true,
        password: true,
        isActive: true,
        isDeleted: true,
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  // --------------------- UPDATE DETAILES ---------------------

  @Patch('update-details/:id')

  @ApiOperation({ summary: 'for super admin and admin' })
  @AccessRoles(Roles.SUPER_ADMIN, 'ID')

  updateDetails(
    @Param('id') id: number,
    @Body() dto: UpdateAdminDto,
    @CurrentUser() user: IToken) {
    return this.adminService.updateAdmin(id, dto, user);
  }
  // --------------------- UPDATE PASSWORD ---------------------

  @Patch('update-password')

  @ApiOperation({ summary: 'for admins' })
  @AccessRoles(Roles.SUPER_ADMIN, 'ID')

  updatePassword(@Body() dto: UpdatePasswordDto, @CurrentUser() user: IToken) {
    return this.adminService.updatePassword(user.id, dto);
  }

  // --------------------- SOFT DELETE ---------------------

  @Patch('soft-delete/:id')

  @ApiOperation({ summary: 'for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN)

  softDelete(@Param('id') id: number) {
    return this.adminService.softDelete(id);
  }
  // ---------------------  DELETE ---------------------

  @Delete('delete/:id')

  @ApiOperation({ summary: 'for super admin' })
  @AccessRoles(Roles.SUPER_ADMIN)

  delete(@Param('id') id: number) {
    return this.adminService.delete(id);
  }
}
