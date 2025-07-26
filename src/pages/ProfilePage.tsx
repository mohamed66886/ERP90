import { useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Mail, Briefcase, Key, User, Save, Edit, Camera, Lock } from "lucide-react";
import { BiSolidBadgeCheck } from "react-icons/bi";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
// import CoverImage from "@/public/cover-default.jpg";
// Removed next/image import; use <img> instead

const ProfilePage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [coverImage, setCoverImage] = useState(
    user?.coverImage || "https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  );
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name,
        jobTitle,
        avatar,
        coverImage,
      });
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });
      setIsEditing(false);
    } catch (err) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء محاولة تحديث البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      // هنا يجب إضافة منطق تغيير كلمة المرور عبر Firebase Auth
      toast({
        title: "تم تغيير كلمة المرور",
        description: "سيتم تفعيل التغيير في المرة القادمة لتسجيل الدخول",
      });
      setPassword("");
    } catch (err) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: "تأكد من أن كلمة المرور الجديدة آمنة وكافية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">غير مسجل دخول</h2>
          <p className="text-gray-600 dark:text-gray-400">
            يرجى تسجيل الدخول لعرض الملف الشخصي
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        <img
          src={coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        
        <div className="absolute -bottom-16 left-6 flex items-center gap-4">
          <div className="relative">
            
            <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900 shadow-lg">
              
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </Avatar>
          </div>

        </div>
        
        {!isEditing && (
          <div className="absolute bottom-6 right-6">
            <Button 
              variant="outline" 
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              تعديل الملف الشخصي
            </Button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-1/3 space-y-6">
            {/* Intro Card */}
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">معلومات عنك</h3>
                {isEditing && (
                  <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">العمل</p>
                    {isEditing ? (
                      <Input
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="أدخل المسمى الوظيفي"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium">{jobTitle || "غير محدد"}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">الدور</p>
                    <Badge variant="secondary" className="mt-1">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                {/* Cover Image URL */}
                <div className="flex items-start gap-3">
                  <Camera className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">رابط صورة الغلاف</p>
                    {isEditing ? (
                      <Input
                        value={coverImage}
                        onChange={e => setCoverImage(e.target.value)}
                        placeholder="أدخل رابط صورة الغلاف"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium break-all text-blue-600 underline">
                        <a href={coverImage} target="_blank" rel="noopener noreferrer">
                          {coverImage}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                {/* Avatar Image URL */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">رابط الصورة الشخصية</p>
                    {isEditing ? (
                      <Input
                        value={avatar}
                        onChange={e => setAvatar(e.target.value)}
                        placeholder="أدخل رابط الصورة الشخصية"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium break-all text-blue-600 underline">
                        <a href={avatar || "#"} target="_blank" rel="noopener noreferrer">
                          {avatar || "لا يوجد صورة شخصية"}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Photos Card */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">الصور</h3>
                <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                  عرض الكل
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div 
                    key={item} 
                    className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md"
                  />
                ))}
              </div>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-2/3 space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {isEditing ? (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <>
                      {name}
                      <BiSolidBadgeCheck className="text-blue-500 text-xl" />
                    </>
                  )}
                </h2>
                
                {isEditing && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      إلغاء
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Tabs */}
              <div className="flex border-b mb-6">
                <button
                  className={cn(
                    "px-6 py-3 font-medium text-sm border-b-2 transition-colors",
                    activeTab === "profile"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  onClick={() => setActiveTab("profile")}
                >
                  المنشورات
                </button>
                <button
                  className={cn(
                    "px-6 py-3 font-medium text-sm border-b-2 transition-colors",
                    activeTab === "about"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  onClick={() => setActiveTab("about")}
                >
                  معلومات عنك
                </button>
                <button
                  className={cn(
                    "px-6 py-3 font-medium text-sm border-b-2 transition-colors",
                    activeTab === "security"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                  onClick={() => setActiveTab("security")}
                >
                  الأمان
                </button>
              </div>
              
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatar} />
                        <AvatarFallback>
                          {name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 cursor-text hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <p className="text-gray-500">ما الذي يدور في ذهنك، {name.split(" ")[0]}؟</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="grid grid-cols-3 gap-2">
                      <button className="flex items-center justify-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Camera className="h-5 w-5 text-red-500" />
                        <span className="text-sm">صورة</span>
                      </button>
                      <button className="flex items-center justify-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <User className="h-5 w-5 text-green-500" />
                        <span className="text-sm">شخص</span>
                      </button>
                      <button className="flex items-center justify-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Briefcase className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm">نشاط</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Sample Post */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatar} />
                          <AvatarFallback>
                            {name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-gray-500">منذ ساعتين · <span className="text-blue-500">عام</span></p>
                        </div>
                      </div>
                      <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="my-3">هذا مثال لمنشور على الحائط. يمكنك مشاركة أفكارك، الصور، والفيديوهات مع أصدقائك هنا.</p>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                      <p className="text-gray-500">صورة أو محتوى منشور</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t dark:border-gray-700">
                      <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span>إعجاب</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        <span>تعليق</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <span>مشاركة</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* About Tab */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-4">الملف الشخصي</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>الاسم الكامل</Label>
                        {isEditing ? (
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{name}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>البريد الإلكتروني</Label>
                        <p className="mt-1">{user.email}</p>
                      </div>
                      
                      <div>
                        <Label>المسمى الوظيفي</Label>
                        {isEditing ? (
                          <Input
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{jobTitle || "غير محدد"}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-4">معلومات الاتصال</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>البريد الإلكتروني</Label>
                        <p className="mt-1">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security Tab */}
              {activeTab === "security" && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-4">الأمان</h3>
                    <div>
                      <Label htmlFor="password">كلمة المرور الجديدة</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="أدخل كلمة مرور قوية"
                        required
                        minLength={8}
                        className="mt-2"
                      />
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "h-2 w-full rounded-full",
                              password.length >= 8
                                ? "bg-green-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            )}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            8+ أحرف
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "h-2 w-full rounded-full",
                              /[A-Z]/.test(password) && /[a-z]/.test(password)
                                ? "bg-green-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            )}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            أحرف كبيرة وصغيرة
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "h-2 w-full rounded-full",
                              /\d/.test(password)
                                ? "bg-green-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            )}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            أرقام
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "h-2 w-full rounded-full",
                              /[^A-Za-z0-9]/.test(password)
                                ? "bg-green-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            )}
                          ></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            رموز خاصة
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading || !password}>
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          جاري التحديث...
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          تغيير كلمة المرور
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;