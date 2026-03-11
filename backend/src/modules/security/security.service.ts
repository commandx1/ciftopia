import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { CoupleKey, CoupleKeyDocument } from '../../schemas/couple-key.schema';

const ENC_PREFIX = 'enc:v1:';
const WRAP_PREFIX = 'wrap:v1:';
const IV_LENGTH = 12;

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly masterKey: Buffer | null;
  private readonly encryptionEnabled: boolean;

  constructor(
    @InjectModel(CoupleKey.name)
    private coupleKeyModel: Model<CoupleKeyDocument>,
    private configService: ConfigService,
  ) {
    const keyB64 = this.configService.get<string>('DATA_ENCRYPTION_KEY');
    if (!keyB64) {
      this.logger.error(
        'DATA_ENCRYPTION_KEY is not set. Field encryption disabled.',
      );
      this.masterKey = null;
      this.encryptionEnabled = false;
      return;
    }

    const key = Buffer.from(keyB64, 'base64');
    if (key.length !== 32) {
      this.logger.error(
        'DATA_ENCRYPTION_KEY must be 32 bytes base64.',
      );
      this.masterKey = null;
      this.encryptionEnabled = false;
      return;
    }

    this.masterKey = key;
    this.encryptionEnabled = true;
  }

  isEnabled() {
    return this.encryptionEnabled;
  }

  async encryptForCouple(coupleId: string, plaintext: string) {
    if (!this.encryptionEnabled || !this.masterKey) return plaintext;
    const dek = await this.getOrCreateCoupleKey(coupleId);
    return this.encryptString(plaintext, dek);
  }

  async decryptForCouple(coupleId: string, payload: string) {
    if (!this.encryptionEnabled || !this.masterKey) return payload;
    if (!this.isEncrypted(payload)) return payload;
    const dek = await this.getOrCreateCoupleKey(coupleId);
    return this.decryptString(payload, dek);
  }

  isEncrypted(payload: string) {
    return typeof payload === 'string' && payload.startsWith(ENC_PREFIX);
  }

  private async getOrCreateCoupleKey(coupleId: string) {
    if (!this.masterKey) {
      throw new InternalServerErrorException(
        'Encryption not configured.',
      );
    }

    const coupleObjectId = new Types.ObjectId(coupleId);
    const existing = await this.coupleKeyModel
      .findOne({ coupleId: coupleObjectId })
      .lean()
      .exec();

    if (existing?.wrappedKey) {
      return this.unwrapKey(existing.wrappedKey);
    }

    const dek = randomBytes(32);
    const wrappedKey = this.wrapKey(dek);
    await this.coupleKeyModel.create({
      coupleId: coupleObjectId,
      wrappedKey,
      keyVersion: 1,
    });
    return dek;
  }

  private wrapKey(dek: Buffer) {
    if (!this.masterKey) {
      throw new InternalServerErrorException(
        'Encryption not configured.',
      );
    }
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv('aes-256-gcm', this.masterKey, iv);
    const ciphertext = Buffer.concat([cipher.update(dek), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${WRAP_PREFIX}${iv.toString('base64')}:${tag.toString(
      'base64',
    )}:${ciphertext.toString('base64')}`;
  }

  private unwrapKey(payload: string) {
    if (!this.masterKey) {
      throw new InternalServerErrorException(
        'Encryption not configured.',
      );
    }
    if (!payload.startsWith(WRAP_PREFIX)) {
      throw new InternalServerErrorException('Invalid wrapped key.');
    }
    const raw = payload.slice(WRAP_PREFIX.length);
    const [ivB64, tagB64, dataB64] = raw.split(':');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.masterKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]);
  }

  private encryptString(plaintext: string, key: Buffer) {
    if (!plaintext) return plaintext;
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${ENC_PREFIX}${iv.toString('base64')}:${tag.toString(
      'base64',
    )}:${ciphertext.toString('base64')}`;
  }

  private decryptString(payload: string, key: Buffer) {
    if (!payload) return payload;
    if (!payload.startsWith(ENC_PREFIX)) return payload;
    const raw = payload.slice(ENC_PREFIX.length);
    const [ivB64, tagB64, dataB64] = raw.split(':');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const data = Buffer.from(dataB64, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
