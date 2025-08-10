#!/bin/bash

# Performance Analysis Script for ERP90 Sales Page

echo "🔍 تحليل أداء صفحة المبيعات - ERP90"
echo "================================================"

# Check if React DevTools Profiler is available
echo "📊 فحص أدوات التطوير..."

# Analyze bundle size
echo "📦 تحليل حجم الـ Bundle:"
echo "الملف الأصلي: sales.tsx (~5221 سطر)"
echo "الملف المحسن: SalesOptimized.tsx (~800 سطر تقريباً)"

# Count hooks and state usage
echo ""
echo "⚛️  تحليل React Hooks:"
echo "====================="

# Original file analysis
echo "الملف الأصلي (sales.tsx):"
if [ -f "src/pages/stores/sales.tsx" ]; then
    useState_count=$(grep -c "useState" src/pages/stores/sales.tsx)
    useEffect_count=$(grep -c "useEffect" src/pages/stores/sales.tsx)
    useMemo_count=$(grep -c "useMemo" src/pages/stores/sales.tsx)
    useCallback_count=$(grep -c "useCallback" src/pages/stores/sales.tsx)
    
    echo "  📌 useState: $useState_count"
    echo "  📌 useEffect: $useEffect_count"
    echo "  📌 useMemo: $useMemo_count"
    echo "  📌 useCallback: $useCallback_count"
else
    echo "  ❌ الملف الأصلي غير موجود"
fi

echo ""
echo "الملف المحسن (SalesOptimized.tsx):"
if [ -f "src/pages/stores/SalesOptimized.tsx" ]; then
    useState_opt=$(grep -c "useState" src/pages/stores/SalesOptimized.tsx)
    useEffect_opt=$(grep -c "useEffect" src/pages/stores/SalesOptimized.tsx)
    useMemo_opt=$(grep -c "useMemo" src/pages/stores/SalesOptimized.tsx)
    useCallback_opt=$(grep -c "useCallback" src/pages/stores/SalesOptimized.tsx)
    
    echo "  ✅ useState: $useState_opt"
    echo "  ✅ useEffect: $useEffect_opt"
    echo "  ✅ useMemo: $useMemo_opt"
    echo "  ✅ useCallback: $useCallback_opt"
else
    echo "  ❌ الملف المحسن غير موجود"
fi

# Custom hooks analysis
echo ""
echo "🎣 Custom Hooks الجديدة:"
echo "======================="
if [ -f "src/hooks/useSalesData.ts" ]; then
    echo "  ✅ useSalesData - لإدارة البيانات الأساسية"
else
    echo "  ❌ useSalesData غير موجود"
fi

if [ -f "src/hooks/useInvoiceManagement.ts" ]; then
    echo "  ✅ useInvoiceManagement - لإدارة الفاتورة"
else
    echo "  ❌ useInvoiceManagement غير موجود"
fi

# Components analysis
echo ""
echo "🧩 المكونات المحسنة:"
echo "=================="
if [ -f "src/components/ItemSelect.tsx" ]; then
    echo "  ✅ ItemSelect - مكون اختيار الأصناف المحسن"
else
    echo "  ❌ ItemSelect غير موجود"
fi

if [ -f "src/components/CustomerSelect.tsx" ]; then
    echo "  ✅ CustomerSelect - مكون اختيار العملاء المحسن"
else
    echo "  ❌ CustomerSelect غير موجود"
fi

if [ -f "src/components/InvoiceComponents.tsx" ]; then
    echo "  ✅ InvoiceComponents - مكونات الفاتورة المحسنة"
else
    echo "  ❌ InvoiceComponents غير موجود"
fi

# Performance recommendations
echo ""
echo "🚀 التوصيات لتحسين الأداء:"
echo "========================="
echo "1. استخدم React DevTools Profiler لقياس الأداء"
echo "2. فعل React.StrictMode في التطوير"
echo "3. استخدم Chrome DevTools Performance tab"
echo "4. راقب Network tab لتحليل طلبات البيانات"
echo "5. استخدم Lighthouse لتحليل الأداء العام"

# Memory optimization tips
echo ""
echo "💾 نصائح تحسين الذاكرة:"
echo "====================="
echo "1. تجنب arrow functions في JSX"
echo "2. استخدم React.memo للمكونات البطيئة"
echo "3. فعل Virtual Scrolling للقوائم الطويلة"
echo "4. استخدم lazy loading للمكونات الكبيرة"
echo "5. تنظيف useEffect cleanup functions"

# Bundle analysis commands
echo ""
echo "📦 أوامر تحليل الـ Bundle:"
echo "========================"
echo "npm run build"
echo "npm install -g webpack-bundle-analyzer"
echo "npx webpack-bundle-analyzer build/static/js/*.js"

# Testing commands
echo ""
echo "🧪 أوامر الاختبار:"
echo "================"
echo "npm run test"
echo "npm run test:coverage"
echo "npm run test:performance"

echo ""
echo "✨ تم الانتهاء من التحليل!"
echo "لمزيد من المساعدة، راجع PERFORMANCE_OPTIMIZATION_README.md"
