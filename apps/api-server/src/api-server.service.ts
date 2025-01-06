import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiServerService {
  getHello(): string {
    return 'Hello World!';
  }
}
