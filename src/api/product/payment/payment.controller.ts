import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { RolesGuard } from 'src/common/guard/RolesGuard';
import { ApiOperation } from '@nestjs/swagger';
import { AccessRoles } from 'src/common/decorator/roles.decorator';
import { Roles } from 'src/common/enum/roles.enum';
import { AuthGuard } from 'src/common/guard/AuthGuard';

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
  // ----------------------- PAYMENT STUDENT -----------------------

  @Get()
  findAll() {
    return this.paymentService.findAll();
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
