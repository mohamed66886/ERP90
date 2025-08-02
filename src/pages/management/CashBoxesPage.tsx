/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect } from 'react';
// @ts-expect-error - Antd types issue
import { Card, Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { fetchBranches, Branch } from '../../utils/branches';
import {
  fetchCashBoxes,
  addCashBoxWithSubAccount,
  deleteCashBoxWithSubAccount,
  updateCashBox,
} from '../../services/cashBoxesService';
import { getMainAccounts, Account } from '../../services/accountsService';


interface CashBox {
  id?: string;
  nameAr: string;
  nameEn: string;
  branch?: string;
  mainAccount?: string;
  subAccountId?: string;
  subAccountCode?: string;
}





const CashBoxesPage: React.FC = () => {
  const [cashBoxes, setCashBoxes] = useState<CashBox[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mainAccounts, setMainAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  useEffect(() => {
    fetchBranches().then(setBranches);
    getMainAccounts().then(setMainAccounts);
    loadCashBoxes();
  }, []);

  const loadCashBoxes = async () => {
    setLoading(true);
    const data = await fetchCashBoxes();
    setCashBoxes(data);
    setLoading(false);
  };

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await addCashBoxWithSubAccount({
        nameAr: values.nameAr,
        nameEn: values.nameEn,
        branch: values.branch,
        mainAccount: values.mainAccount,
      });
      setIsModalOpen(false);
      form.resetFields();
      loadCashBoxes();
      message.success('تمت إضافة الصندوق والحساب الفرعي بنجاح');
    } catch (err) {
      console.error('Error adding cash box:', err);
      message.error('حدث خطأ أثناء إضافة الصندوق');
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleExport = () => {
    message.info('تصدير البيانات');
  };

  const handleEdit = (id: string) => {
    message.info('تعديل الصندوق: ' + id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCashBoxWithSubAccount(id);
      loadCashBoxes();
      message.success('تم حذف الصندوق والحساب الفرعي بنجاح');
    } catch (error) {
      console.error('Error deleting cash box:', error);
      message.error('حدث خطأ أثناء حذف الصندوق');
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (_: unknown, __: unknown, idx: number) => idx + 1,
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'اسم الصندوق (عربي)',
      dataIndex: 'nameAr',
      key: 'nameAr',
    },
    {
      title: 'اسم الصندوق (إنجليزي)',
      dataIndex: 'nameEn',
      key: 'nameEn',
    },
    {
      title: 'الفرع',
      dataIndex: 'branch',
      key: 'branch',
      render: (branchId: string) => branches.find(b => b.id === branchId)?.name || '',
    },
    {
      title: 'الحساب الرئيسي',
      dataIndex: 'mainAccount',
      key: 'mainAccount',
      render: (accId: string) => mainAccounts.find(a => a.id === accId)?.nameAr || '',
    },
    {
      title: 'الحساب الفرعي',
      dataIndex: 'subAccountCode',
      key: 'subAccountCode',
      render: (code: string) => code || 'لم يتم إنشاء حساب فرعي',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      align: 'center' as const,
      render: (_: unknown, record: CashBox) => (
        <>
          <Button icon={<EditOutlined style={{ color: '#1677ff' }} />} type="link" onClick={() => handleEdit(record.id!)} />
          <Button icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} type="link" onClick={() => handleDelete(record.id!)} />
        </>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', padding: 24, minHeight: '100vh', direction: 'rtl' }}>
      <Modal
        title="إضافة صندوق جديد"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="إضافة"
        cancelText="إلغاء"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ nameAr: '', nameEn: '', branch: '', mainAccount: '' }}
        >
          <Form.Item
            label="اسم الصندوق (عربي)"
            name="nameAr"
            rules={[{ required: true, message: 'يرجى إدخال اسم الصندوق بالعربي' }]}
          >
            <Input placeholder="اسم الصندوق بالعربي" />
          </Form.Item>
          <Form.Item
            label="اسم الصندوق (إنجليزي)"
            name="nameEn"
            rules={[{ required: true, message: 'يرجى إدخال اسم الصندوق بالإنجليزي' }]}
          >
            <Input placeholder="اسم الصندوق بالإنجليزي" />
          </Form.Item>
          <Form.Item
            label="الفرع"
            name="branch"
            rules={[{ required: true, message: 'يرجى اختيار الفرع' }]}
          >
            <Select placeholder="اختر الفرع" options={branches.map(branch => ({
              label: branch.name,
              value: branch.id
            }))} />
          </Form.Item>
          <Form.Item
            label="الحساب الرئيسي"
            name="mainAccount"
            rules={[{ required: true, message: 'يرجى اختيار الحساب الرئيسي' }]}
          >
            <Select placeholder="اختر الحساب الرئيسي">
              {mainAccounts.map(account => (
                <Select.Option key={account.id} value={account.id}>{account.nameAr} - {account.code}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', color: '#222' }}>الصناديق النقدية</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            إضافة صندوق
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            تصدير
          </Button>
        </div>
      </div>
      <Card>
        <Table
          dataSource={cashBoxes}
          columns={columns}
          rowKey={record => record.id!}
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'لا توجد صناديق' }}
        />
      </Card>
    </div>
  );
};

export default CashBoxesPage;