# إصلاح مشكلة Firebase Storage CORS

## المشكلة:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' has been blocked by CORS policy
```

## الحلول:

### 1. إعداد قواعد Firebase Storage (الحل الموصى به):

1. انتقل إلى Firebase Console
2. اختر مشروعك -> Storage -> Rules
3. استبدل القواعد الحالية بهذه:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // السماح بالقراءة والكتابة للمستخدمين المصادق عليهم
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
    
    // السماح برفع الصور في مجلد sales-reps
    match /sales-reps/{imageId} {
      allow read, write: if request.auth != null 
        && resource.contentType.matches('image/.*')
        && resource.size < 2 * 1024 * 1024; // حد أقصى 2MB
    }
  }
}
```

### 2. إعداد CORS في مشروع Firebase (حل بديل):

قم بإنشاء ملف `cors.json`:

```json
[
  {
    "origin": ["http://localhost:8082", "https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

ثم قم بتشغيل:
```bash
gsutil cors set cors.json gs://your-bucket-name.appspot.com
```

### 3. التحقق من إعدادات المشروع:

1. تأكد من تفعيل Authentication في Firebase
2. تأكد من تفعيل Storage في Firebase
3. تحقق من أن المستخدم مسجل دخول قبل رفع الصور

### 4. حل بديل مؤقت - استخدام Base64:

إذا استمرت المشكلة، يمكن تخزين الصور كـ Base64 في Firestore بدلاً من Storage:

```typescript
// في حالة الطوارئ - تحويل إلى Base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
```

## ملاحظات مهمة:

1. **الأمان**: تأكد من أن قواعد Storage محدودة للمستخدمين المصادق عليهم فقط
2. **الحجم**: احتفظ بحد أقصى 2MB للصور
3. **النوع**: اقبل صور JPG و PNG فقط
4. **النظافة**: امحو الصور القديمة عند حذف المندوبين

## الحل السريع:

أسهل حل هو تحديث قواعد Firebase Storage للسماح بالوصول للمستخدمين المصادق عليهم.
