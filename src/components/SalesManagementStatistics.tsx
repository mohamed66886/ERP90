import React from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { ReactNode } from 'react';

export interface StatisticItem {
  title: string;
  value: number;
  prefix?: ReactNode;
  suffix?: string;
  formatter?: (value: number) => string;
  precision?: number;
  loading?: boolean;
  color?: string;
}

export interface SalesManagementStatisticsProps {
  statistics: StatisticItem[];
  loading?: boolean;
  colSpan?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const SalesManagementStatistics: React.FC<SalesManagementStatisticsProps> = ({
  statistics,
  loading = false,
  colSpan = { xs: 24, sm: 12, md: 6 }
}) => {
  if (loading) {
    return (
      <div className="mb-6 text-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={16} className="mb-6">
      {statistics.map((stat, index) => (
        <Col key={index} {...colSpan}>
          <Card>
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              formatter={stat.formatter}
              precision={stat.precision}
              loading={stat.loading}
              valueStyle={{ color: stat.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default SalesManagementStatistics;
