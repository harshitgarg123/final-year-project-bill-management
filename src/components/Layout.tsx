import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  Receipt,
  ShieldCheck,
  IdCard,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['CLIENT', 'ADMIN', 'MANAGER'] },
  { label: 'Upload Bill', path: '/bills/upload', icon: <Upload size={20} />, roles: ['CLIENT'] },
  { label: 'My Bills', path: '/bills/my', icon: <FileText size={20} />, roles: ['CLIENT'] },
  { label: 'Assigned Bills', path: '/bills/admin', icon: <ClipboardList size={20} />, roles: ['ADMIN'] },
  { label: 'All Bills', path: '/bills/all', icon: <Receipt size={20} />, roles: ['MANAGER'] },
  { label: 'Manage Users', path: '/users', icon: <Users size={20} />, roles: ['MANAGER'] },
  { label: 'Profile', path: '/profile', icon: <User size={20} />, roles: ['CLIENT', 'ADMIN', 'MANAGER'] },
  { label: 'My Details', path: '/my-details', icon: <IdCard size={20} />, roles: ['CLIENT', 'ADMIN', 'MANAGER'] },
  { label: 'Change Password', path: '/change-password', icon: <ShieldCheck size={20} />, roles: ['CLIENT', 'ADMIN', 'MANAGER'] },
];

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'MANAGER': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'CLIENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const profileImageUrl = user?.profile_image
    ? `http://localhost:5000/uploads/${user.profile_image}`
    : null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-indigo-700/50">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                <Receipt className="h-6 w-6 text-indigo-200" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">BillManager</h1>
                <p className="text-xs text-indigo-300">Management System</p>
              </div>
            </div>
            <button className="lg:hidden text-indigo-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-indigo-700/50">
            <div className="flex items-center space-x-3">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-400" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 ring-2 ring-indigo-400">
                  <span className="text-sm font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-indigo-700/50 p-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-200 transition-colors hover:bg-red-500/20 hover:text-red-200"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:px-8">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
              Welcome, {user?.name}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(user?.role || '')}`}>
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
