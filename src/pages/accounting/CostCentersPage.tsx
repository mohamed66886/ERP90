import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/Breadcrumb";
import { toast } from "sonner";
import {
  Target,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Building,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import {
  CostCenter,
  getCostCenters,
  addCostCenter,
  updateCostCenter,
  deleteCostCenter,
  getDefaultCostCenters
} from '@/lib/costCenterService';

const CostCentersPage: React.FC = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['100', '200', '300']));
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  // Form states
  const [newCostCenter, setNewCostCenter] = useState<Partial<CostCenter>>({
    nameAr: '',
    nameEn: '',
    description: '',
    type: 'رئيسي',
    status: 'نشط',
    hasSubCenters: false,
    level: 1,
    budget: 0,
    actualCost: 0,
    variance: 0
  });

  const [editForm, setEditForm] = useState<Partial<CostCenter>>({});

  // Cost center types and departments
  const costCenterTypes = ['رئيسي', 'فرعي', 'وحدة'];
  const departments = [
    'الإدارة',
    'الموارد البشرية',
    'المالية',
    'الإنتاج',
    'المبيعات',
    'التسويق',
    'المشتريات',
    'المخازن',
    'تكنولوجيا المعلومات',
    'الصيانة',
    'الجودة',
    'الأمن والسلامة'
  ];

  // Load cost centers from Firebase with timeout and retry
  const loadCostCenters = async (retryCount = 0) => {
    try {
      setIsLoading(true);
      console.log(`Loading cost centers from Firebase... (attempt ${retryCount + 1})`);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة التحميل')), 5000)
      );
      
      const costCentersPromise = getCostCenters();
      
      const firebaseCostCenters = await Promise.race([costCentersPromise, timeoutPromise]) as CostCenter[];
      console.log('Cost centers loaded:', firebaseCostCenters);
      
      // If no cost centers exist, create default ones
      if (firebaseCostCenters.length === 0) {
        console.log('No cost centers found, creating default ones...');
        const defaultCostCenters = getDefaultCostCenters();
        
        // Add default cost centers to Firebase
        for (const costCenter of defaultCostCenters) {
          await addCostCenter(costCenter);
        }
        
        // Reload cost centers after adding defaults
        const newCostCenters = await getCostCenters();
        const hierarchicalCostCenters = buildCostCenterHierarchy(newCostCenters);
        setCostCenters(hierarchicalCostCenters);
        
        toast.success(`تم إنشاء ${defaultCostCenters.length} مركز تكلفة افتراضي`);
      } else {
        // Build hierarchical structure
        const hierarchicalCostCenters = buildCostCenterHierarchy(firebaseCostCenters);
        setCostCenters(hierarchicalCostCenters);
        
        toast.success(`تم تحميل ${firebaseCostCenters.length} مركز تكلفة من قاعدة البيانات`);
      }
    } catch (error) {
      console.error('Error loading cost centers:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      
      // Retry logic
      if (retryCount < 2) {
        console.log(`Retrying to load cost centers... (${retryCount + 1}/2)`);
        toast.warning(`فشل في التحميل، جاري المحاولة مرة أخرى... (${retryCount + 1}/2)`);
        setTimeout(() => loadCostCenters(retryCount + 1), 2000);
        return;
      }
      
      toast.error(`فشل في تحميل مراكز التكلفة بعد عدة محاولات: ${errorMessage}`);
      setCostCenters([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Build hierarchical structure for cost centers
  const buildCostCenterHierarchy = (flatCostCenters: CostCenter[]): CostCenter[] => {
    const costCenterMap = new Map<string, CostCenter>();
    const rootCostCenters: CostCenter[] = [];
    
    // First pass: create map of all cost centers
    flatCostCenters.forEach(costCenter => {
      costCenterMap.set(costCenter.id, { ...costCenter, children: [] });
    });
    
    // Second pass: build hierarchy and update hasSubCenters
    flatCostCenters.forEach(costCenter => {
      const costCenterWithChildren = costCenterMap.get(costCenter.id)!;
      if (costCenter.parentId && costCenterMap.has(costCenter.parentId)) {
        const parent = costCenterMap.get(costCenter.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(costCenterWithChildren);
        // تحديث hasSubCenters للحساب الأب
        parent.hasSubCenters = true;
      } else {
        rootCostCenters.push(costCenterWithChildren);
      }
    });
    
    // Sort root cost centers by code
    rootCostCenters.sort((a, b) => {
      const codeA = parseInt(a.code) || 0;
      const codeB = parseInt(b.code) || 0;
      return codeA - codeB;
    });
    
    // Sort children recursively
    const sortChildren = (costCenters: CostCenter[]) => {
      costCenters.forEach(costCenter => {
        if (costCenter.children && costCenter.children.length > 0) {
          costCenter.children.sort((a, b) => {
            const codeA = parseInt(a.code) || 0;
            const codeB = parseInt(b.code) || 0;
            return codeA - codeB;
          });
          sortChildren(costCenter.children);
        }
      });
    };
    
    sortChildren(rootCostCenters);
    
    return rootCostCenters;
  };

  // Flatten hierarchical cost centers to flat array
  const flattenCostCenterHierarchy = (hierarchicalCostCenters: CostCenter[]): CostCenter[] => {
    const result: CostCenter[] = [];
    
    const flatten = (costCenters: CostCenter[]) => {
      costCenters.forEach(costCenter => {
        result.push(costCenter);
        if (costCenter.children) {
          flatten(costCenter.children);
        }
      });
    };
    
    flatten(hierarchicalCostCenters);
    return result;
  };

  // Generate sub cost center code
  const generateSubCostCenterCode = async (parentCode: string): Promise<string> => {
    try {
      const allCostCenters = await getCostCenters();
      
      const subCostCenters = allCostCenters.filter(costCenter => 
        costCenter.code.startsWith(parentCode) && 
        costCenter.code !== parentCode &&
        costCenter.code.length === parentCode.length + 1
      );
      
      if (subCostCenters.length === 0) {
        return parentCode + '1';
      }
      
      const subCodes = subCostCenters
        .map(costCenter => costCenter.code.substring(parentCode.length))
        .map(suffix => parseInt(suffix))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);
      
      if (subCodes.length === 0) {
        return parentCode + '1';
      }
      
      let nextSubCode = 1;
      for (const code of subCodes) {
        if (code === nextSubCode) {
          nextSubCode++;
        } else {
          break;
        }
      }
      
      return parentCode + nextSubCode.toString();
    } catch (error) {
      console.error('Error generating sub cost center code:', error);
      return parentCode + '1';
    }
  };

  // Generate main cost center code
  const generateMainCostCenterCode = async (): Promise<string> => {
    try {
      const allCostCenters = await getCostCenters();
      const level1CostCenters = allCostCenters.filter(costCenter => costCenter.level === 1);
      
      if (level1CostCenters.length === 0) {
        return '100';
      }
      
      const codes = level1CostCenters
        .map(costCenter => parseInt(costCenter.code))
        .filter(code => !isNaN(code))
        .sort((a, b) => a - b);
      
      if (codes.length === 0) {
        return '100';
      }
      
      let nextCode = 100;
      for (const code of codes) {
        if (code === nextCode) {
          nextCode += 100;
        } else {
          break;
        }
      }
      
      return nextCode.toString();
    } catch (error) {
      console.error('Error generating main cost center code:', error);
      return '100';
    }
  };

  // Load cost centers on component mount
  useEffect(() => {
    loadCostCenters();
  }, []);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleCostCenterSelect = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setIsEditing(false);
    setEditForm(costCenter);
    setShowDeleteWarning(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!selectedCostCenter) return;
    
    // Check for sub cost centers
    const flatCostCenters = flattenCostCenterHierarchy(costCenters);
    const subCostCenters = flatCostCenters.filter(costCenter => costCenter.parentId === selectedCostCenter.id);
    const hasSubCostCenters = subCostCenters.length > 0;
    
    if (hasSubCostCenters) {
      setShowDeleteWarning(true);
      
      let errorMessage = `🚫 تحذير: لا يمكن حذف هذا المركز لأنه يحتوي على ${subCostCenters.length} مركز فرعي.\n\n`;
      
      if (subCostCenters.length <= 3) {
        errorMessage += `المراكز الفرعية:\n`;
        subCostCenters.forEach(subCostCenter => {
          errorMessage += `• ${subCostCenter.code} - ${subCostCenter.nameAr}\n`;
        });
        errorMessage += `\n`;
      } else {
        errorMessage += `راجع تفاصيل المركز لمشاهدة قائمة المراكز الفرعية.\n\n`;
      }
      
      errorMessage += `يجب حذف جميع المراكز الفرعية أولاً قبل حذف هذا المركز.`;
      
      toast.error(errorMessage, {
        duration: 8000,
        style: {
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          whiteSpace: 'pre-line',
          maxWidth: '500px',
        },
      });
      return;
    }
    
    const confirmMessage = `هل أنت متأكد من حذف مركز التكلفة "${selectedCostCenter.nameAr}" (${selectedCostCenter.code})؟\n\nهذا الإجراء لا يمكن التراجع عنه.`;
    const confirmDelete = window.confirm(confirmMessage);
    
    if (!confirmDelete) return;
    
    try {
      await deleteCostCenter(selectedCostCenter.id);
      toast.success(`تم حذف مركز التكلفة "${selectedCostCenter.nameAr}" بنجاح`);
      
      await loadCostCenters();
      setSelectedCostCenter(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error deleting cost center:', error);
      toast.error(`فشل في حذف مركز التكلفة: ${error.message || 'خطأ غير معروف'}`);
    }
  };

  const handleAddClick = () => {
    if (selectedCostCenter && !selectedCostCenter.hasSubCenters) {
      toast.error(`لا يمكن إضافة مركز فرعي تحت "${selectedCostCenter.nameAr}" - المركز ليس له مراكز تحليلية`);
      return;
    }

    setShowAddForm(true);
    
    if (selectedCostCenter) {
      setNewCostCenter({
        nameAr: '',
        nameEn: '',
        description: '',
        type: 'فرعي',
        status: 'نشط',
        hasSubCenters: false,
        level: (selectedCostCenter.level || 1) + 1,
        parentId: selectedCostCenter.id,
        budget: 0,
        actualCost: 0,
        variance: 0,
        department: selectedCostCenter.department
      });
    } else {
      setNewCostCenter({
        nameAr: '',
        nameEn: '',
        description: '',
        type: 'رئيسي',
        status: 'نشط',
        hasSubCenters: false,
        level: 1,
        budget: 0,
        actualCost: 0,
        variance: 0
      });
    }
  };

  const handleAddCostCenter = async () => {
    if (!newCostCenter.nameAr || !newCostCenter.nameEn) {
      toast.error('يرجى إدخال اسم مركز التكلفة بالعربي والإنجليزي');
      return;
    }
    
    try {
      let autoCode: string;
      if (newCostCenter.parentId && selectedCostCenter) {
        autoCode = await generateSubCostCenterCode(selectedCostCenter.code);
      } else {
        autoCode = await generateMainCostCenterCode();
      }
      
      const costCenterToAdd: Omit<CostCenter, 'id'> = {
        code: autoCode,
        nameAr: newCostCenter.nameAr!,
        nameEn: newCostCenter.nameEn!,
        description: newCostCenter.description || '',
        type: newCostCenter.type!,
        level: newCostCenter.level || 1,
        status: 'نشط',
        hasSubCenters: newCostCenter.hasSubCenters || false,
        department: newCostCenter.department || '',
        manager: newCostCenter.manager || '',
        location: newCostCenter.location || '',
        budget: newCostCenter.budget || 0,
        actualCost: newCostCenter.actualCost || 0,
        variance: newCostCenter.variance || 0,
        startDate: newCostCenter.startDate || '',
        endDate: newCostCenter.endDate || '',
        notes: newCostCenter.notes || '',
        ...(newCostCenter.parentId && { parentId: newCostCenter.parentId })
      };
      
      await addCostCenter(costCenterToAdd);
      
      if (newCostCenter.parentId && selectedCostCenter) {
        toast.success(`تم إضافة المركز الفرعي بنجاح تحت ${selectedCostCenter.nameAr} بالكود ${autoCode}`);
      } else {
        toast.success(`تم إضافة المركز الرئيسي بنجاح بالكود ${autoCode}`);
      }
      
      setShowAddForm(false);
      await loadCostCenters();
      
      if (newCostCenter.parentId) {
        setExpandedNodes(prev => new Set([...prev, newCostCenter.parentId!]));
      }
    } catch (error) {
      console.error('Error adding cost center:', error);
      toast.error(`فشل في إضافة مركز التكلفة: ${error.message || 'خطأ غير معروف'}`);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewCostCenter({
      nameAr: '',
      nameEn: '',
      description: '',
      type: 'رئيسي',
      status: 'نشط',
      hasSubCenters: false,
      level: 1,
      budget: 0,
      actualCost: 0,
      variance: 0
    });
  };

  const handleSave = async () => {
    if (!selectedCostCenter || !editForm.nameAr || !editForm.nameEn) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsSaving(true);
      
      await updateCostCenter(selectedCostCenter.id, editForm);
      
      setIsEditing(false);
      setSelectedCostCenter(editForm as CostCenter);
      
      await loadCostCenters();
      
      toast.success('تم حفظ التعديلات بنجاح');
    } catch (error) {
      console.error('Error saving cost center:', error);
      toast.error(`فشل في حفظ التعديلات: ${error.message || 'خطأ غير معروف'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(selectedCostCenter || {});
    setIsSaving(false);
    setShowDeleteWarning(false);
  };

  const renderCostCenterTree = (costCenterList: CostCenter[], level = 0) => {
    return costCenterList.map((costCenter, idx) => {
      const isLast = idx === costCenterList.length - 1;
      const hasChildren = costCenter.children && costCenter.children.length > 0;
      const isExpanded = expandedNodes.has(costCenter.id);
      
      return (
        <div key={costCenter.id} className="select-none relative">
          {/* خطوط طولية */}
          {level > 0 && (
            <div
              className="absolute top-0 right-0"
              style={{
                width: '20px',
                right: `${(level - 1) * 20 + 2}px`,
                height: isLast ? '36px' : '100%',
                borderRight: isLast ? '2px solid transparent' : '2px solid #e5e7eb',
                zIndex: 0,
              }}
            />
          )}
          
          {/* خط أفقي */}
          {level > 0 && (
            <div
              className="absolute top-4"
              style={{
                width: '18px',
                right: `${(level - 1) * 20 + 2}px`,
                height: '2px',
                backgroundColor: '#e5e7eb',
                zIndex: 0,
              }}
            />
          )}
          
          <div
            className={`flex items-center py-2 px-2 hover:bg-gray-50 cursor-pointer rounded ${
              selectedCostCenter?.id === costCenter.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
            style={{ paddingRight: `${level * 20 + 8}px`, position: 'relative', zIndex: 1 }}
            onClick={() => handleCostCenterSelect(costCenter)}
          >
            {/* أيقونة التوسع/الطي */}
            <div className="ml-2 w-4 h-4 flex items-center justify-center">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(costCenter.id);
                  }}
                  className="hover:bg-gray-200 rounded p-0.5"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-gray-600" />
                  )}
                </button>
              )}
            </div>
            
            {/* أيقونة نوع المركز */}
            <div className="ml-2">
              <Target className={`h-4 w-4 ${
                costCenter.type === 'رئيسي' ? 'text-blue-600' :
                costCenter.type === 'فرعي' ? 'text-green-600' : 'text-orange-600'
              }`} />
            </div>
            
            {/* معلومات المركز */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {costCenter.nameAr}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    costCenter.status === 'نشط' ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'
                  }`}
                >
                  {costCenter.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500 mt-1">
                <span>كود: {costCenter.code}</span>
                {costCenter.department && <span>القسم: {costCenter.department}</span>}
                {costCenter.budget && costCenter.budget > 0 && (
                  <span>الميزانية: {costCenter.budget.toLocaleString()} ريال</span>
                )}
              </div>
            </div>
          </div>
          
          {/* المراكز الفرعية */}
          {hasChildren && isExpanded && (
            <div>{renderCostCenterTree(costCenter.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل مراكز التكلفة...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6 min-h-screen" dir="rtl">
      {/* Header */}
      <div className="p-4 font-['Tajawal'] bg-white mb-4 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="flex items-center">
          <Target className="h-8 w-8 text-red-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">مراكز التكلفة</h1>
        </div>
        <p className="text-gray-600 mt-2">إدارة مراكز التكلفة والأقسام</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-orange-500"></div>
      </div>

      <Breadcrumb
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الادارة الماليه", to: "/management/financial" }, 
          { label: "مراكز التكلفة" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Center Tree - Right Side */}
        <div className="lg:col-span-1">
          <Card className="h-[700px]">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">شجرة مراكز التكلفة</h3>
                <Button 
                  onClick={handleAddClick}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة مركز
                </Button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
              {costCenters.length > 0 ? (
                renderCostCenterTree(costCenters)
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد مراكز تكلفة</p>
                  <Button 
                    onClick={handleAddClick}
                    size="sm"
                    className="mt-4 bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة مركز جديد
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Cost Center Details - Left Side */}
        <div className="lg:col-span-2">
          <Card className="h-[700px]">
            {showAddForm ? (
              /* Add Form */
              <div className="p-6 overflow-y-auto h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedCostCenter ? 'إضافة مركز فرعي' : 'إضافة مركز رئيسي'}
                  </h3>
                  <Button variant="outline" onClick={handleCancelAdd}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {selectedCostCenter && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>المركز الأب:</strong> {selectedCostCenter.nameAr} ({selectedCostCenter.code})
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>اسم المركز (عربي) *</Label>
                      <Input
                        value={newCostCenter.nameAr || ''}
                        onChange={(e) => setNewCostCenter({...newCostCenter, nameAr: e.target.value})}
                        placeholder="اسم مركز التكلفة بالعربي"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>اسم المركز (إنجليزي) *</Label>
                      <Input
                        value={newCostCenter.nameEn || ''}
                        onChange={(e) => setNewCostCenter({...newCostCenter, nameEn: e.target.value})}
                        placeholder="Cost Center Name in English"
                        className="text-left"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>نوع المركز</Label>
                      <select
                        value={newCostCenter.type || 'رئيسي'}
                        onChange={(e) => setNewCostCenter({...newCostCenter, type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                        disabled={!!selectedCostCenter}
                      >
                        {costCenterTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>القسم</Label>
                      <select
                        value={newCostCenter.department || ''}
                        onChange={(e) => setNewCostCenter({...newCostCenter, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                      >
                        <option value="">اختر القسم</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>المدير المسؤول</Label>
                      <Input
                        value={newCostCenter.manager || ''}
                        onChange={(e) => setNewCostCenter({...newCostCenter, manager: e.target.value})}
                        placeholder="اسم المدير المسؤول"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الموقع</Label>
                      <Input
                        value={newCostCenter.location || ''}
                        onChange={(e) => setNewCostCenter({...newCostCenter, location: e.target.value})}
                        placeholder="موقع مركز التكلفة"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الميزانية المخططة</Label>
                      <Input
                        type="number"
                        value={newCostCenter.budget || 0}
                        onChange={(e) => setNewCostCenter({...newCostCenter, budget: parseFloat(e.target.value) || 0})}
                        placeholder="0"
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>تاريخ البداية</Label>
                      <Input
                        type="date"
                        value={newCostCenter.startDate || ''}
                        onChange={(e) => setNewCostCenter({...newCostCenter, startDate: e.target.value})}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <textarea
                      value={newCostCenter.description || ''}
                      onChange={(e) => setNewCostCenter({...newCostCenter, description: e.target.value})}
                      placeholder="وصف مركز التكلفة..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <textarea
                      value={newCostCenter.notes || ''}
                      onChange={(e) => setNewCostCenter({...newCostCenter, notes: e.target.value})}
                      placeholder="ملاحظات إضافية..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id="hasSubCenters"
                      checked={newCostCenter.hasSubCenters || false}
                      onChange={(e) => setNewCostCenter({...newCostCenter, hasSubCenters: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="hasSubCenters">يحتوي على مراكز فرعية</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 space-x-reverse mt-8 pt-6 border-t">
                  <Button variant="outline" onClick={handleCancelAdd}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleAddCostCenter}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Save className="h-4 w-4 ml-1" />
                    حفظ المركز
                  </Button>
                </div>
              </div>
            ) : selectedCostCenter ? (
              /* Cost Center Details */
              <div className="p-6 overflow-y-auto h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">تفاصيل مركز التكلفة</h3>
                  <div className="flex space-x-2 space-x-reverse">
                    {!isEditing ? (
                      <>
                        <Button 
                          onClick={handleEdit}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                        <Button 
                          onClick={handleDelete}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={handleCancel}
                          size="sm"
                          variant="outline"
                        >
                          إلغاء
                        </Button>
                        <Button 
                          onClick={handleSave}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isSaving}
                        >
                          <Save className="h-4 w-4 ml-1" />
                          {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {showDeleteWarning && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
                      <p className="text-red-800 font-medium">تحذير: لا يمكن حذف هذا المركز</p>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      يحتوي هذا المركز على مراكز فرعية. يجب حذف المراكز الفرعية أولاً.
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* معلومات أساسية */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-4">المعلومات الأساسية</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>اسم المركز (عربي)</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.nameAr || ''}
                            onChange={(e) => setEditForm({...editForm, nameAr: e.target.value})}
                            className="text-right"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium">{selectedCostCenter.nameAr}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>اسم المركز (إنجليزي)</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.nameEn || ''}
                            onChange={(e) => setEditForm({...editForm, nameEn: e.target.value})}
                            className="text-left"
                            dir="ltr"
                          />
                        ) : (
                          <p className="text-gray-800 font-medium" dir="ltr">{selectedCostCenter.nameEn}</p>
                        )}
                      </div>

                      <div>
                        <Label>كود المركز</Label>
                        <p className="text-gray-800 font-medium">{selectedCostCenter.code}</p>
                      </div>

                      <div>
                        <Label>نوع المركز</Label>
                        <Badge className={`
                          ${selectedCostCenter.type === 'رئيسي' ? 'bg-blue-100 text-blue-800' :
                            selectedCostCenter.type === 'فرعي' ? 'bg-green-100 text-green-800' : 
                            'bg-orange-100 text-orange-800'}
                        `}>
                          {selectedCostCenter.type}
                        </Badge>
                      </div>

                      <div>
                        <Label>الحالة</Label>
                        {isEditing ? (
                          <select
                            value={editForm.status || 'نشط'}
                            onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                          >
                            <option value="نشط">نشط</option>
                            <option value="غير نشط">غير نشط</option>
                          </select>
                        ) : (
                          <Badge className={`
                            ${selectedCostCenter.status === 'نشط' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          `}>
                            {selectedCostCenter.status}
                          </Badge>
                        )}
                      </div>

                      <div>
                        <Label>المستوى</Label>
                        <p className="text-gray-800 font-medium">المستوى {selectedCostCenter.level}</p>
                      </div>
                    </div>
                  </div>

                  {/* معلومات إدارية */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Building className="h-5 w-5 ml-2" />
                      المعلومات الإدارية
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>القسم</Label>
                        {isEditing ? (
                          <select
                            value={editForm.department || ''}
                            onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                          >
                            <option value="">اختر القسم</option>
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-gray-800">{selectedCostCenter.department || 'غير محدد'}</p>
                        )}
                      </div>

                      <div>
                        <Label>المدير المسؤول</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.manager || ''}
                            onChange={(e) => setEditForm({...editForm, manager: e.target.value})}
                            className="text-right"
                            placeholder="اسم المدير المسؤول"
                          />
                        ) : (
                          <p className="text-gray-800">{selectedCostCenter.manager || 'غير محدد'}</p>
                        )}
                      </div>

                      <div>
                        <Label>الموقع</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.location || ''}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            className="text-right"
                            placeholder="موقع مركز التكلفة"
                          />
                        ) : (
                          <p className="text-gray-800">{selectedCostCenter.location || 'غير محدد'}</p>
                        )}
                      </div>

                      <div>
                        <Label>تاريخ البداية</Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editForm.startDate || ''}
                            onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                            className="text-right"
                          />
                        ) : (
                          <p className="text-gray-800">{selectedCostCenter.startDate || 'غير محدد'}</p>
                        )}
                      </div>

                      <div>
                        <Label>تاريخ النهاية</Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editForm.endDate || ''}
                            onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                            className="text-right"
                          />
                        ) : (
                          <p className="text-gray-800">{selectedCostCenter.endDate || 'غير محدد'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* المعلومات المالية */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 ml-2" />
                      المعلومات المالية
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>الميزانية المخططة</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.budget || 0}
                            onChange={(e) => setEditForm({...editForm, budget: parseFloat(e.target.value) || 0})}
                            className="text-right"
                          />
                        ) : (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 ml-1" />
                            <span className="text-gray-800 font-medium">
                              {selectedCostCenter.budget?.toLocaleString() || '0'} ريال
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>التكلفة الفعلية</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.actualCost || 0}
                            onChange={(e) => setEditForm({...editForm, actualCost: parseFloat(e.target.value) || 0})}
                            className="text-right"
                          />
                        ) : (
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-blue-600 ml-1" />
                            <span className="text-gray-800 font-medium">
                              {selectedCostCenter.actualCost?.toLocaleString() || '0'} ريال
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>الانحراف</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editForm.variance || 0}
                            onChange={(e) => setEditForm({...editForm, variance: parseFloat(e.target.value) || 0})}
                            className="text-right"
                          />
                        ) : (
                          <div className="flex items-center">
                            {(selectedCostCenter.variance || 0) >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                            )}
                            <span className={`font-medium ${
                              (selectedCostCenter.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {selectedCostCenter.variance?.toLocaleString() || '0'} ريال
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* نسبة الإنجاز */}
                    {selectedCostCenter.budget && selectedCostCenter.budget > 0 && (
                      <div className="mt-4">
                        <Label>نسبة استهلاك الميزانية</Label>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              ((selectedCostCenter.actualCost || 0) / selectedCostCenter.budget) > 0.9 
                                ? 'bg-red-600' 
                                : ((selectedCostCenter.actualCost || 0) / selectedCostCenter.budget) > 0.7 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-600'
                            }`}
                            style={{
                              width: `${Math.min(((selectedCostCenter.actualCost || 0) / selectedCostCenter.budget) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {((selectedCostCenter.actualCost || 0) / selectedCostCenter.budget * 100).toFixed(1)}% مستهلك
                        </p>
                      </div>
                    )}
                  </div>

                  {/* الوصف والملاحظات */}
                  {(selectedCostCenter.description || selectedCostCenter.notes || isEditing) && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4">الوصف والملاحظات</h4>
                      
                      {(selectedCostCenter.description || isEditing) && (
                        <div className="mb-4">
                          <Label>الوصف</Label>
                          {isEditing ? (
                            <textarea
                              value={editForm.description || ''}
                              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                              rows={3}
                              placeholder="وصف مركز التكلفة..."
                            />
                          ) : (
                            <p className="text-gray-800 whitespace-pre-wrap">{selectedCostCenter.description}</p>
                          )}
                        </div>
                      )}

                      {(selectedCostCenter.notes || isEditing) && (
                        <div>
                          <Label>ملاحظات</Label>
                          {isEditing ? (
                            <textarea
                              value={editForm.notes || ''}
                              onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-right"
                              rows={2}
                              placeholder="ملاحظات إضافية..."
                            />
                          ) : (
                            <p className="text-gray-800 whitespace-pre-wrap">{selectedCostCenter.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* خصائص إضافية */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-4">خصائص إضافية</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm">يحتوي على مراكز فرعية:</span>
                        <Badge className={`mr-2 ${
                          selectedCostCenter.hasSubCenters ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedCostCenter.hasSubCenters ? 'نعم' : 'لا'}
                        </Badge>
                      </div>
                      
                      {selectedCostCenter.createdAt && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span>تاريخ الإنشاء:</span>
                          <span className="mr-2">
                            {new Date(selectedCostCenter.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      )}
                      
                      {selectedCostCenter.updatedAt && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span>آخر تحديث:</span>
                          <span className="mr-2">
                            {new Date(selectedCostCenter.updatedAt).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">اختر مركز تكلفة</h3>
                  <p className="text-gray-500 mb-4">اختر مركز تكلفة من الشجرة لعرض تفاصيله</p>
                  <Button 
                    onClick={handleAddClick}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة مركز جديد
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CostCentersPage;
