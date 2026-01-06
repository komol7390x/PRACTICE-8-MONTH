import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseBoolPipe, ParseEnumPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { ApiOperation } from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { type IToken } from 'src/infrastructure/token/interface';
import { PaymentStatus } from './enum/payment-status';
import { ApiPaymentFilters } from 'src/common/decorator/payment.decorator';

@Controller('payment')
@UseGuards(AuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }
  // ----------------------- PAYMENT STUDENT -----------------------

  @Post()
  @ApiOperation({ summary: 'registration leeson for teacher' })
  @AccessRoles(Roles.STUDENT)
  paymentStudent(@Body() dto: CreatePaymentDto) {
    return this.paymentService.processLessonPayment(dto);
  }

  // ----------------------- PAYMENT ALL -----------------------

  @Get()

  @ApiPaymentFilters()
  @ApiOperation({ summary: 'registration leeson for teacher' })
  @AccessRoles(Roles.ADMIN, Roles.SUPER_ADMIN)

  findAll(
    @Query('status', new ParseEnumPipe(PaymentStatus, { optional: true })) status?: PaymentStatus,
    @Query('active', new ParseBoolPipe({ optional: true })) active?: boolean,
    @Query('deleted', new ParseBoolPipe({ optional: true })) deleted?: boolean,
    @Query('role', new ParseEnumPipe(Roles, { optional: true })) role?: Roles,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let pageNumber = page ? parseInt(page, 10) : 1;
    let limitNumber = limit ? parseInt(limit, 10) : 100;

    if (limitNumber < 1) limitNumber = 1;
    if (limitNumber > 100) limitNumber = 100;
    pageNumber = pageNumber < 1 ? 1 : pageNumber
    return this.paymentService.findAllPayment({
      status,
      active,
      deleted,
      role,
      search,
      page: pageNumber,
      limit: limitNumber
    });
  }

  // ----------------------- PAYMENT STUDENT -----------------------

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOneById(+id);
  }
  // ----------------------- PAYMENT STUDENT -----------------------

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.delete(+id);
  }
}
