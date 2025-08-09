import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  BarChartOutlined,
  DollarOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
  TeamOutlined
} from '@ant-design/icons';

export interface SalesManagementNavigationProps {
  currentPage?: 'representatives' | 'performance' | 'commissions' | 'targets';
  showBackButton?: boolean;
  backUrl?: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'text' | 'link';
}

const SalesManagementNavigation: React.FC<SalesManagementNavigationProps> = ({
  currentPage,
  showBackButton = true,
  backUrl = '/management/sales',
  size = 'middle',
  type = 'default'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      key: 'representatives',
      title: 'إدارة المندوبين',
      icon: <TeamOutlined />,
      path: '/management/sales-representatives'
    },
    {
      key: 'performance',
      title: 'تقييم الأداء',
      icon: <BarChartOutlined />,
      path: '/management/performance-evaluation'
    },
    {
      key: 'commissions',
      title: 'العمولات',
      icon: <DollarOutlined />,
      path: '/management/sales-commissions'
    },
    {
      key: 'targets',
      title: 'الأهداف',
      icon: <TrophyOutlined />,
      path: '/management/sales-targets'
    }
  ];

  const handleNavigation = (path: string) => {
    // Preserve query parameters when navigating
    const searchParams = new URLSearchParams(location.search);
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    
    navigate(fullPath);
    window.scrollTo(0, 0);
  };

  return (
    <Space wrap>
      {/* Back Button */}
      {showBackButton && (
        <Tooltip title="العودة">
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(backUrl)}
            size={size}
            type={type}
          >
            العودة
          </Button>
        </Tooltip>
      )}

      {/* Navigation Buttons */}
      {navigationItems
        .filter(item => item.key !== currentPage)
        .map(item => (
          <Tooltip key={item.key} title={item.title}>
            <Button
              icon={item.icon}
              onClick={() => handleNavigation(item.path)}
              size={size}
              type={type}
            >
              {item.title}
            </Button>
          </Tooltip>
        ))}
    </Space>
  );
};

export default SalesManagementNavigation;
