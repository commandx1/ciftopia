import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  async processPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: any,
  ) {
    const ip = req.headers['x-forwarded-for'] || req.ip || '127.0.0.1';
    return this.paymentService.createPayment(createPaymentDto, req.user, ip);
  }
}
