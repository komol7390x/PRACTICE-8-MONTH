import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { ApiOperation } from '@nestjs/swagger';
import { RequestMethod, Type } from './enum/type';
import { ApiFilterQueries } from 'src/common/decorator/logger.decorator';

@Controller('logger')
@UseGuards(AuthGuard, RolesGuard)
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) { }
  // ------------------GET ALL LOGGER ------------------
  @Get()

  @AccessRoles(Roles.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all Loggers' })
  @ApiFilterQueries()

  findAll(
    @Query('role', new ParseEnumPipe(Roles, { optional: true })) role?: Roles,
    @Query('method', new ParseEnumPipe(RequestMethod, { optional: true })) method?: RequestMethod,
    @Query('type', new ParseEnumPipe(Type, { optional: true })) type?: Type,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 10;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    return this.loggerService.findAll(role, method, type, search,pageNumber, limitNumber);
  }

  // ------------------GET ONE LOGGER ------------------
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loggerService.findOne(+id);
  }
}
