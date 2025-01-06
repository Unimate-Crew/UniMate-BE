import { Controller, Get } from '@nestjs/common';
import { ApiServerService } from './api-server.service';

@Controller()
export class ApiServerController {
  constructor(private readonly apiServerService: ApiServerService) {}

  @Get()
  getHello(): string {
    return this.apiServerService.getHello();
  }
}
