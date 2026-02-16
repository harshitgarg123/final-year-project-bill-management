import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FileText, Upload, Users, CheckCircle, XCircle, Clock, TrendingUp, BarChart3, ShieldCheck, IdCard } from 'lucide-react';

interface Stats {
  totalBills: number;
  pending: number;
  approved: number;
  rejected: number;
  totalUsers?: number;
  totalClients?: number;
  totalAdmins?: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalBills: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch {
      setStats({ totalBills: 0, pending: 0, approved: 0, rejected: 0, totalUsers: 0, totalClients: 0, totalAdmins: 0 });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Bills', value: stats.totalBills, icon: <FileText className="h-6 w-6" />, bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Pending', value: stats.pending, icon: <Clock className="h-6 w-6" />, bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'Approved', value: stats.approved, icon: <CheckCircle className="h-6 w-6" />, bgLight: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Rejected', value: stats.rejected, icon: <XCircle className="h-6 w-6" />, bgLight: 'bg-red-50', textColor: 'text-red-600' },
  ];

  if (user?.role === 'MANAGER') {
    statCards.push(
      { label: 'Total Users', value: stats.totalUsers || 0, icon: <Users className="h-6 w-6" />, bgLight: 'bg-purple-50', textColor: 'text-purple-600' },
      { label: 'Clients', value: stats.totalClients || 0, icon: <TrendingUp className="h-6 w-6" />, bgLight: 'bg-indigo-50', textColor: 'text-indigo-600' },
    );
  }

  const quickActions = {
    CLIENT: [
      { label: 'Upload New Bill', path: '/bills/upload', icon: <Upload className="h-5 w-5" />, color: 'bg-indigo-600 hover:bg-indigo-700' },
      { label: 'View My Bills', path: '/bills/my', icon: <FileText className="h-5 w-5" />, color: 'bg-blue-600 hover:bg-blue-700' },
      { label: 'My Details', path: '/my-details', icon: <IdCard className="h-5 w-5" />, color: 'bg-green-600 hover:bg-green-700' },
      { label: 'Change Password', path: '/change-password', icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-amber-600 hover:bg-amber-700' },
    ],
    ADMIN: [
      { label: 'View Assigned Bills', path: '/bills/admin', icon: <FileText className="h-5 w-5" />, color: 'bg-indigo-600 hover:bg-indigo-700' },
      { label: 'My Details', path: '/my-details', icon: <IdCard className="h-5 w-5" />, color: 'bg-green-600 hover:bg-green-700' },
      { label: 'Change Password', path: '/change-password', icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-amber-600 hover:bg-amber-700' },
    ],
    MANAGER: [
      { label: 'Manage Users', path: '/users', icon: <Users className="h-5 w-5" />, color: 'bg-indigo-600 hover:bg-indigo-700' },
      { label: 'View All Bills', path: '/bills/all', icon: <BarChart3 className="h-5 w-5" />, color: 'bg-blue-600 hover:bg-blue-700' },
      { label: 'My Details', path: '/my-details', icon: <IdCard className="h-5 w-5" />, color: 'bg-green-600 hover:bg-green-700' },
      { label: 'Change Password', path: '/change-password', icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-amber-600 hover:bg-amber-700' },
    ],
  };

  const roleDescriptions = {
    CLIENT: 'Upload and track your bills. Select an admin for approval and get notified via email.',
    ADMIN: 'Review and manage bills assigned to you. Approve or reject with remarks. Click on a client to view their full profile.',
    MANAGER: 'Full oversight of users and bills. Create accounts, monitor the system, and view user details.',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
            <p className="mt-2 text-indigo-200 max-w-2xl">
              {roleDescriptions[user?.role as keyof typeof roleDescriptions]}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {(quickActions[user?.role as keyof typeof quickActions] || []).map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className={`inline-flex items-center space-x-2 rounded-xl ${action.color} px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview Statistics</h2>
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.bgLight} rounded-xl p-3`}>
                    <div className={card.textColor}>{card.icon}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <div className="bg-indigo-100 rounded-lg p-2">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Bill Types</p>
              <p className="text-xs text-gray-500">Light, Bin, Voter, Newspaper</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <div className="bg-green-100 rounded-lg p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Auto-notify on status changes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <div className="bg-purple-100 rounded-lg p-2">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Role-Based Access</p>
              <p className="text-xs text-gray-500">Client, Admin, Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
