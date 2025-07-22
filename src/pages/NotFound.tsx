import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import animationData from "./404-animation.json";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const animationRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    if (animationRef.current) {
      animationRef.current.playSegments([0, 120], true);
    }
  }, [location.pathname]);

  const handleHover = () => {
    if (animationRef.current) {
      animationRef.current.playSegments([120, 180], true);
    }
  };

  const handleHoverEnd = () => {
    if (animationRef.current) {
      animationRef.current.playSegments([180, 120], true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full px-4"
      >
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          <div className="w-full lg:w-1/2">
            <Lottie
              lottieRef={animationRef}
              animationData={animationData}
              loop={false}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          
          <div className="w-full lg:w-1/2 text-center lg:text-right">
            <motion.h1 
              className="text-8xl font-bold mb-4 text-[#1e293b]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              404
            </motion.h1>
            
            <motion.h2 
              className="text-3xl mb-4 text-[#334155]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              عذراً، الصفحة غير موجودة
            </motion.h2>
            
            <motion.p 
              className="mb-8 text-lg text-[#475569]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              يبدو أن الصفحة التي تبحث عنها غير موجودة في نظام <span className="font-bold text-[#2563eb]">ERP90</span>.
              ربما تم نقلها أو حذفها.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => navigate("/")}
                onMouseEnter={handleHover}
                onMouseLeave={handleHoverEnd}
                className="relative px-8 py-3 bg-[#2563eb] text-white rounded-lg shadow-lg hover:bg-[#1d4ed8] transition-all duration-300 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  العودة إلى لوحة التحكم
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-[#1e40af] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </motion.div>
            
            <motion.div 
              className="mt-12 text-sm text-[#64748b]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p>نظام ERP90 - الحلول المحاسبية المتكاملة</p>
              <p className="mt-1">رمز الخطأ: ERP90_404_{Math.floor(Math.random() * 10000)}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;