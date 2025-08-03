import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFinancialYears, deleteFinancialYear, updateFinancialYear } from '@/services/financialYearsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddFinancialYearModal from "@/components/AddFinancialYearModal";
import { 
  Calendar, 
  Plus, 
  FileDown, 
  Edit, 
  Trash2, 
  ArrowLeft,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Breadcrumb from '@/components/Breadcrumb';
import type { FinancialYear } from '@/services/financialYearsService';

interface FinancialYearsPageProps {
  onBack?: () => void;
}

const FinancialYearsPage: React.FC<FinancialYearsPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  useEffect(() => {
    getFinancialYears().then((years) => {
      // sort by year desc
      setFinancialYears(years.sort((a, b) => b.year - a.year));
    });
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editYear, setEditYear] = useState<FinancialYear | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, yearId: string, yearName: string}>({
    isOpen: false,
    yearId: '',
    yearName: ''
  });

  const handleAddYear = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveYear = async (yearData: {
    year: number;
    startDate: string;
    endDate: string;
    status: string;
  }) => {
    if (editYear) {
      // تعديل
      await updateFinancialYear(editYear.id, yearData);
      const updated = await getFinancialYears();
      setFinancialYears(updated.sort((a, b) => b.year - a.year));
      setEditYear(null);
      setIsAddModalOpen(false);
    } else {
      // إضافة
      // سيتم إضافة السنة من خلال AddFinancialYearModal مباشرة
      const updated = await getFinancialYears();
      setFinancialYears(updated.sort((a, b) => b.year - a.year));
      setIsAddModalOpen(false);
    }
  };

  const handleExport = () => {
    const csvData = financialYears.map(year => ({
      'السنة الميلادية': year.year,
      'بداية السنة': formatDate(year.startDate),
      'نهاية السنة': formatDate(year.endDate),
      'الحالة': year.status,
      'تاريخ الإنشاء': formatDate(year.createdAt)
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `السنوات_المالية_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (year: FinancialYear) => {
    setEditYear(year);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const year = financialYears.find(y => y.id === id);
    if (year) {
      setDeleteConfirm({
        isOpen: true,
        yearId: id,
        yearName: `${year.year}`
      });
    }
  };

  const confirmDelete = async () => {
    await deleteFinancialYear(deleteConfirm.yearId);
    const updated = await getFinancialYears();
    setFinancialYears(updated.sort((a, b) => b.year - a.year));
    setDeleteConfirm({isOpen: false, yearId: '', yearName: ''});
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'نشطة': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', text: 'نشطة' },
      'مغلقة': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'مغلقة' },
      'معلقة': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', text: 'معلقة' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={`${config.color} hover:${config.color} rounded-md`}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* Header */}
 
            <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
              <div className="flex items-center">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                <h1 className="text-2xl font-bold text-gray-800">  السنوات المالية</h1>
              </div>
              <p className="text-gray-600 mt-2">إدارة السنوات المالية للشركة</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            </div>
      {/* Actions Bar removed, buttons moved to table card header */}
      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه", to: "/management/financial" }, 
          { label: "السنوات المالية" }
        ]}
      />
      {/* Financial Years Table */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">قائمة السنوات المالية</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                عرض وتعديل السنوات المالية المسجلة في النظام
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse mt-2 sm:mt-0">
              <Button 
                onClick={handleAddYear}
                className="flex items-center space-x-2 space-x-reverse bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة سنة مالية</span>
              </Button>
              <Button 
                onClick={handleExport}
                className="flex items-center space-x-2 space-x-reverse bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
              >
                <FileDown className="h-4 w-4" />
                <span>تصدير</span>
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            إجمالي السنوات المالية: <span className="font-medium">{financialYears.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full border border-gray-300 dark:border-gray-700">
              <TableHeader className="bg-blue-100 dark:bg-blue-900">
                <TableRow className="border-b border-gray-300 dark:border-gray-700">
                  <TableHead className="text-right text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-700">السنة الميلادية</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-700">بداية السنة</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-700">نهاية السنة</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-700">الحالة</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-700">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialYears.map((year) => (
                  <TableRow key={year.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
                    <TableCell className="font-medium text-right text-gray-900 dark:text-white border-l border-gray-300 dark:border-gray-700">
                      {year.year}
                    </TableCell>
                    <TableCell className="text-right text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-700">
                      {formatDate(year.startDate)}
                    </TableCell>
                    <TableCell className="text-right text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-700">
                      {formatDate(year.endDate)}
                    </TableCell>
                    <TableCell className="text-right border-l border-gray-300 dark:border-gray-700">
                      {getStatusBadge(year.status)}
                    </TableCell>
                    <TableCell className="text-right text-gray-700 dark:text-gray-300 border-l border-gray-300 dark:border-gray-700">
                      {formatDate(year.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(year)} aria-label="تعديل">
                          <Edit className="h-5 w-5 text-blue-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(year.id)} aria-label="حذف">
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {financialYears.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">لا توجد سنوات مالية</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                لم يتم إضافة أي سنوات مالية بعد.
              </p>
              <div className="mt-6">
                <Button 
                  onClick={handleAddYear}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة سنة مالية
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Financial Year Modal */}
      <AddFinancialYearModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditYear(null); }}
        onSave={handleSaveYear}
        existingYears={financialYears.map(year => year.year)}
        saveButtonClassName="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
        {...(editYear ? {
          initialData: {
            year: editYear.year,
            startDay: editYear.startDate.split('-')[2],
            startMonth: editYear.startDate.split('-')[1],
            startYear: editYear.startDate.split('-')[0],
            endDay: editYear.endDate.split('-')[2],
            endMonth: editYear.endDate.split('-')[1],
            endYear: editYear.endDate.split('-')[0],
            status: editYear.status
          }
        } : {})}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
          <Card className="w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-2 space-x-reverse">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-red-600">تأكيد الحذف</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                هل أنت متأكد من رغبتك في حذف السنة المالية <strong className="text-gray-900 dark:text-white">{deleteConfirm.yearName}</strong>؟
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                سيتم حذف السنة المالية بشكل دائم ولن يمكنك استرجاعها لاحقاً.
              </p>
              <div className="flex items-center justify-end space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm({isOpen: false, yearId: '', yearName: ''})}
                  className="border-gray-300 dark:border-gray-600"
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex items-center space-x-2 space-x-reverse"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>حذف</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FinancialYearsPage;