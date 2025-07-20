import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Calculator, Lock, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    email: false,
    password: false
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    // تحقق من حالة تسجيل الدخول
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onLogin();
      }
    });
    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
  }, [onLogin]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    toast.promise(
      signInWithEmailAndPassword(auth, email, password),
      {
        loading: 'جاري التحقق من بياناتك...',
        success: () => {
          onLogin();
          return 'تم تسجيل الدخول بنجاح! جاري تحويلك...';
        },
        error: (err) => {
          let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
          
          switch (err.code) {
            case 'auth/invalid-email':
              errorMessage = "البريد الإلكتروني غير صالح";
              break;
            case 'auth/user-disabled':
              errorMessage = "هذا الحساب معطل";
              break;
            case 'auth/user-not-found':
              errorMessage = "لا يوجد حساب مرتبط بهذا البريد الإلكتروني";
              break;
            case 'auth/wrong-password':
              errorMessage = "كلمة المرور غير صحيحة";
              break;
            case 'auth/too-many-requests':
              errorMessage = "عدد كبير جداً من المحاولات الفاشلة. يرجى المحاولة لاحقاً";
              break;
            default:
              errorMessage = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى";
          }
          
          return errorMessage;
        },
        finally: () => {
          setLoading(false);
        }
      }
    );
  };

  return (
    <div 
      className={
        `min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center rtl ${isMobile ? 'p-0' : 'p-4'}`
      }
      dir="rtl"
    >
      <div className="container mx-auto flex items-center justify-center">
        {/* الصورة الجانبية للشاشات الكبيرة */}
        {!isMobile && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex w-1/2 items-center justify-center p-8"
          >
            <div className="relative w-full h-[32rem] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-tr from-blue-900 to-indigo-700">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-72 h-72"
                >
                  <img 
                    src="./logo.png" 
                    alt="شعار كودكسا" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute bottom-8 right-8 left-8 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg"
              >
                <h3 className="text-xl font-bold text-gray-800 font-arabic">كودكسا - CodeXa</h3>
                <p className="text-sm text-gray-600 mt-2 font-arabic leading-relaxed">
                  منصة متكاملة لإدارة أعمالك البرمجية والمالية باحترافية وكفاءة عالية. 
                  نوفر لك جميع الأدوات التي تحتاجها في مكان واحد لتحقيق أقصى استفادة من عملك.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  <span className="text-xs text-gray-500 font-arabic">متصل بالخوادم الآمنة</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* نموذج تسجيل الدخول */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={
            isMobile
              ? 'w-full flex items-center justify-center p-0'
              : 'w-1/2 flex items-center justify-center p-4 md:p-8'
          }
        >
          <Card
            className={
              isMobile
                ? 'w-full relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-2xl py-6'
                : 'w-full max-w-md relative z-10 shadow-xl border-0 bg-white/95 backdrop-blur-sm'
            }
          >
            <CardHeader className={isMobile ? 'text-center space-y-3 pb-2' : 'text-center space-y-4'}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: 0.2
                }}
                className={
                  isMobile
                    ? 'mx-auto w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg'
                    : 'mx-auto w-20 h-20 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg'
                }
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <motion.div
                  animate={{
                    rotate: isHovered ? [0, 10, -10, 0] : 0,
                    scale: isHovered ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <Calculator className={isMobile ? 'w-7 h-7 text-white' : 'w-9 h-9 text-white'} />
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-2xl font-bold text-gray-800 font-arabic tracking-tight">
                  مرحباً بعودتك
                </CardTitle>
                <CardDescription className="text-gray-500 font-arabic mt-2">
                  سجل الدخول للوصول إلى لوحة التحكم الخاصة بك
                </CardDescription>
              </motion.div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className={isMobile ? 'space-y-5' : 'space-y-6'}>
                <div className={isMobile ? 'space-y-1.5' : 'space-y-2'}>
                  <Label htmlFor="email" className={isMobile ? 'font-arabic font-medium text-gray-700 text-base' : 'font-arabic font-medium text-gray-700'}>
                    البريد الإلكتروني
                  </Label>
                  <motion.div
                    animate={{
                      borderColor: inputFocus.email ? '#6366f1' : '#d1d5db',
                      boxShadow: inputFocus.email ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none'
                    }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-lg"
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setInputFocus({...inputFocus, email: true})}
                      onBlur={() => setInputFocus({...inputFocus, email: false})}
                      className={
                        isMobile
                          ? 'pr-10 font-arabic border-gray-300 focus:ring-0 text-base py-3 rounded-lg'
                          : 'pr-10 font-arabic border-gray-300 focus:ring-0'
                      }
                      required
                    />
                    <User className={isMobile ? 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' : 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4'} />
                  </motion.div>
                </div>
                
                <div className={isMobile ? 'space-y-1.5' : 'space-y-2'}>
                  <Label htmlFor="password" className={isMobile ? 'font-arabic font-medium text-gray-700 text-base' : 'font-arabic font-medium text-gray-700'}>
                    كلمة المرور
                  </Label>
                  <motion.div
                    animate={{
                      borderColor: inputFocus.password ? '#6366f1' : '#d1d5db',
                      boxShadow: inputFocus.password ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none'
                    }}
                    transition={{ duration: 0.2 }}
                    className="relative rounded-lg"
                  >
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setInputFocus({...inputFocus, password: true})}
                      onBlur={() => setInputFocus({...inputFocus, password: false})}
                      className={
                        isMobile
                          ? 'pr-10 pl-10 font-arabic border-gray-300 focus:ring-0 text-base py-3 rounded-lg'
                          : 'pr-10 pl-10 font-arabic border-gray-300 focus:ring-0'
                      }
                      required
                    />
                    <Lock className={isMobile ? 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' : 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4'} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={isMobile ? 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors' : 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'}
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </motion.div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="button"
                    className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-arabic py-1"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={
                      isMobile
                        ? 'w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-arabic font-medium text-base py-4 shadow-lg hover:shadow-xl transition-all rounded-lg'
                        : 'w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-arabic font-medium text-lg py-6 shadow-md hover:shadow-lg transition-all'
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري تسجيل الدخول
                      </>
                    ) : "تسجيل الدخول"}
                  </Button>
                </motion.div>
                
                <div className={isMobile ? 'text-center space-y-2 mt-4' : 'text-center space-y-3 mt-6'}>
                  <p className="text-xs text-gray-500 font-arabic">
                    ليس لديك حساب؟{' '}
                    <button 
                      type="button"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                    >
                      إنشاء حساب جديد
                    </button>
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs text-gray-400">أو</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full font-arabic text-sm mt-2"
                  >
                    الدخول بحساب جوجل
                  </Button>
                </div>
              </form>
            </CardContent>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center pb-4"
            >
              <p className="text-xs text-gray-400 font-arabic">
                © {new Date().getFullYear()} كودكسا. جميع الحقوق محفوظة.
              </p>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;