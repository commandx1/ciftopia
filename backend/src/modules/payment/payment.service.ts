import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Iyzipay from 'iyzipay';
import { CreatePaymentDto } from './dto/payment.dto';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';

@Injectable()
export class PaymentService {
  private iyzipay: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
  ) {}

  private initIyzipay() {
    const apiKey = this.configService.get<string>('IYZICO_API_KEY')?.trim();
    const secretKey = this.configService
      .get<string>('IYZICO_SECRET_KEY')
      ?.trim();
    const uri = this.configService.get<string>('IYZICO_BASE_URL')?.trim();

    Logger.log(
      `Initializing Iyzico with API Key: ${apiKey?.substring(0, 10)}... (Length: ${apiKey?.length})`,
    );
    Logger.log(`URI: ${uri}`);

    this.iyzipay = new Iyzipay({
      apiKey: apiKey ?? '',
      secretKey: secretKey ?? '',
      uri: uri ?? '',
    });
  }

  async createPayment(
    createPaymentDto: CreatePaymentDto,
    user: any,
    ip: string = '127.0.0.1',
  ) {
    // Nesne henüz oluşturulmadıysa veya değerler yüklendiyse başlat
    if (!this.iyzipay) {
      this.initIyzipay();
    }

    const {
      cardHolderName,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,
      amount,
      subdomain,
    } = createPaymentDto;

    // Ay ve yıl formatını doğrula (2 hane olmalı)
    const formattedMonth = expireMonth.toString().padStart(2, '0');
    const formattedYear =
      expireYear.toString().length === 4
        ? expireYear.toString().substring(2)
        : expireYear.toString();

    const formattedAmount = Number(amount).toFixed(2);

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `payment_${Date.now()}`,
      price: formattedAmount,
      paidPrice: formattedAmount,
      currency: Iyzipay.CURRENCY.TRY,
      installment: '1',
      basketId: `basket_${subdomain}`,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      paymentCard: {
        cardHolderName,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expireMonth: formattedMonth,
        expireYear: formattedYear,
        cvc: cvc.toString(),
        registerCard: '0',
      },
      buyer: {
        id: user._id.toString(),
        name: user.firstName,
        surname: user.lastName,
        gsmNumber: '+905350000000',
        email: user.email,
        identityNumber: '74455555555',
        lastLoginDate: '2015-10-05 12:43:35',
        registrationDate: '2013-04-21 15:12:09',
        registrationAddress: 'Nisantasi',
        ip: ip,
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34732',
      },
      shippingAddress: {
        contactName: `${user.firstName} ${user.lastName}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nisantasi',
        zipCode: '34732',
      },
      billingAddress: {
        contactName: `${user.firstName} ${user.lastName}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nisantasi',
        zipCode: '34732',
      },
      basketItems: [
        {
          id: `item_${subdomain}`,
          name: `Couple Site Plan - ${subdomain}`,
          category1: 'Subscription',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: amount.toString(),
        },
      ],
    };

    Logger.log('Sending request to Iyzico...');

    return new Promise((resolve, reject) => {
      this.iyzipay.payment.create(request, async (err: any, result: any) => {
        if (err) {
          Logger.error('Iyzico Request Error:', err);
          return reject(new BadRequestException(err.message));
        }

        if (result.status === 'failure') {
          Logger.warn(
            'Iyzico Payment Failure:',
            JSON.stringify(result, null, 2),
          );
          return reject(new BadRequestException(result.errorMessage));
        }

        Logger.log('Iyzico Payment Success:', result.paymentId);
        resolve(result);
      });
    });
  }
}
