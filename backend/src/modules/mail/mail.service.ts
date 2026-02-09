import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class MailService {
  private readonly sesClient: SESClient;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail = 'ciftopia.services@gmail.com'; // SES'te doğrulanmış bir mail olmalı

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
    const baseUrl: string =
      this.configService.get('FRONTEND_URL') || 'https://ciftopia.com';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

    const subject = '💕 Çiftopia - E-posta Adresinizi Doğrulayın';
    const body = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #fdf2f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(196, 69, 105, 0.12);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #C44569, #e8668a); padding: 36px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 1px;">Çiftopia</h1>
                    <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.85);">Aşkınızın Ütopyası 💕</p>
                  </td>
                </tr>
  
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 8px; font-size: 22px; color: #1f2937;">Merhaba ${firstName}! 👋</h2>
                    <p style="margin: 0 0 24px; font-size: 15px; color: #6b7280; line-height: 1.6;">
                      Çiftopia ailesine katıldığın için çok mutluyuz! Hesabını aktifleştirmek için aşağıdaki butona tıkla.
                    </p>
  
                    <!-- CTA Button -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding: 8px 0 32px;">
                          <a href="${verificationUrl}" 
                             style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #C44569, #e8668a); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 50px; letter-spacing: 0.5px;">
                            E-postamı Doğrula ✉️
                          </a>
                        </td>
                      </tr>
                    </table>
  
                    <!-- Divider -->
                    <hr style="border: none; border-top: 1px solid #f3e8ff; margin: 0 0 24px;">
  
                    <!-- Alt link -->
                    <p style="margin: 0 0 8px; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                      Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcına yapıştır:
                    </p>
                    <p style="margin: 0 0 24px; font-size: 12px; color: #C44569; word-break: break-all;">
                      ${verificationUrl}
                    </p>
  
                    <!-- Security note -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #fdf2f8; border-radius: 12px; padding: 16px 20px;">
                          <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                            🔒 Bu bağlantı güvenliğiniz için <strong>24 saat</strong> geçerlidir. Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
  
                <!-- Footer -->
                <tr>
                  <td style="background-color: #faf5ff; padding: 24px 40px; text-align: center; border-top: 1px solid #f3e8ff;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                      Sevgilerle,<br><strong style="color: #C44569;">Çiftopia Ekibi</strong> 💕
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #d1d5db;">
                      © ${new Date().getFullYear()} Çiftopia. Tüm hakları saklıdır.
                    </p>
                  </td>
                </tr>
  
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
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
