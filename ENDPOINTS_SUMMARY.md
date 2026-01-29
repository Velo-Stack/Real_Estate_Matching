# ملخص شامل لجميع API Endpoints في النظام

## جدول المحتويات
1. [Authentication (المصادقة)](#authentication-المصادقة)
2. [Offers (العروض)](#offers-العروض)
3. [Requests (الطلبات)](#requests-الطلبات)
4. [Matches (المطابقات)](#matches-المطابقات)
5. [Users (المستخدمون)](#users-المستخدمون)
6. [Notifications (التنبيهات)](#notifications-التنبيهات)
7. [Dashboard (لوحة التحكم)](#dashboard-لوحة-التحكم)
8. [Audit Logs (سجلات التدقيق)](#audit-logs-سجلات-التدقيق)
9. [Reports (التقارير)](#reports-التقارير)

---

## Authentication (المصادقة)

### 1. تسجيل الدخول
**المسار:** `POST /auth/login`
- **الدور المسموح به:** جميع المستخدمين
- **الوصف:** تسجيل الدخول وللحصول على JWT Token

**البيانات المرسلة (Request Body):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**البيانات المستقبلة (Response):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Ahmed",
    "email": "user@example.com",
    "role": "BROKER"
  }
}
```

**رموز الحالة:**
- `200 OK` - تسجيل دخول ناجح
- `401 Unauthorized` - بيانات اعتماد غير صحيحة

---

### 2. الحصول على بيانات المستخدم الحالي
**المسار:** `GET /auth/me`
- **الدور المسموح به:** جميع المستخدمين (يتطلب Authentication)
- **الوصف:** الحصول على بيانات المستخدم المسجل الدخول

**البيانات المستقبلة (Response):**
```json
{
  "id": 1,
  "name": "Ahmed",
  "email": "user@example.com",
  "role": "BROKER"
}
```

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح

---

## Offers (العروض)

### 1. إنشاء عرض جديد
**المسار:** `POST /offers`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** إنشاء عرض عقاري جديد

**البيانات المرسلة (Request Body):**
```json
{
  "type": "VILLA",
  "usage": "RESIDENTIAL",
  "landStatus": "OWNED",
  "city": "Cairo",
  "district": "Maadi",
  "areaFrom": 100,
  "areaTo": 200,
  "priceFrom": 500000,
  "priceTo": 1000000,
  "exclusivity": true,
  "description": "Beautiful villa with garden",
  "coordinates": "30.0444,31.2357"
}
```

**البيانات المستقبلة (Response):**
```json
{
  "id": 1,
  "type": "VILLA",
  "usage": "RESIDENTIAL",
  "landStatus": "OWNED",
  "city": "Cairo",
  "district": "Maadi",
  "areaFrom": 100,
  "areaTo": 200,
  "priceFrom": 500000,
  "priceTo": 1000000,
  "exclusivity": true,
  "description": "Beautiful villa with garden",
  "coordinates": "30.0444,31.2357",
  "createdById": 1,
  "createdAt": "2025-01-29T10:00:00Z"
}
```

**رموز الحالة:**
- `201 Created` - تم الإنشاء بنجاح
- `401 Unauthorized` - غير مصرح

---

### 2. الحصول على جميع العروض
**المسار:** `GET /offers`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** الحصول على قائمة بجميع العروض مع إمكانية التصفية

**معاملات الاستعلام (Query Parameters):**
| المعامل | النوع | الوصف |
|--------|------|-------|
| `type` | string | نوع العقار (VILLA, APARTMENT, LAND, etc.) |
| `usage` | string | الاستخدام (RESIDENTIAL, COMMERCIAL, etc.) |
| `city` | string | المدينة |
| `district` | string | الحي |
| `minPrice` | number | الحد الأدنى للسعر |
| `maxPrice` | number | الحد الأقصى للسعر |
| `minArea` | number | الحد الأدنى للمساحة |
| `maxArea` | number | الحد الأقصى للمساحة |
| `brokerId` | integer | البحث برقم الوسيط |

**مثال على الاستعلام:**
```
GET /offers?city=Cairo&minPrice=500000&maxPrice=1000000&type=VILLA
```

**البيانات المستقبلة (Response):**
```json
[
  {
    "id": 1,
    "type": "VILLA",
    "usage": "RESIDENTIAL",
    "city": "Cairo",
    "priceFrom": 500000,
    "priceTo": 1000000,
    "areaFrom": 100,
    "areaTo": 200,
    "createdBy": {
      "id": 1,
      "name": "Ahmed",
      "role": "BROKER"
    },
    "createdAt": "2025-01-29T10:00:00Z"
  }
]
```

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح

---

### 3. تحديث عرض
**المسار:** `PUT /offers/:id`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER (الوسيط يمكنه تحديث عروضه فقط)
- **الوصف:** تحديث بيانات عرض موجود

**معاملات المسار (Path Parameters):**
- `id` (integer) - رقم العرض

**البيانات المرسلة (Request Body):**
```json
{
  "type": "VILLA",
  "usage": "RESIDENTIAL",
  "city": "Cairo",
  "priceFrom": 550000,
  "priceTo": 1100000
}
```

**رموز الحالة:**
- `200 OK` - تم التحديث بنجاح
- `403 Forbidden` - لا يمكن تحديث عروض الآخرين (للوسيط)
- `404 Not Found` - العرض غير موجود

---

### 4. حذف عرض
**المسار:** `DELETE /offers/:id`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER (الوسيط يمكنه حذف عروضه فقط)
- **الوصف:** حذف عرض من النظام

**معاملات المسار (Path Parameters):**
- `id` (integer) - رقم العرض

**البيانات المستقبلة (Response):**
```json
{
  "message": "Offer deleted"
}
```

**رموز الحالة:**
- `200 OK` - تم الحذف بنجاح
- `403 Forbidden` - لا يمكن حذف عروض الآخرين
- `404 Not Found` - العرض غير موجود

---

## Requests (الطلبات)

### 1. إنشاء طلب جديد
**المسار:** `POST /requests`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** إنشاء طلب عقاري جديد

**البيانات المرسلة (Request Body):**
```json
{
  "type": "VILLA",
  "usage": "RESIDENTIAL",
  "landStatus": "OWNED",
  "city": "Cairo",
  "district": "Maadi",
  "areaFrom": 150,
  "areaTo": 250,
  "budgetFrom": 600000,
  "budgetTo": 900000,
  "priority": "HIGH"
}
```

**البيانات المستقبلة (Response):**
```json
{
  "id": 1,
  "type": "VILLA",
  "usage": "RESIDENTIAL",
  "landStatus": "OWNED",
  "city": "Cairo",
  "district": "Maadi",
  "areaFrom": 150,
  "areaTo": 250,
  "budgetFrom": 600000,
  "budgetTo": 900000,
  "priority": "HIGH",
  "createdById": 1,
  "createdAt": "2025-01-29T10:00:00Z"
}
```

**رموز الحالة:**
- `201 Created` - تم الإنشاء بنجاح
- `401 Unauthorized` - غير مصرح

---

### 2. الحصول على جميع الطلبات
**المسار:** `GET /requests`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** الحصول على قائمة بجميع الطلبات مع إمكانية التصفية

**معاملات الاستعلام (Query Parameters):**
| المعامل | النوع | الوصف |
|--------|------|-------|
| `type` | string | نوع العقار |
| `usage` | string | الاستخدام |
| `city` | string | المدينة |
| `district` | string | الحي |
| `minBudget` | number | الحد الأدنى للميزانية |
| `maxBudget` | number | الحد الأقصى للميزانية |
| `minArea` | number | الحد الأدنى للمساحة |
| `maxArea` | number | الحد الأقصى للمساحة |
| `priority` | string | الأولوية (HIGH, MEDIUM, LOW) |

**مثال على الاستعلام:**
```
GET /requests?city=Cairo&minBudget=600000&priority=HIGH
```

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح

---

### 3. تحديث طلب
**المسار:** `PUT /requests/:id`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER (الوسيط يمكنه تحديث طلباته فقط)
- **الوصف:** تحديث بيانات طلب موجود

**معاملات المسار (Path Parameters):**
- `id` (integer) - رقم الطلب

**البيانات المرسلة (Request Body):**
```json
{
  "budgetFrom": 650000,
  "budgetTo": 950000,
  "priority": "MEDIUM"
}
```

**رموز الحالة:**
- `200 OK` - تم التحديث بنجاح
- `403 Forbidden` - لا يمكن تحديث طلبات الآخرين
- `404 Not Found` - الطلب غير موجود

---

### 4. حذف طلب
**المسار:** `DELETE /requests/:id`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER (الوسيط يمكنه حذف طلباته فقط)
- **الوصف:** حذف طلب من النظام

**معاملات المسار (Path Parameters):**
- `id` (integer) - رقم الطلب

**البيانات المستقبلة (Response):**
```json
{
  "message": "Request deleted"
}
```

**رموز الحالة:**
- `200 OK` - تم الحذف بنجاح
- `403 Forbidden` - لا يمكن حذف طلبات الآخرين
- `404 Not Found` - الطلب غير موجود

---

## Matches (المطابقات)

### 1. الحصول على المطابقات
**المسار:** `GET /matches`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** الحصول على قائمة بالمطابقات التلقائية بين العروض والطلبات

**البيانات المستقبلة (Response):**
```json
[
  {
    "id": 1,
    "offerId": 1,
    "requestId": 1,
    "score": 85,
    "status": "NEW",
    "createdAt": "2025-01-29T10:00:00Z",
    "offer": {
      "id": 1,
      "type": "VILLA",
      "city": "Cairo",
      "priceFrom": 500000,
      "priceTo": 1000000,
      "user": {
        "name": "Ahmed",
        "email": "ahmed@example.com"
      }
    },
    "request": {
      "id": 1,
      "type": "VILLA",
      "city": "Cairo",
      "budgetFrom": 600000,
      "budgetTo": 900000,
      "user": {
        "name": "Mohamed",
        "email": "mohamed@example.com"
      }
    }
  }
]
```

**ملاحظة:** 
- BROKER يرى فقط المطابقات حيث يملك العرض أو الطلب
- ADMIN و MANAGER يرون جميع المطابقات

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح

---

### 2. تحديث حالة المطابقة
**المسار:** `PATCH /matches/:id`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** تحديث حالة المطابقة (تواصل تم، مفاوضات، إغلاق، إلخ)

**معاملات المسار (Path Parameters):**
- `id` (integer) - رقم المطابقة

**البيانات المرسلة (Request Body):**
```json
{
  "status": "CONTACTED"
}
```

**حالات المطابقة الممكنة:**
- `NEW` - جديد
- `CONTACTED` - تم الاتصال
- `NEGOTIATION` - قيد المفاوضات
- `CLOSED` - مغلق
- `REJECTED` - مرفوض

**رموز الحالة:**
- `200 OK` - تم التحديث بنجاح
- `404 Not Found` - المطابقة غير موجودة

---

## Users (المستخدمون)

### 1. إنشاء مستخدم جديد
**المسار:** `POST /users`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** إنشاء مستخدم جديد في النظام

**البيانات المرسلة (Request Body):**
```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "securePassword123",
  "role": "BROKER"
}
```

**ملاحظات الأدوار:**
- **ADMIN** - يمكنه إنشاء أي دور (ADMIN, MANAGER, BROKER)
- **MANAGER** - لا يمكنه إنشاء مستخدمين
- **BROKER** - يمكنه إنشاء مستخدمين فقط بدور BROKER

**البيانات المستقبلة (Response):**
```json
{
  "id": 2,
  "name": "Ali",
  "email": "ali@example.com",
  "role": "BROKER",
  "createdAt": "2025-01-29T10:00:00Z"
}
```

**رموز الحالة:**
- `201 Created` - تم الإنشاء بنجاح
- `400 Bad Request` - البريد الإلكتروني موجود بالفعل
- `401 Unauthorized` - غير مصرح

---

### 2. الحصول على جميع المستخدمين
**المسار:** `GET /users`
- **الدور المسموح به:** ADMIN, MANAGER فقط
- **الوصف:** الحصول على قائمة بجميع المستخدمين

**البيانات المستقبلة (Response):**
```json
[
  {
    "id": 1,
    "name": "Ahmed",
    "email": "ahmed@example.com",
    "role": "BROKER",
    "createdAt": "2025-01-29T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Ali",
    "email": "ali@example.com",
    "role": "BROKER",
    "createdAt": "2025-01-29T10:00:00Z"
  }
]
```

**رموز الحالة:**
- `200 OK` - النجاح
- `403 Forbidden` - غير مصرح (BROKER لا يمكنه الوصول)
- `401 Unauthorized` - لم يتم تسجيل الدخول

---

## Notifications (التنبيهات)

### 1. الحصول على التنبيهات
**المسار:** `GET /notifications`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** الحصول على التنبيهات الخاصة بالمستخدم الحالي

**البيانات المستقبلة (Response):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "status": "UNREAD",
    "createdAt": "2025-01-29T10:00:00Z",
    "match": {
      "id": 1,
      "offer": {
        "title": "Villa in Maadi",
        "type": "VILLA",
        "city": "Cairo",
        "priceFrom": 500000
      },
      "request": {
        "type": "VILLA",
        "city": "Cairo",
        "budgetFrom": 600000
      }
    }
  }
]
```

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح

---

### 2. تحديث حالة التنبيه
**المسار:** `PATCH /notifications/:id`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** تحديث حالة التنبيه (قراءة، أرشفة، إلخ)

**معاملات المسار (Path Parameters):**
- `id` (integer) - رقم التنبيه

**البيانات المرسلة (Request Body):**
```json
{
  "status": "READ"
}
```

**حالات التنبيه الممكنة:**
- `UNREAD` - غير مقروء
- `READ` - مقروء
- `ARCHIVED` - مؤرشف

**رموز الحالة:**
- `200 OK` - تم التحديث بنجاح
- `403 Forbidden` - لا يمكن تحديث تنبيهات الآخرين
- `404 Not Found` - التنبيه غير موجود

---

## Dashboard (لوحة التحكم)

### 1. الحصول على ملخص النظام
**المسار:** `GET /dashboard/summary`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** الحصول على ملخص إحصائي للنظام (عدد العروض، الطلبات، المطابقات)

**البيانات المستقبلة (Response):**
```json
{
  "offers": 45,
  "requests": 32,
  "matches": 120
}
```

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح

---

### 2. الحصول على أكثر الوسطاء نشاطاً
**المسار:** `GET /dashboard/top-brokers`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** الحصول على أفضل 5 وسطاء حسب عدد العروض المنشورة

**البيانات المستقبلة (Response):**
```json
[
  {
    "brokerId": 1,
    "name": "Ahmed",
    "count": 15
  },
  {
    "brokerId": 2,
    "name": "Ali",
    "count": 12
  },
  {
    "brokerId": 3,
    "name": "Mohamed",
    "count": 10
  }
]
```

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح

---

### 3. الحصول على أكثر المناطق طلباً
**المسار:** `GET /dashboard/top-areas`
- **الدور المسموح به:** ADMIN, MANAGER, BROKER
- **الوصف:** الحصول على أفضل 5 مدن حسب عدد العروض

**البيانات المستقبلة (Response):**
```json
[
  {
    "city": "Cairo",
    "_count": {
      "id": 25
    }
  },
  {
    "city": "Giza",
    "_count": {
      "id": 18
    }
  },
  {
    "city": "Alexandria",
    "_count": {
      "id": 12
    }
  }
]
```

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح

---

## Audit Logs (سجلات التدقيق)

### الحصول على سجلات التدقيق
**المسار:** `GET /audit-logs`
- **الدور المسموح به:** ADMIN, MANAGER فقط
- **الوصف:** الحصول على سجل بجميع العمليات التي تمت على النظام (إنشاء، تحديث، حذف)

**معاملات الاستعلام (Query Parameters):**
| المعامل | النوع | الوصف |
|--------|------|-------|
| `resource` | string | نوع المورد (Offer, Request, User) |
| `action` | string | نوع الإجراء (CREATE, UPDATE, DELETE) |
| `userId` | integer | رقم المستخدم الذي قام بالعملية |
| `startDate` | date | تاريخ البداية |
| `endDate` | date | تاريخ النهاية |
| `limit` | integer | عدد النتائج (افتراضي: 100) |

**مثال على الاستعلام:**
```
GET /audit-logs?resource=Offer&action=CREATE&limit=50
```

**البيانات المستقبلة (Response):**
```json
[
  {
    "id": 1,
    "resource": "Offer",
    "action": "CREATE",
    "userId": 1,
    "oldData": null,
    "newData": {
      "type": "VILLA",
      "city": "Cairo",
      "priceFrom": 500000
    },
    "createdAt": "2025-01-29T10:00:00Z",
    "user": {
      "id": 1,
      "name": "Ahmed",
      "email": "ahmed@example.com",
      "role": "BROKER"
    }
  }
]
```

**رموز الحالة:**
- `200 OK` - النجاح
- `401 Unauthorized` - غير مصرح
- `403 Forbidden` - لا يمكن للـ BROKER الوصول

---

## Reports (التقارير)

### 1. تصدير البيانات كملف Excel
**المسار:** `GET /reports/export/excel`
- **الدور المسموح به:** ADMIN, MANAGER فقط
- **الوصف:** تصدير البيانات (عروض، طلبات، مطابقات) كملف Excel

**معاملات الاستعلام (Query Parameters):**
| المعامل | النوع | الإجباري | الوصف |
|--------|------|---------|-------|
| `type` | string | ✓ | نوع البيانات (offers, requests, matches) |

**مثال على الاستعلام:**
```
GET /reports/export/excel?type=offers
```

**البيانات المستقبلة (Response):**
- ملف Excel Binary يتم تنزيله تلقائياً

**محتوى الملف حسب النوع:**

**1. عند `type=offers`:**
| العمود | الوصف |
|--------|--------|
| ID | رقم العرض |
| Type | نوع العقار |
| Usage | الاستخدام |
| City | المدينة |
| District | الحي |
| Price From | السعر من |
| Price To | السعر إلى |
| Area From | المساحة من |
| Area To | المساحة إلى |
| Broker | اسم الوسيط |
| Created At | تاريخ الإنشاء |

**2. عند `type=requests`:**
| العمود | الوصف |
|--------|--------|
| ID | رقم الطلب |
| Type | نوع العقار |
| Usage | الاستخدام |
| City | المدينة |
| Budget From | الميزانية من |
| Budget To | الميزانية إلى |
| Priority | الأولوية |
| Broker | اسم الوسيط |

**3. عند `type=matches`:**
| العمود | الوصف |
|--------|--------|
| ID | رقم المطابقة |
| Offer ID | رقم العرض |
| Request ID | رقم الطلب |
| Score | درجة المطابقة |
| Status | الحالة |
| Created At | تاريخ الإنشاء |

**رموز الحالة:**
- `200 OK` - تم التصدير بنجاح
- `401 Unauthorized` - غير مصرح
- `403 Forbidden` - لا يمكن للـ BROKER التصدير

---

### 2. تصدير البيانات كملف PDF
**المسار:** `GET /reports/export/pdf`
- **الدور المسموح به:** ADMIN, MANAGER فقط
- **الوصف:** تصدير البيانات (عروض، طلبات، مطابقات) كملف PDF

**معاملات الاستعلام (Query Parameters):**
| المعامل | النوع | الإجباري | الوصف |
|--------|------|---------|-------|
| `type` | string | ✓ | نوع البيانات (offers, requests, matches) |

**مثال على الاستعلام:**
```
GET /reports/export/pdf?type=matches
```

**البيانات المستقبلة (Response):**
- ملف PDF Binary يتم تنزيله تلقائياً

**رموز الحالة:**
- `200 OK` - تم التصدير بنجاح
- `401 Unauthorized` - غير مصرح
- `403 Forbidden` - لا يمكن للـ BROKER التصدير

---

## ملخص الأدوار والصلاحيات

| الـ Endpoint | ADMIN | MANAGER | BROKER |
|-------------|-------|---------|--------|
| POST /auth/login | ✓ | ✓ | ✓ |
| GET /auth/me | ✓ | ✓ | ✓ |
| POST /offers | ✓ | ✓ | ✓ |
| GET /offers | ✓ | ✓ | ✓ |
| PUT /offers/:id | ✓ | ✓ | ✓* |
| DELETE /offers/:id | ✓ | ✓ | ✓* |
| POST /requests | ✓ | ✓ | ✓ |
| GET /requests | ✓ | ✓ | ✓ |
| PUT /requests/:id | ✓ | ✓ | ✓* |
| DELETE /requests/:id | ✓ | ✓ | ✓* |
| GET /matches | ✓ | ✓ | ✓ |
| PATCH /matches/:id | ✓ | ✓ | ✓ |
| POST /users | ✓ | ✗ | ✗** |
| GET /users | ✓ | ✓ | ✗ |
| GET /notifications | ✓ | ✓ | ✓ |
| PATCH /notifications/:id | ✓ | ✓ | ✓ |
| GET /dashboard/summary | ✓ | ✓ | ✓ |
| GET /dashboard/top-brokers | ✓ | ✓ | ✓ |
| GET /dashboard/top-areas | ✓ | ✓ | ✓ |
| GET /audit-logs | ✓ | ✓ | ✗ |
| GET /reports/export/excel | ✓ | ✓ | ✗ |
| GET /reports/export/pdf | ✓ | ✓ | ✗ |

**ملاحظات:**
- `✓` = مصرح
- `✗` = غير مصرح
- `✓*` = يمكن تحديث/حذف عروضك أو طلباتك فقط
- `✓**` = يمكن فقط إنشاء مستخدمين بدور BROKER

---

## معايير المصادقة

جميع الـ endpoints (ما عدا `/auth/login`) تتطلب:
- **Header:** `Authorization: Bearer <JWT_TOKEN>`
- **صيغة الـ Token:** JWT Token بصلاحية مدة 24 ساعة
- **الحصول عليه:** من خلال endpoint `/auth/login`

---

## رموز الحالة الشاملة

| الرمز | الوصف |
|------|-------|
| 200 | OK - العملية نجحت |
| 201 | Created - تم الإنشاء بنجاح |
| 400 | Bad Request - طلب غير صحيح |
| 401 | Unauthorized - غير مصرح / لم يتم تسجيل الدخول |
| 403 | Forbidden - ممنوع الوصول |
| 404 | Not Found - المورد غير موجود |
| 500 | Internal Server Error - خطأ في الخادم |

---

**آخر تحديث:** 29 يناير 2025
