import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class MailService {
  private readonly sesClient: SESClient;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail = 'noreply@ciftopia.com'; // SES'te doğrulanmış bir mail olmalı

  constructor(private configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async sendVerificationEmail(email: string, token: string, firstName: string) {
    const baseUrl = this.configService.get('FRONTEND_URL') || 'https://ciftopia.com';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    const logoUrl = `${baseUrl}/ciftopia-logo.png`;

    const subject = 'Ciftopia - E-posta Adresinizi Doğrulayın';
    const body = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p style="text-align: center; margin-bottom: 24px;">
          <img src="${logoUrl}" alt="Ciftopia" width="120" height="120" style="display: block; margin: 0 auto;" />
        </p>
        <h1 style="color: #1f2937;">Merhaba ${firstName}!</h1>
        <p>Ciftopia'ya hoş geldin! Hesabını aktifleştirmek için lütfen aşağıdaki bağlantıya tıkla:</p>
        <p><a href="${verificationUrl}" style="color: #C44569; font-weight: 600;">E-posta Adresini Doğrula</a></p>
        <p style="color: #6b7280; font-size: 14px;">Eğer bu hesabı sen oluşturmadıysan, bu maili görmezden gelebilirsin.</p>
        <br>
        <p>Sevgiler,<br><strong>Ciftopia Ekibi</strong></p>
      </div>
    `;

    return this.sendEmail(email, subject, body);
  }

  private async sendEmail(to: string, subject: string, body: string) {
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: this.fromEmail,
    });

    try {
      await this.sesClient.send(command);
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      // Geliştirme ortamında hata fırlatmayalım ki akış bozulmasın
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }
}
