/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect } from 'react';
// @ts-expect-error - Antd types issue
import { Card, Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { GiStrongbox } from 'react-icons/gi';

import { fetchBranches, Branch } from '../../utils/branches';
import {
  fetchCashBoxes,
  addCashBoxWithSubAccount,
  deleteCashBoxWithSubAccount,
  updateCashBox,
} from '../../services/cashBoxesService';
import { getMainAccounts, getAccountsByLevel, getAccountLevels, Account } from '../../services/accountsService';
import Breadcrumb from '@/components/Breadcrumb';

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
  const [accountLevels, setAccountLevels] = useState<number[]>([]);
  const [accountsByLevel, setAccountsByLevel] = useState<Account[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  
  useEffect(() => {
    fetchBranches().then(setBranches);
    getMainAccounts().then(setMainAccounts);
    getAccountLevels().then(setAccountLevels);
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
    setSelectedLevel(null);
    setAccountsByLevel([]);
    setIsModalOpen(true);
  };

  const handleLevelChange = async (level: number) => {
    setSelectedLevel(level);
    const accounts = await getAccountsByLevel(level);
    setAccountsByLevel(accounts);
    // Clear the selected account when level changes
    form.setFieldsValue({ parentAccount: undefined });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await addCashBoxWithSubAccount({
        nameAr: values.nameAr,
        nameEn: values.nameEn,
        branch: values.branch,
        mainAccount: values.parentAccount, // استخدام الحساب الأب المختار
      });
      setIsModalOpen(false);
      form.resetFields();
      setSelectedLevel(null);
      setAccountsByLevel([]);
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
    <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <GiStrongbox className="h-8 w-8 text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">إدارة الصناديق النقدية</h1>
        </div>
        <p className="text-gray-600 mt-2">إضافة وتعديل وحذف الصناديق النقدية وربطها بالحسابات المالية</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>    
                               <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه", to: "/management/financial" }, 
          { label: "الصناديق النقدية" },
        ]}
      />

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
          initialValues={{ nameAr: '', nameEn: '', branch: '', accountLevel: '', parentAccount: '' }}
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
            label="مستوى الحساب"
            name="accountLevel"
            rules={[{ required: true, message: 'يرجى اختيار مستوى الحساب' }]}
          >
            <Select placeholder="اختر مستوى الحساب" onChange={handleLevelChange}>
              {accountLevels.map(level => (
                <Select.Option key={level} value={level}>المستوى {level}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="الحساب الأب"
            name="parentAccount"
            rules={[{ required: true, message: 'يرجى اختيار الحساب الأب' }]}
          >
            <Select placeholder="اختر الحساب الأب" disabled={!selectedLevel}>
              {accountsByLevel.map(account => (
                <Select.Option key={account.id} value={account.id}>{account.nameAr} - {account.code}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <div className=" bg-white p-6 rounded-lg shadow-md mb-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24,  color: '#222' }}>الصناديق النقدية</h2>
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
    </div>
  );
};

export default CashBoxesPage;