import React from 'react';
import { Row, Col, Input, Select, Card, Space, Button } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

export interface FilterOption {
  label: string;
  value: string;
}

export interface SalesManagementFiltersProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  
  // Representative filter
  showRepresentativeFilter?: boolean;
  representatives?: FilterOption[];
  selectedRepresentative?: string;
  onRepresentativeChange?: (value: string) => void;
  
  // Status filter
  showStatusFilter?: boolean;
  statusOptions?: FilterOption[];
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  
  // Branch filter
  showBranchFilter?: boolean;
  branches?: FilterOption[];
  selectedBranch?: string;
  onBranchChange?: (value: string) => void;
  
  // Period filter
  showPeriodFilter?: boolean;
  periodOptions?: FilterOption[];
  selectedPeriod?: string;
  onPeriodChange?: (value: string) => void;
  
  // Custom filters
  customFilters?: React.ReactNode;
  
  // Actions
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

const SalesManagementFilters: React.FC<SalesManagementFiltersProps> = ({
  searchPlaceholder = "البحث...",
  searchValue = "",
  onSearchChange,
  
  showRepresentativeFilter = false,
  representatives = [],
  selectedRepresentative,
  onRepresentativeChange,
  
  showStatusFilter = false,
  statusOptions = [],
  selectedStatus,
  onStatusChange,
  
  showBranchFilter = false,
  branches = [],
  selectedBranch,
  onBranchChange,
  
  showPeriodFilter = false,
  periodOptions = [],
  selectedPeriod,
  onPeriodChange,
  
  customFilters,
  onClearFilters,
  showClearButton = true
}) => {
  const hasActiveFilters = selectedRepresentative !== 'all' || 
                          selectedStatus !== 'all' || 
                          selectedBranch !== 'all' ||
                          selectedPeriod !== 'current_month' ||
                          searchValue.length > 0;

  return (
    <Card className="mb-6">
      <Row gutter={16} align="middle">
        {/* Search Input */}
        <Col xs={24} sm={8} md={6}>
          <Search
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            allowClear
            prefix={<SearchOutlined />}
          />
        </Col>

        {/* Representative Filter */}
        {showRepresentativeFilter && (
          <Col xs={24} sm={8} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر المندوب"
              value={selectedRepresentative}
              onChange={onRepresentativeChange}
              allowClear
            >
              <Option value="all">جميع المندوبين</Option>
              {representatives.map(rep => (
                <Option key={rep.value} value={rep.value}>{rep.label}</Option>
              ))}
            </Select>
          </Col>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <Col xs={24} sm={8} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر الحالة"
              value={selectedStatus}
              onChange={onStatusChange}
              allowClear
            >
              <Option value="all">جميع الحالات</Option>
              {statusOptions.map(status => (
                <Option key={status.value} value={status.value}>{status.label}</Option>
              ))}
            </Select>
          </Col>
        )}

        {/* Branch Filter */}
        {showBranchFilter && (
          <Col xs={24} sm={8} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر الفرع"
              value={selectedBranch}
              onChange={onBranchChange}
              allowClear
            >
              <Option value="all">جميع الفروع</Option>
              {branches.map(branch => (
                <Option key={branch.value} value={branch.value}>{branch.label}</Option>
              ))}
            </Select>
          </Col>
        )}

        {/* Period Filter */}
        {showPeriodFilter && (
          <Col xs={24} sm={8} md={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="اختر الفترة"
              value={selectedPeriod}
              onChange={onPeriodChange}
            >
              {periodOptions.map(period => (
                <Option key={period.value} value={period.value}>{period.label}</Option>
              ))}
            </Select>
          </Col>
        )}

        {/* Custom Filters */}
        {customFilters && (
          <Col xs={24} sm={8} md={4}>
            {customFilters}
          </Col>
        )}

        {/* Clear Filters Button */}
        {showClearButton && hasActiveFilters && (
          <Col xs={24} sm={8} md={4}>
            <Button 
              icon={<ClearOutlined />} 
              onClick={onClearFilters}
              type="default"
            >
              مسح الفلاتر
            </Button>
          </Col>
        )}
      </Row>
      
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Row className="mt-3">
          <Col span={24}>
            <Space wrap>
              <FilterOutlined style={{ color: '#1890ff' }} />
              <span style={{ color: '#666', fontSize: '14px' }}>
                الفلاتر النشطة:
              </span>
              {selectedRepresentative !== 'all' && (
                <span style={{ background: '#e6f7ff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  المندوب: {representatives.find(r => r.value === selectedRepresentative)?.label}
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span style={{ background: '#f6ffed', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  الحالة: {statusOptions.find(s => s.value === selectedStatus)?.label}
                </span>
              )}
              {selectedBranch !== 'all' && (
                <span style={{ background: '#fff2e8', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  الفرع: {branches.find(b => b.value === selectedBranch)?.label}
                </span>
              )}
              {searchValue && (
                <span style={{ background: '#f9f0ff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  البحث: "{searchValue}"
                </span>
              )}
            </Space>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default SalesManagementFilters;
