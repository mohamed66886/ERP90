import React, { memo } from 'react';
import { Card, Col, Row, Divider } from 'antd';

interface Totals {
  total: number;
  afterDiscount: number;
  tax: number;
  afterTax: number;
}

interface MultiplePayment {
  cash?: { amount: string };
  bank?: { amount: string };
  card?: { amount: string };
}

interface StatusDisplayProps {
  branch: string;
  customerName: string;
  warehouse: string;
  warehouseMode: 'single' | 'multiple';
  itemsCount: number;
  paymentMethod: string;
  multiplePaymentMode: boolean;
  multiplePayment: MultiplePayment;
  totals: Totals;
}

interface TotalsDisplayProps {
  totals: Totals;
}

// Status component
export const StatusDisplay: React.FC<StatusDisplayProps> = memo(({
  branch,
  customerName,
  warehouse,
  warehouseMode,
  itemsCount,
  paymentMethod,
  multiplePaymentMode,
  multiplePayment,
  totals
}) => {
  const getStatusContent = () => {
    if (!branch) {
      return (
        <span style={{ color: '#dc3545', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.5L19.53 19H4.47L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
          </svg>
          يرجى اختيار الفرع أولاً
        </span>
      );
    }

    if (!customerName) {
      return (
        <span style={{ color: '#fd7e14', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.5L19.53 19H4.47L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
          </svg>
          يرجى اختيار العميل
        </span>
      );
    }

    if (warehouseMode !== 'multiple' && !warehouse) {
      return (
        <span style={{ color: '#fd7e14', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.5L19.53 19H4.47L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
          </svg>
          يرجى اختيار المخزن
        </span>
      );
    }

    if (itemsCount === 0) {
      return (
        <span style={{ color: '#198754', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          يمكنك الآن إضافة الأصناف
        </span>
      );
    }

    if (itemsCount > 0 && !paymentMethod) {
      return (
        <span style={{ color: '#0d6efd', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.95 5.16-1.21 9-5.4 9-10.95V7L12 2z"/>
            <path d="M10 14l-3-3 1.41-1.41L10 11.17l5.59-5.58L17 7l-7 7z" fill="white"/>
          </svg>
          تم إضافة {itemsCount} صنف | الإجمالي: {totals.afterTax.toFixed(2)} ر.س - يرجى اختيار طريقة الدفع
        </span>
      );
    }

    if (multiplePaymentMode) {
      const paidAmount = (
        parseFloat(multiplePayment.cash?.amount || '0') +
        parseFloat(multiplePayment.bank?.amount || '0') +
        parseFloat(multiplePayment.card?.amount || '0')
      );
      const remaining = totals.afterTax - paidAmount;
      const isValid = Math.abs(remaining) <= 0.01;

      return (
        <span style={{ 
          color: isValid ? '#059669' : '#dc2626', 
          fontWeight: 500, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6 
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            {isValid ? (
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            ) : (
              <path d="M12 2L1 21h22L12 2zm0 3.5L19.53 19H4.47L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            )}
          </svg>
          المتبقي: {remaining.toFixed(2)} ر.س
          {!isValid && ' - يجب أن يكون 0.00 للحفظ'}
        </span>
      );
    }

    return (
      <span style={{ color: '#198754', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
        تم اختيار طريقة الدفع - الفاتورة جاهزة للحفظ
      </span>
    );
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Card 
        size="small" 
        style={{ 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid #dee2e6',
          borderRadius: 8
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          padding: '8px 0'
        }}>
          <div style={{
            backgroundColor: '#0ea5e9',
            borderRadius: '50%',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 600, 
              color: '#495057',
              marginBottom: 4,
              fontFamily: 'Cairo, sans-serif'
            }}>
              حالة الفاتورة الحالية
            </div>
            <div style={{ 
              fontSize: 13, 
              color: '#6c757d',
              fontFamily: 'Cairo, sans-serif',
              lineHeight: 1.4
            }}>
              {getStatusContent()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

// Totals component
export const TotalsDisplay: React.FC<TotalsDisplayProps> = memo(({ totals }) => {
  return (
    <Row gutter={16} justify="end" className="mb-4">
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <div className="flex justify-between">
            <span style={{ color: '#2563eb', fontWeight: 600 }}>الإجمالي:</span>
            <span className="font-bold" style={{ color: '#2563eb' }}>
              {totals.total.toFixed(2)} ر.س
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: '#dc2626', fontWeight: 600 }}>الخصم:</span>
            <span className="font-bold" style={{ color: '#dc2626' }}>
              {(totals.total - totals.afterDiscount).toFixed(2)} ر.س
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: '#ea580c', fontWeight: 600 }}>الإجمالي بعد الخصم:</span>
            <span className="font-bold" style={{ color: '#ea580c' }}>
              {totals.afterDiscount.toFixed(2)} ر.س
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: '#9333ea', fontWeight: 600 }}>قيمة الضريبة:</span>
            <span className="font-bold" style={{ color: '#9333ea' }}>
              {totals.tax.toFixed(2)} ر.س
            </span>
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between">
            <span style={{ color: '#059669', fontWeight: 700 }}>الإجمالي النهائي:</span>
            <span className="font-bold text-lg" style={{ color: '#059669' }}>
              {totals.afterTax.toFixed(2)} ر.س
            </span>
          </div>
        </Card>
      </Col>
    </Row>
  );
});

StatusDisplay.displayName = 'StatusDisplay';
TotalsDisplay.displayName = 'TotalsDisplay';

// Default export for lazy loading
const InvoiceComponents = {
  StatusDisplay,
  TotalsDisplay
};

export default InvoiceComponents;
