import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('healthcheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check service health status' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  check() {
    return this.health.check([
      // Database health check
      () => this.db.pingCheck('database'),

      // Memory health checks
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB heap
      () => this.memory.checkRSS('memory_rss', 400 * 1024 * 1024), // 400MB RSS

      // Disk health check (cross-platform)
      () =>
        this.disk.checkStorage('disk', {
          path: this.getDiskPath(),
          thresholdPercent: 0.9, // Alert if disk is 90% full
        }),
    ]);
  }

  //Get the appropriate disk path based on the operating system
  private getDiskPath(): string {
    if (process.platform === 'win32') {
      // On Windows, extract the drive letter from current working directory
      // e.g., "D:\pall-mall-core-services" -> "D:\"
      return process.cwd().substring(0, 3);
    }
    // On Unix/Linux/Mac
    return '/';
  }
}
