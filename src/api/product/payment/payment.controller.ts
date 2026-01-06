import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseBoolPipe, ParseEnumPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { ApiOperation } from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthGuard } from 'src/common/guard/AuthGuard';
import { PaymentStatus } from './enum/payment-status';
import { ApiFilterQueries } from 'src/common/decorator/payment-list';

@Controller('payment')
@UseGuards(AuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }
  // ----------------------- PAYMENT STUDENT -----------------------

  @Post()
  @ApiOperation({ summary: 'Payment for leeson for teacher' })
  @AccessRoles(Roles.STUDENT)

  paymentStudent(@Body() dto: CreatePaymentDto) {
    return this.paymentService.processLessonPayment(dto);
  }

  // ----------------------- PAYMENT ALL FOR ADMIN -----------------------

  @Get()

  @ApiOperation({ summary: 'Payment for leeson for teacher' })
  @AccessRoles(Roles.SUPER_ADMIN, Roles.ADMIN)
  @ApiFilterQueries()

  findAll(
    @Query('active', new ParseBoolPipe({ optional: true })) active?: boolean,
    @Query('status', new ParseEnumPipe(PaymentStatus, { optional: true })) status?: PaymentStatus,
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

    return this.paymentService.findAllPayment(
      pageNumber,
      limitNumber,
      active, status, role, search);
  }

  // ----------------------- GET ONE PAYMENT -----------------------

  @Get(':id')

  @ApiOperation({ summary: 'Get one paymnent for student, teacher' })
  @AccessRoles(Roles.STUDENT, Roles.TEACHER, Roles.SUPER_ADMIN, Roles.ADMIN)

  findOne(@Param('id') id: number) {
    return this.paymentService.findOnePayment(+id);
  }

}
