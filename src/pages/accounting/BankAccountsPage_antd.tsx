import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  Card,
  Modal,
  Select,
  Table,
  Tag,
  Alert,
  Form,
  message,
  Space,
  Typography,
  Row,
  Col,
  Spin,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  DownloadOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  BankOutlined 
} from '@ant-design/icons';
import {
  fetchBankAccounts,
  addBankAccount,
  addBankAccountWithSubAccount,
  updateBankAccount,
  deleteBankAccount,
  deleteBankAccountWithSubAccount,
  BankAccount as FirebaseBankAccount
} from '@/services/bankAccountsService';
import { fetchBranches, Branch } from '../../utils/branches';
import Breadcrumb from '@/components/Breadcrumb';
import { getMainAccounts, getAccountsByLevel, getAccountLevels, Account } from '../../services/accountsService';

const { Title, Text } = Typography;
const { Option } = Select;

type BankAccount = FirebaseBankAccount;

interface BankAccountsPageProps {
  onBack?: () => void;
}

const BankAccountsPage: React.FC<BankAccountsPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [form] = Form.useForm();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [mainAccounts, setMainAccounts] = useState<Account[]>([]);
  const [accountLevels, setAccountLevels] = useState<number[]>([]);
  const [accountsByLevel, setAccountsByLevel] = useState<Account[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const accounts = await fetchBankAccounts();
      setBankAccounts(accounts);
    } catch (error) {
      message.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    fetchBranches().then(setBranches);
    getMainAccounts().then(setMainAccounts);
    getAccountLevels().then(setAccountLevels);
  }, []);

  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setSelectedLevel(null);
    setAccountsByLevel([]);
    setIsModalOpen(true);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    form.setFieldsValue({
      arabicName: account.arabicName,
      englishName: account.englishName,
      branch: account.branch || '',
      mainAccount: account.mainAccount || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBankAccountWithSubAccount(id);
      message.success('تم حذف البنك والحساب الفرعي بنجاح');
      loadAccounts();
    } catch (error) {
      message.error('حدث خطأ أثناء حذف البنك');
    }
  };

  const handleLevelChange = async (level: string) => {
    setSelectedLevel(level);
    const accounts = await getAccountsByLevel(parseInt(level));
    setAccountsByLevel(accounts);
    // Clear the selected account when level changes
    form.setFieldsValue({ mainAccount: undefined });
  };

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      if (editingAccount && editingAccount.id) {
        await updateBankAccount(editingAccount.id, values);
        message.success('تم تحديث البنك بنجاح');
      } else {
        await addBankAccountWithSubAccount({
          arabicName: values.arabicName,
          englishName: values.englishName,
          branch: values.branch,
          mainAccount: values.mainAccount
        });
        message.success('تم إضافة البنك والحساب الفرعي بنجاح');
      }
      setIsModalOpen(false);
      form.resetFields();
      setSelectedLevel(null);
      setAccountsByLevel([]);
      loadAccounts();
    } catch (error) {
      message.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['الترقيم', 'اسم البنك', 'الاسم الأجنبي'].join(','),
      ...bankAccounts.map((account, idx) =>
        [idx + 1, account.arabicName, account.englishName].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bank_accounts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('تم تصدير البيانات بنجاح');
  };

  const columns = [
    {
      title: 'الترقيم',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <Tag color="blue">{index + 1}</Tag>
      ),
    },
    {
      title: 'اسم البنك',
      dataIndex: 'arabicName',
      key: 'arabicName',
      align: 'right' as const,
    },
    {
      title: 'الاسم الأجنبي',
      dataIndex: 'englishName',
      key: 'englishName',
      align: 'left' as const,
    },
    {
      title: 'الفرع',
      dataIndex: 'branch',
      key: 'branch',
      align: 'right' as const,
      render: (branchId: string) => {
        const branch = branches.find(b => b.id === branchId);
        return branch ? branch.name : 'غير محدد';
      },
    },
    {
      title: 'الحساب الفرعي',
      dataIndex: 'subAccountCode',
      key: 'subAccountCode',
      align: 'right' as const,
      render: (code: string) => code || 'لم يتم إنشاء حساب فرعي',
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: BankAccount) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="هل أنت متأكد من حذف هذا البنك؟"
            onConfirm={() => handleDelete(record.id!)}
            okText="نعم"
            cancelText="لا"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full p-6 space-y-6 min-h-screen bg-gray-50" dir="rtl">
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <BankOutlined className="text-2xl text-blue-600 ml-3" />
          <Title level={2} className="mb-0 text-2xl  text-gray-800">ادارة الحسابات البنكية</Title>
        </div>
        <Text type="secondary" className="mt-2">إدارة الحسابات البنكية</Text>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه", to: "/management/financial" }, 
          { label: "البنوك" },
        ]}
      />

      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0 text-gray-800">الحسابات البنكية</Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              جديد
            </Button>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              تصدير
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={bankAccounts}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: 'لا توجد بيانات'
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} من ${total} عنصر`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title={editingAccount ? 'تحديث بنك' : 'إضافة بنك جديد'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setSelectedLevel(null);
          setAccountsByLevel([]);
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="اسم البنك"
            name="arabicName"
            rules={[
              { required: true, message: 'يرجى إدخال اسم البنك' },
              { min: 2, message: 'اسم البنك يجب أن يكون أكثر من حرفين' },
              {
                validator: async (_, value) => {
                  if (value) {
                    const exists = bankAccounts.some(
                      (acc) =>
                        acc.arabicName.trim() === value.trim() &&
                        (!editingAccount || acc.id !== editingAccount.id)
                    );
                    if (exists) {
                      return Promise.reject(new Error('اسم البنك موجود بالفعل'));
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="أدخل اسم البنك بالعربية" />
          </Form.Item>

          <Form.Item
            label="الاسم الأجنبي"
            name="englishName"
            rules={[
              { required: true, message: 'يرجى إدخال الاسم الأجنبي للبنك' },
              { min: 2, message: 'الاسم الأجنبي يجب أن يكون أكثر من حرفين' },
              {
                validator: async (_, value) => {
                  if (value) {
                    const exists = bankAccounts.some(
                      (acc) =>
                        acc.englishName.trim().toLowerCase() === value.trim().toLowerCase() &&
                        (!editingAccount || acc.id !== editingAccount.id)
                    );
                    if (exists) {
                      return Promise.reject(new Error('الاسم الأجنبي موجود بالفعل'));
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Enter bank name in English" />
          </Form.Item>

          <Form.Item
            label="الفرع"
            name="branch"
            rules={[{ required: true, message: 'يرجى اختيار الفرع' }]}
          >
            <Select placeholder="اختر الفرع">
              {branches.map(branch => (
                <Option key={branch.id} value={branch.id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="مستوى الحساب"
            name="accountLevel"
          >
            <Select
              placeholder="اختر مستوى الحساب"
              onChange={handleLevelChange}
              value={selectedLevel}
            >
              {accountLevels.map(level => (
                <Option key={level} value={level.toString()}>
                  المستوى {level}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="الحساب الأب"
            name="mainAccount"
            rules={[{ required: true, message: 'يرجى اختيار الحساب الأب' }]}
          >
            <Select
              placeholder="اختر الحساب الأب"
              disabled={!selectedLevel}
            >
              {accountsByLevel.map(account => (
                <Option key={account.id} value={account.id}>
                  {account.nameAr} - {account.code}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => setIsModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                حفظ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BankAccountsPage;
