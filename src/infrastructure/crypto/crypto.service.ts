import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

@Injectable()
export class CryptoService {
  async encrypt(password: string): Promise<string> {
    return hash(password, 7);
  }

  async decrypt(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
