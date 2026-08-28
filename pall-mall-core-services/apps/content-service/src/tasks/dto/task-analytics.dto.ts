import { ApiProperty } from '@nestjs/swagger';

export class TaskMetricsResponseDto {
  @ApiProperty({
    example: {
      total: 88,
      percentageChange: 12,
      comparisonPeriod: 'vs last month',
    },
    description: 'Total approvals count with comparison',
  })
  totalApprovals: {
    total: number;
    percentageChange: number;
    comparisonPeriod: string;
  };

  @ApiProperty({
    example: {
      total: 24,
      percentageChange: 8,
      comparisonPeriod: 'vs last week',
    },
    description: 'This week approvals count with comparison',
  })
  thisWeek: {
    total: number;
    percentageChange: number;
    comparisonPeriod: string;
  };

  @ApiProperty({
    example: {
      averageHours: 1.5,
      percentageChange: -20,
      comparisonPeriod: 'improvement',
    },
    description: 'Average response time in hours with comparison',
  })
  avgResponseTime: {
    averageHours: number;
    percentageChange: number;
    comparisonPeriod: string;
  };

  @ApiProperty({
    example: {
      total: 12,
      status: 'Awaiting review',
    },
    description: 'Outstanding forms/tasks count',
  })
  outstandingForms: {
    total: number;
    status: string;
  };
}
