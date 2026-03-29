import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  greet(name: string): string {
    return `Hello, ${name}!`;
  }

  echo(data: Record<string, unknown>): { received: Record<string, unknown> } {
    return { received: data };
  }
}
