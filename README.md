# 🚀 Multi-Level Role-Based Bill Management System

A complete full-stack bill management application with JWT authentication, role-based access control, email automation, and pagination.

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Auth | JWT + bcrypt |
| Email | Nodemailer (SMTP) |
| File Upload | Multer |
| API | REST (JSON) |

---

## 🔹 User Roles

| Role | Permissions |
|------|------------|
| **CLIENT** | Upload bills, select admin, view own bills, update profile |
| **ADMIN** | View assigned bills, approve/reject with remarks |
| **MANAGER** | Manage users (CRUD), view all bills, filter by status/client/admin |

---

## ⚡ Quick Setup

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- npm

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema
source backend/config/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings:
# - DB_PASSWORD: Your MySQL password
# - JWT_SECRET: A strong random string
# - EMAIL_USER: Your Gmail address
# - EMAIL_PASS: Your Gmail App Password
# (Go to Google Account > Security > App passwords)

# Start the server
npm start
```

Server runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
# From project root
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔐 Default Login

After running the schema, a default manager account is created:

| Field | Value |
|-------|-------|
| Email | `manager@billsystem.com` |
| Password | `password` |
| Role | MANAGER |

> ⚠️ Change this password immediately after first login!

---

## 📧 Email Setup (Gmail)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords → Generate new app password
4. Use this 16-character password as `EMAIL_PASS` in `.env`

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Users (Manager Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create new user |
| GET | `/api/users?page=1&limit=10` | Get all users (paginated) |
| PUT | `/api/users/:id` | Edit user |
| PUT | `/api/users/status/:id` | Activate/Deactivate user |

### User Profile & Settings (All Roles)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/change-password` | Change own password |
| GET | `/api/users/my-details` | Get own additional details |
| PUT | `/api/users/my-details` | Update own additional details |
| GET | `/api/users/details/:id` | View user full profile (Manager/Admin) |

### Bills
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/bills/upload` | CLIENT | Upload new bill |
| GET | `/api/bills/client?page=1&limit=10` | CLIENT | Get own bills |
| GET | `/api/bills/admin?page=1&limit=10` | ADMIN | Get assigned bills |
| PUT | `/api/bills/:id/approve` | ADMIN | Approve bill |
| PUT | `/api/bills/:id/reject` | ADMIN | Reject bill |
| GET | `/api/bills/all?page=1&limit=10` | MANAGER | Get all bills |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get role-based statistics |

---

## 📁 Project Structure

```
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── schema.sql         # Database schema
│   ├── controllers/
│   │   ├── authController.js   # Login, forgot/reset password
│   │   ├── userController.js   # User CRUD operations
│   │   ├── billController.js   # Bill operations
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verify + role check
│   │   ├── upload.js          # Multer file upload
│   │   └── errorHandler.js    # Central error handler
│   ├── models/
│   │   ├── userModel.js       # User database queries
│   │   ├── billModel.js       # Bill database queries
│   │   └── passwordResetModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── billRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/
│   │   └── emailService.js    # Nodemailer email templates
│   ├── uploads/               # File upload directory
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   └── package.json
│
├── src/                       # React Frontend
│   ├── components/
│   │   ├── Layout.tsx         # Dashboard layout with sidebar
│   │   ├── Pagination.tsx     # Reusable pagination
│   │   └── ProtectedRoute.tsx # Route guard
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state management
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── client/
│   │   │   ├── UploadBill.tsx
│   │   │   └── MyBills.tsx
│   │   ├── admin/
│   │   │   └── AdminBills.tsx
│   │   └── manager/
│   │       ├── ManageUsers.tsx
│   │       └── AllBills.tsx
│   └── services/
│       └── api.ts             # Axios instance + interceptors
│
├── index.html
└── README.md
```

---

## 🔒 Security Features

- ✅ JWT authentication with expiry
- ✅ bcrypt password hashing (salt rounds: 10)
- ✅ Role-based middleware enforcement
- ✅ Parameterized SQL queries (SQL injection prevention)
- ✅ File type and size validation
- ✅ CORS configuration
- ✅ Environment variable secrets
- ✅ Token expiry for password resets (15 min)
- ✅ Input validation on all endpoints

---

## 📧 Email Automation

| Event | Recipient | Content |
|-------|-----------|---------|
| User created by Manager | New user | Credentials + login URL |
| Client uploads bill | Targeted admin | Bill details |
| Admin approves bill | Client | Approval status |
| Admin rejects bill | Client | Rejection + remarks |
| Password reset requested | User | Reset link (15 min expiry) |

---

## 🎯 For Final Year Viva

Key topics to prepare:
1. **MVC Architecture** - How controllers, models, and routes are separated
2. **JWT Flow** - Token generation, storage, verification, expiry
3. **Role-Based Access** - Middleware chain: authenticate → authorize
4. **SQL Pagination** - LIMIT/OFFSET queries with total count
5. **File Upload** - Multer storage, file validation, serving static files
6. **Email Service** - SMTP transport, HTML templates, async handling
7. **Password Security** - bcrypt hashing, salt rounds, reset token flow
8. **React Hooks** - useState, useEffect, useContext, useCallback
9. **Protected Routes** - Frontend route guards with role checking
10. **API Interceptors** - Axios request/response interceptors

---

© 2024 Bill Management System - Final Year Project
