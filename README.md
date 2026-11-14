# متجري برو | Matjari Pro

واجهة عربية RTL أولية لنظام نقطة بيع وإدارة متجر، مبنية بـ React وTypeScript وVite، مع إعداد Firebase Web وملفات PWA.

## الحالة الحالية

- صفحة تسجيل الدخول بالبريد وكلمة المرور، مع إرسال رابط استعادة كلمة المرور.
- شاشة لوحة تحكم أولية وشاشة نقطة بيع متجاوبة مستوحاة من صورة AliPOS المرجعية.
- شاشة نقطة البيع تستخدم منتجات تجريبية داخل الذاكرة فقط. لا تحفظ مبيعات أو منتجات في Firebase حتى الآن.
- فحص صلاحية مدير المنصة من مستند `admins/{uid}`؛ يمكن للحساب قراءة مستنده فقط ولا يمكن لأي عميل إنشاء أدوار أو تعديلها.
- قواعد Firestore تسمح بقراءة مستند المدير الشخصي فقط، وترفض كل قراءة وكتابة أخرى إلى أن تكتمل قواعد المتاجر.
- إنشاء حسابات المتاجر، أدوار مدير المنصة/صاحب المتجر/الكاشير، الاشتراكات، والفصل بين بيانات المتاجر لم تُنفذ بعد.
- ملفات PWA وأيقونة SVG موجودة. عامل الخدمة يسجل في نسخة الإنتاج فقط؛ يلزم HTTPS لتثبيت التطبيق خارج localhost.

## تفعيل أول مدير منصة

1. أنشئ المستخدم يدويًا في Firebase Authentication.
2. انشر قواعد `firestore.rules` من Firebase Console.
3. في Firestore Console أنشئ `admins/{uid}` بمعرّف UID الخاص بالمستخدم، والحقول `role: "super_admin"` و`active: true` و`email`.

قواعد Firestore تمنع أي كتابة من المتصفح إلى مجموعة `admins`؛ إنشاء سجل المدير يتم من Firebase Console أو خدمة موثوقة فقط.

## المتطلبات

- Node.js 20 أو أحدث.
- مشروع Firebase مع تفعيل Email/Password في Authentication وإنشاء Cloud Firestore.

## التشغيل على Windows

افتح PowerShell في مجلد المشروع ثم نفّذ:

```powershell
npm.cmd install
Copy-Item .env.example .env.local
```

افتح `.env.local` وأدخل إعدادات تطبيق Firebase Web لديك. لا ترفع `.env.local` إلى GitHub؛ الملف مستثنى في `.gitignore`.

ثم شغّل:

```powershell
npm.cmd run dev
```

افتح الرابط المحلي الذي يظهر في الطرفية.

## البناء والنشر

```powershell
npm.cmd run build
npm.cmd run preview
```

ملفات الموقع الناتجة توضع في `dist/`. قبل نشر نسخة عامة، أكمل أدوار المستخدمين وقواعد Firestore متعددة المتاجر، واختبر عمليات البيع والحسابات على قاعدة تجريبية.

## رفعه إلى GitHub

1. أنشئ مستودعًا جديدًا باسم `matjari-pro` على GitHub.
2. ارفع محتويات هذا المجلد إلى المستودع (مع تضمين الملفات المخفية مثل `.gitignore` و`.env.example`).
3. لا ترفع `node_modules/` أو `dist/` أو `.env.local`.
4. إذا أعددت GitHub Actions أو استضافة لاحقًا، أضف متغيرات Firebase في إعدادات الأسرار/متغيرات المستودع بدل وضعها في الكود.

### النشر على GitHub Pages

المشروع مضبوط لمسار المستودع `https://ah1310.github.io/matjari-pro/`.

1. ارفع مجلدات `src/` و`public/` و`.github/` كما هي، ولا ترفع الملفات التي بداخلها إلى جذر المستودع. ارفع معها ملفات الجذر مثل `package.json` و`index.html` و`vite.config.ts`.
2. من **Settings → Pages** اختار **GitHub Actions** كمصدر للنشر.
3. بعد كل دفع إلى فرع `main`، يقوم ملف `.github/workflows/deploy.yml` ببناء الموقع ونشره. إعدادات Firebase Web موجودة في `src/firebase.ts` لأن إعداد الويب عام؛ لا تضف Service Account أو Admin SDK credentials إلى المستودع.

## ملاحظات أمنية

- قيم Firebase Web config ليست بديلًا عن الحماية؛ يجب أن تعتمد حماية البيانات على Authentication وقواعد Firestore.
- قواعد Firestore الحالية ترفض كل القراءة والكتابة عمدًا. لا تفتح القواعد قبل تنفيذ عزل `storeId` والتحقق من الأدوار في القواعد.
- لا تضع Service Account أو Firebase Admin SDK credentials في تطبيق المتصفح أو في مستودع GitHub.
