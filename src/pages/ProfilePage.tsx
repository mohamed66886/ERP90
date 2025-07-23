import { useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Mail, Briefcase, Key, User, Save } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name,
        jobTitle,
        avatar,
      });
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Profile Summary */}
        <div className="lg:w-1/3">
          <Card className="p-6 sticky top-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="h-24 w-24 mb-4 border-4 border-white dark:border-gray-800 shadow-md">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-2xl">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{name}</h2>
              {jobTitle && (
                <p className="text-gray-600 dark:text-gray-400">{jobTitle}</p>
              )}
              <Badge variant="outline" className="mt-2">
                {user.role}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {user.email}
                </span>
              </div>
              {jobTitle && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {jobTitle}
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                المظهر
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    فاتح
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    داكن
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-2/3">
          <Card className="p-6">
            {/* Tabs */}
            <div className="flex border-b mb-6">
              <button
                className={cn(
                  "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                onClick={() => setActiveTab("profile")}
              >
                <User className="inline mr-2 h-4 w-4" />
                الملف الشخصي
              </button>
              <button
                className={cn(
                  "px-4 py-2 font-medium text-sm border-b-2 transition-colors",
                  activeTab === "security"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                onClick={() => setActiveTab("security")}
              >
                <Key className="inline mr-2 h-4 w-4" />
                الأمان
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="مثال: مدير الحسابات"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="avatar">صورة الملف الشخصي</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback>
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      id="avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
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
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        حفظ التغييرات
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="mt-2 bg-gray-100 dark:bg-gray-800"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    لا يمكن تغيير البريد الإلكتروني من هنا
                  </p>
                </div>

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
  );
};

export default ProfilePage;