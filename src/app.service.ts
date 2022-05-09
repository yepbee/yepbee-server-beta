import { Injectable } from '@nestjs/common';
import { EnvService } from './env/env.service';

@Injectable()
export class AppService {
  constructor(private readonly envService: EnvService) {}
  getHello(): string {
    return 'Hello World!';
  }
}
