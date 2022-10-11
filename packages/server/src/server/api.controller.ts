import { Controller, Get, Post } from '@nestjs/common';

@Controller('api')
export class ApiController {
  @Get('list')
  // @TYPES remove any
  public async list(): Promise<any> {
    return '';
  }

  @Get('start')
  // @TYPES remove any
  public async start(): Promise<any> {
    return '';
  }

  @Get('stop')
  // @TYPES remove any
  public async stop(): Promise<any> {
    return '';
  }

  @Post('create')
  public async create(): Promise<any> {
    return '';
  }
}
