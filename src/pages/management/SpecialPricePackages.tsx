import React, { useState, useEffect, useRef, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { getDocs, query, collection } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker, Input, Select, Button, Table, Pagination } from "antd";
import { SearchOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import arEG from 'antd/es/date-picker/locale/ar_EG';
import { fetchBranches, Branch } from "@/lib/branches";
import Breadcrumb from "@/components/Breadcrumb";
import { useFinancialYear } from "@/hooks/useFinancialYear";
import dayjs from 'dayjs';





const labelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  marginBottom: '6px',
  color: '#444',
  fontSize: '1rem',
  textAlign: 'right'
};

const SpecialPricePackages: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ company: '', branch: '', name: '', packageNumber: '' });
  // Date state
  const [dateFrom, setDateFrom] = useState<dayjs.Dayjs | null>(null);
  // Company state
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // جلب الشركة الحقيقية عند تحميل الصفحة
  useEffect(() => {
    setCompaniesLoading(true);
    import("@/lib/firebase").then(({ db }) => {
      import("firebase/firestore").then(({ getDocs, query, collection }) => {
        const q = query(collection(db, "companies"));
        getDocs(q)
          .then((snapshot) => {
            if (!snapshot.empty) {
              const docData = snapshot.docs[0];
              setCompanies([{ id: docData.id, name: docData.data().arabicName || docData.data().englishName || "" }]);
            } else {
              setCompanies([]);
            }
          })
          .catch(() => {
            setCompanies([]);
          })
          .finally(() => {
            setCompaniesLoading(false);
          });
      });
    });
  }, []);
  // Branch state
  const [branchId, setBranchId] = useState<string | undefined>(undefined);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  // جلب الفروع الحقيقية عند تحميل الصفحة
  useEffect(() => {
    setBranchesLoading(true);
    fetchBranches()
      .then((data) => {
        setBranches(data.map(branch => ({ id: branch.id || '', name: branch.name })));
      })
      .catch(() => {
        setBranches([]);
      })
      .finally(() => {
        setBranchesLoading(false);
      });
  }, []);
  // Style for large controls (مطابق لصفحة الإضافة)
  const largeControlStyle: React.CSSProperties = {
    height: 48,
    fontSize: 18,
    borderRadius: 8,
    padding: "8px 16px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
    background: "#fff",
    border: "1.5px solid #d9d9d9",
    transition: "border-color 0.3s",
  };
  const labelStyle: React.CSSProperties = { fontSize: 18, fontWeight: 500 };
  // Disabled date function for DatePicker
  const disabledDate = (current: dayjs.Dayjs) => {
    // Example: disable future dates
    return current && current > dayjs();
  };
  const [results, setResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // جلب باقات الأسعار من فايربيز مع تحويل الأكواد إلى أسماء
  useEffect(() => {
    (async () => {
      try {
        const { db } = await import("@/lib/firebase");
        const { getDocs, collection } = await import("firebase/firestore");
        // جلب الشركات والفروع أولاً
        const [companiesSnap, branchesSnap, packagesSnap] = await Promise.all([
          getDocs(collection(db, "companies")),
          getDocs(collection(db, "branches")),
          getDocs(collection(db, "specialPricePackages"))
        ]);
        const companiesMap = {};
        companiesSnap.docs.forEach(doc => {
          const data = doc.data();
          companiesMap[doc.id] = data.arabicName || data.englishName || doc.id;
        });
        const branchesMap = {};
        branchesSnap.docs.forEach(doc => {
          const data = doc.data();
          branchesMap[doc.id] = data.name || doc.id;
        });
        const packages = packagesSnap.docs.map(doc => {
          const data = doc.data();
          // تحويل أكواد الفروع إلى أسماء
          let branchNames = "";
          if (Array.isArray(data.branches)) {
            branchNames = data.branches.map((bid: string) => branchesMap[bid] || bid).join(", ");
          }
          // تحويل كود الشركة إلى اسم
          const companyName = companiesMap[data.company] || data.company || "";
          return {
            id: data.packageCode || doc.id,
            name: data.packageNameAr || "",
            nameEn: data.packageNameEn || "",
            endDate: data.endDate || "",
            branch: branchNames,
            company: companyName
          };
        });
        setResults(packages);
      } catch (e) {
        setResults([]);
      }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  function getTotalPages() {
    // Replace with real logic if needed
    return 1;
  }

  const handleSearch = () => {
    // بحث فعلي في النتائج المحملة من فايربيز
    setResults(prev => prev.filter(pkg => {
      // فلترة الشركة
      const companyMatch = !search.company || (pkg.company && pkg.company.includes(search.company));
      // فلترة الفرع
      const branchMatch = !search.branch || (pkg.branch && pkg.branch.includes(search.branch));
      // فلترة اسم الباقة بالعربي
      const nameMatch = !search.name || (pkg.name && pkg.name.includes(search.name));
      // فلترة اسم الباقة بالإنجليزي
      const nameEnMatch = !search.name || (pkg.nameEn && pkg.nameEn.includes(search.name));
      // فلترة رقم الباقة
      const codeMatch = !search.packageNumber || (pkg.id && pkg.id.includes(search.packageNumber));
      // فلترة تاريخ الانتهاء
      const dateMatch = !dateFrom || (pkg.endDate && pkg.endDate.includes(dateFrom.format('YYYY-MM-DD')));
      return companyMatch && branchMatch && nameMatch && nameEnMatch && codeMatch && dateMatch;
    }));
  };

    function getFilteredRows() {
        // TODO: Replace with real filtering logic based on your data
        // For now, return an empty array or mock data structure similar to your table rows
        return [];
    }

  return (
    <div>
      <div className="w-full min-h-screen p-4 md:p-6 flex flex-col gap-6 bg-gray-50" dir="rtl">
 
        {/* العنوان الرئيسي */}
        <div className="p-3 sm:p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
          <div className="flex items-center">
            <FileTextOutlined className="h-5 w-5 sm:h-8 sm:w-8 text-emerald-600 ml-1 sm:ml-3" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">باقات الأسعار</h1>
          </div>
          <p className="text-xs sm:text-base text-gray-600 mt-2">إدارة وعرض باقات الأسعار الخاصة</p>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        </div>
          <Breadcrumb
                items={[
                  { label: "الرئيسية", to: "/" },
                  { label: "إدارة المبيعات", to: "/management/sales" },
                  { label: "باقات أسعار خاصة" }
                ]}
              />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white p-2 sm:p-4 rounded-lg border border-emerald-100 flex flex-col gap-4 shadow-sm relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
        {/* عنوان خيارات البحث وزر الإضافة بجانب بعض */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-0">
            <SearchOutlined className="text-emerald-600" /> خيارات البحث
          </h3>
          <Button
            type="primary"
            className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
            size="large"
            style={{ marginRight: '8px' }}
            onClick={() => { navigate('/management/sales/add-special-price-package'); }}
          >
            إضافة
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>التاريخ</label>
            <DatePicker 
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="اختر التاريخ"
              style={largeControlStyle}
              size="large"
              format="YYYY-MM-DD"
              locale={arEG}
              disabledDate={disabledDate}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>الشركة</label>
            <Select
              value={companyId}
              onChange={setCompanyId}
              placeholder="اختر الشركة"
              style={largeControlStyle}
              size="large"
              optionFilterProp="label"
              allowClear
              showSearch
            >
              {companies.map(company => (
                <Select.Option key={company.id} value={company.id} label={company.name}>
                  {company.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>الفرع</label>
            <Select
              value={branchId}
              onChange={setBranchId}
              placeholder="اختر الفرع"
              style={largeControlStyle}
              size="large"
              optionFilterProp="label"
              allowClear
              showSearch
              loading={branchesLoading}
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase())
              }
            >
              {branches.map(branch => (
                <Select.Option key={branch.id} value={branch.id} label={branch.name}>
                  {branch.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>رقم الباقة</label>
            <Input
              name="packageNumber"
              placeholder="رقم الباقة"
              value={search.packageNumber}
              onChange={handleChange}
              style={largeControlStyle}
              size="large"
              className="text-right"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            size="large"
          >
            بحث 
          </Button>
          <span className="text-gray-500 text-sm">
            نتائج البحث: {
              Object.keys(
                getFilteredRows().reduce((acc, inv) => {
                  const key = inv.invoiceNumber + '-' + inv.invoiceType;
                  acc[key] = true;
                  return acc;
                }, {})
              ).length
            } - عرض الصفحة {currentPage} من {getTotalPages()}
          </span>
        </div>
      </motion.div>
      {/* نتائج البحث */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="w-full bg-white p-2 sm:p-4 rounded-lg border border-emerald-100 flex flex-col gap-4 shadow-sm overflow-x-auto relative"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-500"></div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            نتائج البحث ({results.length} باقة)
          </h3>
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => {}}
              disabled={results.length === 0}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
              size="large"
            >
              تصدير إكسل
            </Button>
            <Button
              type="primary"
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
              size="large"
              onClick={() => {}}
            >
              طباعة
            </Button>
          </div>
        </div>
        <Table
          style={{ direction: 'rtl' }}
          columns={[ 
            {
              title: 'رقم الباقة',
              dataIndex: 'id',
              key: 'id',
              minWidth: 130,
            },
            {
              title: 'اسم الباقة (عربي)',
              dataIndex: 'name',
              key: 'name',
              minWidth: 150,
            },
            {
              title: 'اسم الباقة (إنجليزي)',
              dataIndex: 'nameEn',
              key: 'nameEn',
              minWidth: 150,
            },
            {
              title: 'تاريخ الانتهاء',
              dataIndex: 'endDate',
              key: 'endDate',
              minWidth: 120,
              render: (date: string) => date ? <span>{date}</span> : <span style={{color:'#aaa'}}>—</span>
            },
            {
              title: 'الفرع',
              dataIndex: 'branch',
              key: 'branch',
              minWidth: 120,
            },
            {
              title: 'الشركة',
              dataIndex: 'company',
              key: 'company',
              minWidth: 120,
            },
            {
              title: 'الإجراءات',
              key: 'actions',
              minWidth: 120,
              render: (_: unknown, record: any) => (
                <div className="flex gap-2">
                  <Button size="small" type="default">تعديل</Button>
                  <Button size="small" type="primary" danger>حذف</Button>
                </div>
              ),
            },
          ]}
          dataSource={results}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
          size="small"
          bordered
          className="[&_.ant-table-thead_>_tr_>_th]:bg-gray-400 [&_.ant-table-thead_>_tr_>_th]:text-white [&_.ant-table-thead_>_tr_>_th]:border-gray-400 [&_.ant-table-tbody_>_tr:hover_>_td]:bg-emerald-50"
          locale={{
            emptyText: (
              <div className="text-gray-400 py-8">لا توجد بيانات</div>
            )
          }}
        />
        {/* Pagination */}
        {results.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              total={results.length}
              pageSize={10}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => `${range[0]}-${range[1]} من ${total} نتيجة`}
              className="bg-white [&_.ant-pagination-item-active]:border-emerald-600"
            />
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
};

export default SpecialPricePackages;
