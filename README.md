# 🍽️ Food Business Management

<p align="center">
  <strong>سیستم جامع مدیریت کسب‌وکار و حسابداری</strong>
</p>

<p align="center">
  یک پلتفرم Full-Stack برای مدیریت فروش، خرید، موجودی، محصولات، مشتریان، تأمین‌کنندگان و تحلیل مالی کسب‌وکار
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Django-6.1-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/DRF-3.18-A30000?style=for-the-badge&logo=django&logoColor=white" alt="Django REST Framework" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Recharts-Data%20Visualization-22C55E?style=for-the-badge" alt="Recharts" />
  <img src="https://img.shields.io/badge/REST%20API-Architecture-6366F1?style=for-the-badge" alt="REST API" />
</p>

<p align="center">
  <a href="#-معرفی">معرفی</a> •
  <a href="#-قابلیتها">قابلیت‌ها</a> •
  <a href="#-معماری">معماری</a> •
  <a href="#-تکنولوژیها">تکنولوژی‌ها</a> •
  <a href="#-راهاندازی">راه‌اندازی</a>
</p>

---

## 📌 معرفی

**Food Business Management** یک سیستم Full-Stack برای مدیریت کسب‌وکار است که Backend و Frontend آن در یک Repository قرار گرفته‌اند.

هدف پروژه ایجاد یک سیستم یکپارچه برای مدیریت چرخه‌های اصلی کسب‌وکار است:

```text
              Business Management
                      │
        ┌─────────────┼─────────────┐
        │             │             │
       Sales       Purchases     Inventory
        │             │             │
        └─────────────┼─────────────┘
                      │
             Accounting & Analytics
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    Customers      Suppliers      Reports
```

Backend وظیفه مدیریت **Business Logic، Authentication، داده‌ها و REST API** را بر عهده دارد و Frontend یک داشبورد مدیریتی مدرن برای تعامل با این API فراهم می‌کند.

ساختار Repository نیز این تفکیک را به‌صورت واضح نشان می‌دهد:

```text
food-business-management/
├── apps/       # Django Backend
├── config/     # Django Configuration
├── frontend/   # Next.js Frontend
├── manage.py
└── requirements.txt
```

این ساختار در Repository فعلی پروژه وجود دارد.

---

# 🎯 هدف پروژه

این پروژه با هدف ساخت یک سیستم واقعی‌تر از یک CRUD ساده طراحی شده است.

تمرکز اصلی روی پیاده‌سازی:

* مدیریت عملیات کسب‌وکار
* طراحی Domainهای مستقل
* RESTful API
* Authentication و Authorization
* مدیریت موجودی
* فروش و خرید
* حسابداری
* گزارش‌های مدیریتی
* Dashboard و Analytics
* Pagination
* Filtering
* Searching
* Ordering
* مدیریت خطا
* Type Safety در Frontend
* طراحی Responsive و RTL

است.

---

# ✨ قابلیت‌ها

## 📊 Dashboard

داشبورد به‌عنوان مرکز کنترل سیستم طراحی شده است.

### اطلاعات قابل مشاهده

* فروش
* سود
* محصولات پرفروش
* وضعیت موجودی
* سفارش‌های اخیر
* بینش‌های کسب‌وکار
* خلاصه مالی
* مشتریان
* تأمین‌کنندگان
* انتخاب بازه زمانی

Dashboard به‌صورت یک Domain مستقل در Backend نیز سازمان‌دهی شده است.

---

# 🧾 Sales Management

ماژول فروش برای مدیریت چرخه فروش طراحی شده است.

### قابلیت‌ها

* مدیریت سفارش‌ها
* اطلاعات مشتری
* محصولات سفارش
* محاسبه مبالغ
* وضعیت سفارش
* گزارش فروش
* تحلیل عملکرد فروش

ساختار Backend برای Sales به‌صورت یک Django App مستقل پیاده‌سازی شده است.

---

# 🛒 Purchase Management

ماژول خرید مسئول مدیریت خریدهای کسب‌وکار است.

### قابلیت‌ها

* ثبت خرید
* مدیریت خریدها
* ارتباط با تأمین‌کنندگان
* مدیریت اقلام خرید
* تأثیر خرید بر موجودی
* گزارش‌های خرید

---

# 📦 Inventory Management

یکی از بخش‌های اصلی سیستم، مدیریت موجودی است.

### قابلیت‌ها

* مدیریت موجودی
* مواد اولیه
* حداقل موجودی
* وضعیت موجودی
* تراکنش‌های موجودی
* تشخیص Low Stock
* تشخیص Out of Stock
* نیاز به تأمین
* گزارش موجودی
* مدیریت واحدهای اندازه‌گیری

---

## 🧂 Ingredients

سیستم امکان مدیریت مواد اولیه را فراهم می‌کند:

* ایجاد ماده اولیه
* ویرایش
* مشاهده جزئیات
* موجودی فعلی
* حداقل موجودی
* واحد پایه
* وضعیت تأمین

---

# 🧪 Products & Recipes

مدیریت محصولات و دستور ساخت:

* محصولات
* مواد اولیه
* دستور ساخت
* ارتباط محصولات و مواد اولیه
* محاسبه نیاز مواد اولیه
* مدیریت اطلاعات تولید

---

# 👥 Customers

مدیریت مشتریان شامل:

* ایجاد مشتری
* ویرایش
* مشاهده جزئیات
* تراکنش‌های مشتری
* مانده حساب
* سابقه فعالیت
* تحلیل مشتریان

---

# 🏢 Suppliers

مدیریت تأمین‌کنندگان:

* ایجاد تأمین‌کننده
* ویرایش
* مشاهده جزئیات
* تراکنش‌ها
* مانده حساب
* خریدهای مرتبط

---

# 📚 Accounting

پروژه دارای یک Domain مستقل برای Accounting است و حسابداری را از سایر بخش‌های Business Logic جدا نگه می‌دارد.

این بخش برای مدیریت اطلاعات مالی و ارتباط آن با عملیات کسب‌وکار طراحی شده است.

ساختار Backend شامل App مستقل `accounting` است.

---

# 📈 Business Analytics

بخش Reports یکی از قسمت‌های مهم سیستم است.

گزارش‌ها در چند Domain اصلی ارائه می‌شوند:

```text
Reports
├── Sales
├── Purchases
├── Profitability
├── Inventory
├── Customers
└── Suppliers
```

### Sales Analytics

* مجموع فروش
* میانگین فروش
* روند فروش
* بهترین روز فروش
* محصولات پرفروش

### Purchase Analytics

* مجموع خرید
* روند خرید
* اقلام پرمصرف
* تحلیل خرید

### Profitability Analytics

* سود
* حاشیه سود
* روند سودآوری
* محصولات سودآور

### Inventory Analytics

* وضعیت موجودی
* اقلام کم‌موجود
* اقلام ناموجود
* نیازهای تأمین

### Customer Analytics

* تعداد مشتریان
* مشتریان برتر
* فروش مشتریان
* مانده حساب

### Supplier Analytics

* تعداد تأمین‌کنندگان
* تأمین‌کنندگان برتر
* خرید از تأمین‌کنندگان
* مانده حساب

Backend نیز یک App مستقل برای `reports` دارد.

---

# 🔐 Authentication & Security

سیستم Authentication بر پایه JWT طراحی شده است.

Backend از:

* Custom User Model
* JWT Authentication
* Access Token
* Refresh Token
* Token Blacklisting
* Permission System

استفاده می‌کند.

Authentication سفارشی پروژه نیز در `apps.accounts` قرار گرفته و تنظیمات DRF از یک Authentication Class سفارشی استفاده می‌کند.

### Token Lifecycle

```text
              Login
                │
                ▼
        Access + Refresh
                │
                ▼
        Authenticated API
                │
          ┌─────┴─────┐
          │           │
        Valid        401
          │           │
          ▼           ▼
        Data       Refresh
                      │
                ┌─────┴─────┐
                │           │
              Success      Fail
                │           │
                ▼           ▼
             Retry       Logout
```

---

# 🏗️ معماری سیستم

معماری کلی پروژه به شکل Client / API طراحی شده است:

```text
┌───────────────────────────────────────┐
│             Next.js Frontend          │
│                                       │
│  Dashboard • Forms • Tables • Charts  │
│  React • TypeScript • shadcn/ui       │
└──────────────────┬────────────────────┘
                   │
                   │ REST API
                   ▼
┌───────────────────────────────────────┐
│          Django REST Framework        │
│                                       │
│ Authentication • Business Logic       │
│ Serializers • Views • Filters         │
│ Pagination • Exceptions • Reports     │
└──────────────────┬────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────┐
│               Database                │
│                SQLite                 │
└───────────────────────────────────────┘
```

Backend از DRF برای Authentication، Pagination، Filtering، Search، Ordering و OpenAPI Schema استفاده می‌کند.

---

# 🧩 Backend Architecture

Backend بر اساس Domainهای کسب‌وکار به چند Django App تقسیم شده است:

```text
apps/
├── accounts/
├── organizations/
├── inventory/
├── products/
├── purchases/
├── sales/
├── accounting/
├── reports/
├── dashboard/
└── core/
```

این ساختار باعث می‌شود هر بخش مسئولیت مشخصی داشته باشد و اضافه کردن Domainهای جدید ساده‌تر باشد. ساختار فعلی Repository همین تفکیک را نشان می‌دهد.

---

# 🌐 REST API

API پروژه با **Django REST Framework** ساخته شده است.

### قابلیت‌های API

* RESTful Endpoints
* JWT Authentication
* Pagination
* Filtering
* Searching
* Ordering
* Standardized Responses
* Custom Exception Handling
* OpenAPI Schema

DRF در تنظیمات پروژه از `DjangoFilterBackend`، `SearchFilter`، `OrderingFilter` و `drf-spectacular` استفاده می‌کند.

---

# 📖 API Documentation

پروژه برای تولید OpenAPI Schema از:

```text
drf-spectacular
```

استفاده می‌کند.

عنوان API نیز به‌صورت:

```text
Business Management API
```

تنظیم شده است.

---

# 💻 Frontend

Frontend پروژه با Next.js ساخته شده و داخل مسیر:

```text
frontend/
```

قرار دارد.

### Stack

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS 4
* shadcn/ui
* Recharts
* Lucide React
* React Multi Date Picker

نسخه‌ها و Dependencyهای فعلی از `frontend/package.json` استخراج شده‌اند.

---

# 🎨 Frontend Design System

رابط کاربری با هدف ایجاد یک داشبورد مدیریتی حرفه‌ای طراحی شده است.

اصول طراحی:

* Minimal UI
* Professional Dashboard
* Responsive Design
* RTL
* Persian UI
* Neutral Color Palette
* Semantic Colors
* Consistent Spacing
* Reusable Components
* Accessible UI

برای Componentهای UI از **shadcn/ui** و برای Visualization از **Recharts** استفاده شده است.

---

# 📊 Data Visualization

برای نمایش داده‌های تحلیلی از **Recharts** استفاده شده است.

نمودارها برای بخش‌هایی مانند:

* Sales
* Purchases
* Profitability
* Business Analytics

طراحی شده‌اند.

هدف این بخش فقط نمایش داده خام نیست؛ بلکه تبدیل داده‌های عملیاتی به اطلاعات قابل استفاده برای تصمیم‌گیری است.

---

# 🔄 Frontend ↔ Backend Flow

```text
User
 │
 ▼
Next.js Page
 │
 ▼
React Component
 │
 ▼
API Service
 │
 ▼
HTTP Request
 │
 ▼
Django REST Framework
 │
 ▼
Serializer
 │
 ▼
Business Logic
 │
 ▼
Database
 │
 ▼
API Response
 │
 ▼
Frontend State
 │
 ▼
UI
```

این جداسازی باعث می‌شود UI مستقیماً به Business Logic وابسته نباشد.

---

# 📁 ساختار Repository

```text
food-business-management/
│
├── apps/
│   ├── accounts/
│   ├── accounting/
│   ├── core/
│   ├── dashboard/
│   ├── inventory/
│   ├── organizations/
│   ├── products/
│   ├── purchases/
│   ├── reports/
│   └── sales/
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── components.json
│
├── manage.py
├── requirements.txt
└── .gitignore
```

---

# 🛠️ Tech Stack

## Backend

| Technology                     | Purpose              |
| ------------------------------ | -------------------- |
| **Python**                     | Backend Language     |
| **Django 6.1**                 | Web Framework        |
| **Django REST Framework 3.18** | REST API             |
| **Simple JWT**                 | Authentication       |
| **django-filter**              | Filtering            |
| **drf-spectacular**            | OpenAPI / API Schema |
| **SQLite**                     | Development Database |

نسخه‌های Django و DRF از `requirements.txt` فعلی Repository استخراج شده‌اند.

## Frontend

| Technology         | Purpose            |
| ------------------ | ------------------ |
| **Next.js 16**     | Web Framework      |
| **React 19**       | UI                 |
| **TypeScript**     | Type Safety        |
| **Tailwind CSS 4** | Styling            |
| **shadcn/ui**      | UI Components      |
| **Recharts**       | Data Visualization |
| **Lucide React**   | Icons              |

---

# ⚙️ API Configuration

Backend API در محیط توسعه روی Django اجرا می‌شود.

نمونه:

```text
http://localhost:8000/api/
```

Frontend باید به API Backend متصل شود.

در محیط Production توصیه می‌شود URLهای API از طریق Environment Variables مدیریت شوند.

---

# 🚀 راه‌اندازی Backend

## 1. Clone

```bash
git clone https://github.com/ronin1777/food-business-management.git
```

```bash
cd food-business-management
```

---

## 2. ساخت Virtual Environment

### Windows

```powershell
python -m venv .venv
```

فعال‌سازی:

```powershell
.venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

---

## 3. نصب Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. اجرای Migration

```bash
python manage.py migrate
```

---

## 5. اجرای Backend

```bash
python manage.py runserver
```

Backend به‌صورت پیش‌فرض روی:

```text
http://127.0.0.1:8000/
```

در دسترس خواهد بود.

---

# 🚀 راه‌اندازی Frontend

وارد پوشه Frontend شوید:

```bash
cd frontend
```

Dependencies:

```bash
npm install
```

Development Server:

```bash
npm run dev
```

سپس:

```text
http://localhost:3000
```

را در مرورگر باز کنید.

Frontend فعلی دارای Scriptهای `dev`، `build`، `start` و `lint` است.

---

# 🏭 Production Build

برای ساخت نسخه Production:

```bash
npm run build
```

سپس:

```bash
npm run start
```

---

# 🧪 Development Workflow

الگوی پیشنهادی توسعه Featureهای جدید:

```text
1. Define Domain
        ↓
2. Backend Model
        ↓
3. Serializer
        ↓
4. API View
        ↓
5. URL / Endpoint
        ↓
6. Frontend API Service
        ↓
7. Type Definition
        ↓
8. UI Components
        ↓
9. Page Integration
        ↓
10. Error / Loading / Empty States
```

این ساختار باعث می‌شود Featureها به‌صورت مرحله‌ای و قابل نگهداری توسعه پیدا کنند.

---

# 📊 وضعیت پروژه

### Backend

* [x] Django Project Setup
* [x] Django REST Framework
* [x] Custom User Model
* [x] JWT Authentication
* [x] Organizations
* [x] Products
* [x] Inventory
* [x] Purchases
* [x] Sales
* [x] Accounting
* [x] Dashboard
* [x] Reports
* [x] Filtering
* [x] Searching
* [x] Ordering
* [x] Pagination
* [x] API Exception Handling
* [x] OpenAPI Schema

### Frontend

* [x] Next.js
* [x] React
* [x] TypeScript
* [x] Tailwind CSS
* [x] shadcn/ui
* [x] Dashboard
* [x] Customers
* [x] Suppliers
* [x] Products
* [x] Ingredients
* [x] Inventory
* [x] Orders
* [x] Purchases
* [x] Reports
* [x] Analytics
* [x] RTL
* [x] Persian UI
* [x] Loading States
* [x] Error States
* [x] Empty States
* [x] Responsive UI

---

# 🔮 Roadmap

قابلیت‌هایی که می‌توانند در نسخه‌های آینده توسعه پیدا کنند:

* [ ] PostgreSQL Production Setup
* [ ] Docker / Docker Compose
* [ ] CI/CD Pipeline
* [ ] Automated Testing
* [ ] API Rate Limiting
* [ ] Advanced Audit Logging
* [ ] Advanced Permissions / RBAC
* [ ] Background Jobs
* [ ] Redis Integration
* [ ] Real-time Notifications
* [ ] Advanced Financial Reports
* [ ] Export Reports
* [ ] Production Deployment
* [ ] Automated Database Backups

---

# 🧠 Engineering Principles

در توسعه پروژه، تمرکز اصلی روی این اصول بوده است:

### Separation of Concerns

Business Logic، API و UI تا حد امکان از یکدیگر جدا نگه داشته شده‌اند.

### Domain-Oriented Structure

هر بخش اصلی کسب‌وکار به‌عنوان یک Domain مستقل سازمان‌دهی شده است.

### Type Safety

Frontend با TypeScript توسعه داده شده تا قرارداد داده بین UI و API قابل کنترل باشد.

### Reusable Components

Componentهای مشترک در لایه UI به‌صورت reusable طراحی شده‌اند.

### Centralized API Handling

ارتباط Frontend با Backend از طریق API Layer مدیریت می‌شود.

### Consistent UX

صفحات مختلف از الگوهای یکسان برای:

* Loading
* Error
* Empty
* Filtering
* Pagination
* Forms
* Tables

استفاده می‌کنند.

---

# 🔗 پروژه موبایل

این Backend و Web Dashboard، بخش مرکزی اکوسیستم **Business Management** هستند.

نسخه موبایل پروژه نیز به‌صورت یک Repository مستقل توسعه داده شده است:

**Business Management Mobile**

```text
Business Management Ecosystem
│
├── 🖥️ Web Dashboard
│      Next.js + React + TypeScript
│
├── 📱 Mobile App
│      React Native + Expo + TypeScript
│
└── ⚙️ Backend API
       Django + DRF
```

---

# 👨‍💻 توسعه‌دهنده

**Hossein Sayah**

Full-Stack Developer

### تخصص‌ها

```text
Backend
├── Python
├── Django
└── Django REST Framework

Frontend
├── React
├── Next.js
└── TypeScript

Mobile
└── React Native
```

---

## ⭐ Support

اگر پروژه برایتان جالب بود، می‌توانید Repository را ⭐ Star کنید.

---

## 📄 License

این پروژه یک پروژه شخصی و Portfolio است.
