import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticaService } from './statistica.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { ApiOperation } from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';

@Controller('statistica')
@UseGuards(AuthGuard, RolesGuard)
export class StatisticaController {
  constructor(private readonly statisticaService: StatisticaService) { }
  // ------------------- GET ADMIN -------------------
  @Get('admin')

  @ApiOperation({ summary: 'Get admin statistics' })
  @AccessRoles(Roles.SUPER_ADMIN)

  getAdmin() {
    return this.statisticaService.getAdmin();
  }

}
