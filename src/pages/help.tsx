import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";

const faqs = [
  {
    question: "ما هو حساب عربي؟",
    answer:
      "حساب عربي هو نظام إدارة أعمال متكامل مصمم لتسهيل إدارة الحسابات، العملاء، الموردين، المخزون، والمبيعات للشركات الصغيرة والمتوسطة باللغة العربية وبواجهة سهلة الاستخدام.",
  },
  {
    question: "كيف يمكنني إضافة عميل جديد؟",
    answer:
      "من القائمة الجانبية اختر 'العملاء' ثم اضغط على زر 'إضافة عميل' واملأ البيانات المطلوبة واحفظها.",
  },
  {
    question: "هل يمكنني إدارة أكثر من فرع؟",
    answer:
      "نعم، يمكنك إضافة وإدارة عدة فروع من خلال صفحة 'الفروع' في قسم الأعمال.",
  },
  {
    question: "كيف أضيف فاتورة مبيعات؟",
    answer:
      "انتقل إلى قسم 'المبيعات' ثم اضغط على 'إضافة فاتورة' وادخل تفاصيل الفاتورة والمنتجات المطلوبة.",
  },
  {
    question: "هل يدعم النظام النسخ الاحتياطي؟",
    answer:
      "نعم، يتم حفظ بياناتك بشكل آمن ويمكنك طلب نسخة احتياطية من الدعم الفني في أي وقت.",
  },
  {
    question: "كيف أتواصل مع الدعم الفني؟",
    answer:
      "يمكنك التواصل معنا عبر البريد الإلكتروني أو رقم الواتساب الموجود في صفحة 'اتصل بنا'.",
  },
  {
    question: "هل يمكنني تعديل أو حذف البيانات؟",
    answer:
      "نعم، يمكنك تعديل أو حذف أي بيانات من خلال الصفحات المخصصة لكل نوع بيانات مع مراعاة الصلاحيات الممنوحة لك.",
  },
  {
    question: "هل النظام آمن؟",
    answer:
      "النظام يعتمد على أحدث تقنيات الحماية وتشفير البيانات لضمان سرية معلوماتك وخصوصيتها.",
  },
  {
    question: "هل يمكنني استخدام النظام من الجوال؟",
    answer:
      "نعم، النظام متوافق مع جميع الأجهزة الذكية ويمكنك استخدامه من الجوال أو التابلت بسهولة.",
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <motion.div 
      className="border border-gray-200 rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow"
      initial={false}
      animate={{ backgroundColor: isOpen ? "#f8fafc" : "#ffffff" }}
    >
      <motion.div
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
      >
        <h3 className="font-bold text-lg text-blue-700">{question}</h3>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-blue-500 text-xl"
        >
          ▼
        </motion.span>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4 text-gray-800"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const icons = {
  report: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2m-6 0h6" />
    </svg>
  ),
  sync: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0014-7V5m-2 0a9 9 0 00-14 7v7" />
    </svg>
  ),
  secure: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2V7a2 2 0 10-4 0v2c0 1.104.896 2 2 2zm6 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5a6 6 0 1112 0z" />
    </svg>
  ),
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </motion.div>
  );
};

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>مركز المساعدة - حساب عربي</title>
        <meta name="description" content="مركز المساعدة لنظام حساب عربي لإدارة الأعمال" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <motion.section 
          className="py-16 px-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6 text-blue-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              مركز المساعدة
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              كل ما تحتاجه للبدء مع نظام حساب عربي لإدارة أعمالك بكل سهولة واحترافية
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="ابحث في الأسئلة الشائعة..."
                  className="w-full py-3 px-5 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                <button className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 pb-20">
          {/* Features Grid */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-blue-800">مميزات نظام حساب عربي</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={icons.report}
                title="تقارير متكاملة"
                description="احصل على تقارير مفصلة عن مبيعاتك وأرباحك وأداء عملك"
              />
              <FeatureCard
                icon={icons.sync}
                title="مزامنة فورية"
                description="مزامنة البيانات بين جميع أجهزتك في الوقت الحقيقي"
              />
              <FeatureCard
                icon={icons.secure}
                title="حماية وأمان"
                description="بياناتك مشفرة ومحمية بأحدث تقنيات الأمان"
              />
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-blue-800">الأسئلة الشائعة</h2>
            <div className="max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <FAQItem
                  key={idx}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === idx}
                  onClick={() => toggleFAQ(idx)}
                />
              ))}
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section 
            className="mb-16 bg-white rounded-xl shadow-lg p-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-800">تواصل معنا</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">طرق التواصل</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-700">البريد الإلكتروني</p>
                      <a href="mailto:support@hisaab-arabi.com" className="text-blue-600 hover:underline">support@hisaab-arabi.com</a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-700">واتساب</p>
                      <a href="https://wa.me/201234567890" className="text-blue-600 hover:underline">+20 123 456 7890</a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-700">الدعم الفني</p>
                      <p className="text-gray-600">24/7 متاح على الرقم 19990</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">موارد تعليمية</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-red-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-700">فيديوهات تعليمية</p>
                      <a href="https://www.youtube.com/@hisaabarabi" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">قناة يوتيوب حساب عربي</a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-yellow-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-700">دليل المستخدم</p>
                      <a href="#" className="text-blue-600 hover:underline">تحميل الدليل الكامل</a>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium text-gray-700">الأسئلة الشائعة</p>
                      <p className="text-gray-600">تصفح جميع الأسئلة والإجابات</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Tips Section */}
          <motion.section 
            className="bg-blue-800 text-white rounded-xl shadow-lg p-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">نصائح لاستخدام أفضل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "احرص على تحديث بياناتك باستمرار لضمان دقة التقارير",
                "استخدم النسخ الاحتياطي بشكل دوري لحماية بياناتك",
                "خصص الصلاحيات للمستخدمين حسب أدوارهم",
                "تابع تقارير الأداء لتحسين قراراتك",
                "استفد من الفيديوهات التعليمية لاكتشاف الميزات الجديدة",
                "تواصل مع الدعم الفني عند الحاجة للحصول على مساعدة سريعة"
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-start">
                    <span className="bg-white bg-opacity-20 p-1 rounded-full mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <p>{tip}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}