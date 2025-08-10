import React, { memo, useMemo } from 'react';
import { Select, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface Customer {
  id: string;
  nameAr?: string;
  nameEn?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  mobile?: string;
  commercialReg?: string;
  taxFile?: string;
}

interface CustomerSelectProps {
  value: string;
  onChange: (value: string) => void;
  customers: Customer[];
  onAddNewCustomer: () => void;
  onQuickSearch: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const CustomerSelect: React.FC<CustomerSelectProps> = memo(({
  value,
  onChange,
  customers,
  onAddNewCustomer,
  onQuickSearch,
  placeholder = "اسم العميل",
  style
}) => {
  // Memoize customer options to avoid re-rendering
  const customerOptions = useMemo(() => {
    return customers.map(customer => ({
      label: customer.nameAr || customer.name || customer.id,
      value: customer.nameAr || customer.name || customer.id,
      customer
    }));
  }, [customers]);

  return (
    <Space.Compact style={{ display: 'flex', width: '100%' }}>
      <Select
        showSearch
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={{ 
          fontFamily: 'Cairo, sans-serif', 
          fontWeight: 500, 
          fontSize: 16, 
          flex: 1,
          ...style 
        }}
        filterOption={(input, option) =>
          String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        allowClear
        virtual={true} // Enable virtualization
        options={customerOptions}
      />
      <Button
        type="default"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        }
        style={{ 
          minWidth: 40,
          borderLeft: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0
        }}
        onClick={onAddNewCustomer}
        title="إضافة سريعة"
      />
      <Button
        type="default"
        icon={<SearchOutlined />}
        style={{ 
          minWidth: 40,
          borderLeft: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0
        }}
        onClick={onQuickSearch}
        title="البحث عن عميل"
      />
    </Space.Compact>
  );
});

CustomerSelect.displayName = 'CustomerSelect';

export default CustomerSelect;
