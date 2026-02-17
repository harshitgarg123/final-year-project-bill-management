import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { ChangePassword } from './pages/ChangePassword';
import { MyDetails } from './pages/MyDetails';
import { UploadBill } from './pages/client/UploadBill';
import { MyBills } from './pages/client/MyBills';
import { AdminBills } from './pages/admin/AdminBills';
import { ManageUsers } from './pages/manager/ManageUsers';
import { AllBills } from './pages/manager/AllBills';
import { Login } from './pages/Login';

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="my-details" element={<MyDetails />} />

            {/* Client Routes */}
            <Route path="bills/upload" element={<ProtectedRoute roles={['CLIENT']}><UploadBill /></ProtectedRoute>} />
            <Route path="bills/my" element={<ProtectedRoute roles={['CLIENT']}><MyBills /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="bills/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminBills /></ProtectedRoute>} />

            {/* Manager Routes */}
            <Route path="users" element={<ProtectedRoute roles={['MANAGER']}><ManageUsers /></ProtectedRoute>} />
            <Route path="bills/all" element={<ProtectedRoute roles={['MANAGER']}><AllBills /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
