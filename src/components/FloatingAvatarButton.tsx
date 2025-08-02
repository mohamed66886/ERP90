import React, { useState, useRef, useEffect } from "react";
import { FaTwitter, FaGithub, FaLinkedin, FaTimes, FaWhatsapp } from "react-icons/fa";

const FloatingAvatarButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans" style={{ fontFamily: "'Tajawal', sans-serif" }}>
      {/* زر الصورة مع وميض دائم */}
      <div className="relative">
        <button
          className={`w-16 h-16 rounded-full shadow-xl bg-white flex items-center justify-center border-2 border-indigo-100 hover:scale-105 transition-all duration-300 ${
            isOpen ? "transform rotate-45 scale-90" : ""
          }`}
          style={{
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)"
          }}
          aria-label="الملف الشخصي"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="relative">
            <img
              src="/me.jpg"
              alt="صورتي الشخصية"
              className="w-14 h-14 rounded-full object-cover border-2 border-white"
            />
            {/* مؤشر الحالة */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
        </button>

        {/* تأثير الوميض الأزرق الدائم */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className="absolute w-16 h-16 rounded-full bg-blue-400 opacity-0 animate-pulse"
            style={{ 
              animationDuration: '2s',
              animationIterationCount: 'infinite'
            }}
          ></div>
        </div>
      </div>

      {/* نافذة الملف الشخصي */}
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute bottom-20 left-0 w-80 bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 origin-bottom-left animate-fadeInUp text-right"
          style={{
            animation: "fadeInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            backgroundColor: "rgba(255, 255, 255, 0.95)"
          }}
        >
          {/* رأس البطاقة */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white relative">
            <button
              className="absolute top-2 left-2 text-white hover:text-gray-200 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
            <div className="flex items-center space-x-3 flex-row-reverse">
              <img
                src="/me.jpg"
                alt="صورتي الشخصية"
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <h3 className="font-bold text-lg">محمد رشاد</h3>
                <p className="text-xs opacity-90">مطور واجهات أمامية</p>
              </div>
            </div>
          </div>

          {/* محتوى البطاقة */}
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4 text-right leading-6">
              مطور ويب شغوف بإنشاء تجارب رقمية متميزة. أتمتع بخبرة في تطوير تطبيقات الويب الحديثة باستخدام أحدث التقنيات مثل React وNext.js.
            </p>

            {/* معلومات الاتصال */}
            <div className="mb-4 text-right">
              <div className="flex items-center justify-end mb-2">
                <span className="ml-2 text-gray-500">example@email.com</span>
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex items-center justify-end">
                <span className="ml-2 text-gray-500">+966 50 123 4567</span>
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>

            {/* روابط التواصل */}
            <div className="flex justify-center space-x-4 mb-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-500 transition-colors"
                aria-label="تويتر"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-black transition-colors"
                aria-label="جيت هاب"
              >
                <FaGithub size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="لينكد إن"
              >
                <FaLinkedin size={20} />
              </a>
              <a
                href="https://wa.me/966501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-600 transition-colors"
                aria-label="واتساب"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>

            {/* زر التواصل */}
            <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-medium">
              تواصل معي
            </button>
          </div>
        </div>
      )}

      {/* أنيميشن CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default FloatingAvatarButton;