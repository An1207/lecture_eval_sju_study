import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

const currentWorker = '정재경';
const currentWorkers = '여기는 단풍브랜치요';
const something = '으아아아악';

@Injectable()
export class AppService {
  private readonly startedAt = Date.now();

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  getHealth() {
    return {
      status: 'ok',
      currentWorker,
      currentWorkers,
      something,
      timestamp: new Date().toISOString(),
    };
  }

  async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        database: 'connected',
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
      });
    }
  }

  getServerInfo() {
    const uptimeSeconds = Math.floor((Date.now() - this.startedAt) / 1000);

    return {
      name: 'lecture-eval-api',
      version: process.env.npm_package_version ?? '0.0.1',
      nodeVersion: process.version,
      uptimeSeconds,
      env: process.env.NODE_ENV ?? 'development',
      port: process.env.PORT ?? 3000,
    };
  }
}
