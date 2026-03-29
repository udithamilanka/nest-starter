import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('greet/:name')
  greet(@Param('name') name: string): string {
    return this.appService.greet(name);
  }

  @Post('echo')
  echo(@Body() data: Record<string, unknown>): {
    received: Record<string, unknown>;
  } {
    return this.appService.echo(data);
  }
}
