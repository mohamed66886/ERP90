import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Calculator, Lock, User, Loader2, Facebook } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  // State management
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    email: false,
    password: false
  });

  // Effects
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Auth state listener
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

  // Event handlers
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
      className={`min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center rtl ${isMobile ? 'p-0' : 'p-4'}`}
      dir="rtl"
    >
      <div className="container mx-auto flex items-center justify-center flex-row-reverse">
        {/* Side image for desktop */}
        {!isMobile && (
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex w-1/2 items-center justify-center p-8"
          >
            <div className="relative w-full h-[32rem] rounded-2xl overflow-hidden bg-white shadow-[0_24px_32px_-12px_rgba(0,0,0,0.18)]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full h-full">
                  <img 
                    src="/logo.png" 
                    alt="شعار" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Login form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={isMobile ? 'w-full flex items-center justify-center p-0 min-h-screen' : 'w-1/2 flex items-center justify-center p-4 md:p-8 min-h-screen'}
          style={{ minHeight: '100vh' }}
        >
          <Card
            className={isMobile ? 'w-full relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-2xl py-6' : 'w-full max-w-md relative z-10 shadow-xl border-0 bg-white/95 backdrop-blur-sm'}
          >
            <CardHeader className={isMobile ? 'text-center space-y-3 pb-2' : 'text-center space-y-4'}>
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
                {/* Email Input */}
                <div className={isMobile ? 'space-y-1.5' : 'space-y-2'}>
                  <Label htmlFor="email" className={isMobile ? 'font-arabic font-medium text-gray-700 text-base' : 'font-arabic font-medium text-gray-700'}>
                    البريد الإلكتروني
                  </Label>
                  <motion.div
                    animate={{
                      borderColor: inputFocus.email ? '#6366f1' : '#d1d5db',
                      boxShadow: inputFocus.email ? '0 4px 24px 0 rgba(99,102,241,0.10)' : '0 1px 4px 0 rgba(0,0,0,0.04)',
                      backgroundColor: inputFocus.email ? 'rgba(243,244,255,0.7)' : 'rgba(255,255,255,0.7)'
                    }}
                    transition={{ duration: 0.25 }}
                    className="relative rounded-xl border-2 flex items-center transition-all duration-200"
                  >
                    <Input
                      id="email"
                      type="email"
                      placeholder="بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setInputFocus({...inputFocus, email: true})}
                      onBlur={() => setInputFocus({...inputFocus, email: false})}
                      className={isMobile ? 'pr-10 font-arabic border-none bg-transparent focus:ring-0 text-base py-3 rounded-xl transition-all duration-200' : 'pr-10 font-arabic border-none bg-transparent focus:ring-0 transition-all duration-200'}
                      required
                      style={{ boxShadow: 'none', outline: 'none' }}
                    />
                    <motion.span
                      animate={{ color: inputFocus.email ? '#6366f1' : '#a3a3a3' }}
                      transition={{ duration: 0.2 }}
                      className={isMobile ? 'absolute right-3 top-1/2 -translate-y-1/2' : 'absolute right-3 top-1/2 -translate-y-1/2'}
                    >
                      <User className="w-4 h-4" />
                    </motion.span>
                  </motion.div>
                </div>
                
                {/* Password Input */}
                <div className={isMobile ? 'space-y-1.5' : 'space-y-2'}>
                  <Label htmlFor="password" className={isMobile ? 'font-arabic font-medium text-gray-700 text-base' : 'font-arabic font-medium text-gray-700'}>
                    كلمة المرور
                  </Label>
                  <motion.div
                    animate={{
                      borderColor: inputFocus.password ? '#6366f1' : '#d1d5db',
                      boxShadow: inputFocus.password ? '0 4px 24px 0 rgba(99,102,241,0.10)' : '0 1px 4px 0 rgba(0,0,0,0.04)',
                      backgroundColor: inputFocus.password ? 'rgba(243,244,255,0.7)' : 'rgba(255,255,255,0.7)'
                    }}
                    transition={{ duration: 0.25 }}
                    className="relative rounded-xl border-2 flex items-center transition-all duration-200"
                  >
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setInputFocus({...inputFocus, password: true})}
                      onBlur={() => setInputFocus({...inputFocus, password: false})}
                      className={isMobile ? 'pr-10 pl-10 font-arabic border-none bg-transparent focus:ring-0 text-base py-3 rounded-xl transition-all duration-200' : 'pr-10 pl-10 font-arabic border-none bg-transparent focus:ring-0 transition-all duration-200'}
                      required
                      style={{ boxShadow: 'none', outline: 'none' }}
                    />
                    <motion.span
                      animate={{ color: inputFocus.password ? '#6366f1' : '#a3a3a3' }}
                      transition={{ duration: 0.2 }}
                      className={isMobile ? 'absolute right-3 top-1/2 -translate-y-1/2' : 'absolute right-3 top-1/2 -translate-y-1/2'}
                    >
                      <Lock className="w-4 h-4" />
                    </motion.span>
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      animate={{ color: showPassword ? '#6366f1' : (inputFocus.password ? '#6366f1' : '#a3a3a3') }}
                      transition={{ duration: 0.2 }}
                      className={isMobile ? 'absolute left-3 top-1/2 -translate-y-1/2 hover:text-indigo-600 transition-colors' : 'absolute left-3 top-1/2 -translate-y-1/2 hover:text-indigo-600 transition-colors'}
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.button>
                  </motion.div>
                </div>
                
                {/* Forgot Password */}
                <div className="flex justify-end">
                  <button 
                    type="button"
                    className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-arabic py-1"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                
                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={isMobile ? 'w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-arabic font-medium text-base py-4 shadow-lg hover:shadow-xl transition-all rounded-lg' : 'w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-arabic font-medium text-lg py-6 shadow-md hover:shadow-lg transition-all'}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري تسجيل الدخول
                      </>
                    ) : "تسجيل الدخول"}
                  </Button>
                </motion.div>
                
                {/* Social Login */}
                <div className={isMobile ? 'text-center space-y-2 mt-4' : 'text-center space-y-3 mt-6'}>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs text-gray-400">أو</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <button type="button" aria-label="الدخول بجوجل" className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                      <FcGoogle size={24} />
                    </button>
                    <button type="button" aria-label="الدخول بفيسبوك" className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                      <Facebook size={22} className="text-[#1877f3]" />
                    </button>
                    <button type="button" aria-label="الدخول بجيتهب" className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                      <FaGithub size={22} className="text-black" />
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
            
            {/* Footer */}
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