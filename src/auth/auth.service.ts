import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  validateApiKey(apiKey: string) {
    return apiKey === process.env.appKey;
  }
}
