import React, { memo } from 'react';
import { Select, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface InventoryItem {
  id: string;
  name: string;
  itemCode?: string;
  salePrice?: number;
  discount?: number;
  tempCodes?: boolean;
}

interface ItemSelectProps {
  value: string;
  onChange: (value: string) => void;
  items: InventoryItem[];
  itemStocks: {[key: string]: number};
  warehouseMode: 'single' | 'multiple';
  currentWarehouse?: string;
  loadingStocks: boolean;
  onAddNewItem: () => void;
  onQuickSearch: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const ItemSelect: React.FC<ItemSelectProps> = memo(({
  value,
  onChange,
  items,
  itemStocks,
  warehouseMode,
  currentWarehouse,
  loadingStocks,
  onAddNewItem,
  onQuickSearch,
  placeholder = "اسم الصنف",
  style
}) => {
  return (
    <Space.Compact style={{ display: 'flex', width: '100%' }}>
      <Select
        showSearch
        value={value}
        placeholder={placeholder}
        style={{ flex: 1, fontFamily: 'Cairo, sans-serif', ...style }}
        optionLabelProp="label"
        onChange={onChange}
        filterOption={(input, option) => {
          const itemName = String(option?.value ?? '').toLowerCase();
          const selectedItem = items.find(i => i.name === option?.value);
          const itemCode = String(selectedItem?.itemCode ?? '').toLowerCase();
          const searchTerm = input.toLowerCase();
          return itemName.includes(searchTerm) || itemCode.includes(searchTerm);
        }}
        allowClear
        virtual={true} // Enable virtualization for large lists
      >
        {items.map((item, index) => {
          const stockKey = warehouseMode === 'single' ? item.name : `${item.name}-${currentWarehouse}`;
          const stock = currentWarehouse ? itemStocks[stockKey] : undefined;
          
          return (
            <Select.Option 
              key={item.id || `${item.name}-${index}`} 
              value={item.name}
              label={item.name}
              disabled={!!item.tempCodes}
              style={{
                color: item.tempCodes ? '#ff4d4f' : 'inherit',
                backgroundColor: item.tempCodes ? '#fff2f0' : 'inherit'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600 }}>
                    {item.name}
                    {item.tempCodes && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginLeft: 2 }}>
                          <circle cx="12" cy="12" r="10" stroke="#ff4d4f" strokeWidth="2" fill="#fff2f0" />
                          <path d="M8 12h8" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        (إيقاف مؤقت)
                      </span>
                    )}
                  </span>
                  {item.itemCode && (
                    <span style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                      كود: {item.itemCode}
                    </span>
                  )}
                </div>
                {currentWarehouse && (
                  <span 
                    style={{ 
                      color: stock !== undefined ? 
                        (stock > 0 ? '#52c41a' : stock === 0 ? '#faad14' : '#ff4d4f') : 
                        '#1890ff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '8px'
                    }}
                  >
                    {stock !== undefined ? 
                      (stock > 0 ? `متوفر: ${stock}` : stock === 0 ? 'غير متوفر' : `سالب: ${Math.abs(stock)}`) :
                      (loadingStocks ? 'جاري التحميل...' : 'اختر المخزن')
                    }
                  </span>
                )}
              </div>
            </Select.Option>
          );
        })}
      </Select>
      <Button
        type="default"
        size="middle"
        style={{ 
          borderLeft: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          backgroundColor: '#ffffff',
          borderColor: '#d1d5db',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 40
        }}
        onClick={onAddNewItem}
        title="إضافة صنف جديد"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4v6h6V4H4zm10 0v6h6V4h-6zM4 14v6h6v-6H4zm10 0v6h6v-6h-6z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </Button>
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
        title="البحث السريع عن صنف"
      />
    </Space.Compact>
  );
});

ItemSelect.displayName = 'ItemSelect';

export default ItemSelect;
