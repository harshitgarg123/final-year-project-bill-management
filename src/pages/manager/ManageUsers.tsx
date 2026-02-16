import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Pagination } from '../../components/Pagination';
import { UserDetailModal } from '../../components/UserDetailModal';
import { Users, UserPlus, Edit2, Loader2, X, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  profile_image: string | null;
  created_at: string;
}

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'CLIENT', password: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users?page=${currentPage}&limit=${limit}`);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotalRecords(response.data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      await api.post('/users', formData);
      toast.success('User created! Login credentials sent via email.');
      setShowCreateModal(false);
      setFormData({ name: '', email: '', role: 'CLIENT', password: '' });
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setFormLoading(true);
    try {
      await api.put(`/users/${editUser.id}`, { name: formData.name, email: formData.email, role: formData.role });
      toast.success('User updated successfully!');
      setShowEditModal(false);
      setEditUser(null);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (user: UserData) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await api.put(`/users/status/${user.id}`, { status: newStatus });
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const openEditModal = (user: UserData) => {
    setEditUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, password: '' });
    setShowEditModal(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'MANAGER': return 'bg-purple-100 text-purple-700';
      case 'ADMIN': return 'bg-blue-100 text-blue-700';
      case 'CLIENT': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderModal = (isEdit: boolean) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Edit User' : 'Create New User'}
          </h3>
          <button onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); }} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={isEdit ? handleEditUser : handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-300 py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-gray-300 py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border border-gray-300 py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none appearance-none bg-white"
              required
            >
              <option value="CLIENT">Client</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-xs text-gray-400">(auto-generated if empty)</span>
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave empty for auto-generated"
                className="w-full rounded-xl border border-gray-300 py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => { isEdit ? setShowEditModal(false) : setShowCreateModal(false); }}
              className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {formLoading ? 'Saving...' : isEdit ? 'Update' : 'Create & Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">Create, edit, and manage system users</p>
        </div>
        <button
          onClick={() => { setFormData({ name: '', email: '', role: 'CLIENT', password: '' }); setShowCreateModal(true); }}
          className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <UserPlus size={18} />
          <span>Create User</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-gray-500 mt-1">Create your first user to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {u.profile_image ? (
                            <img src={`http://localhost:5000/uploads/${u.profile_image}`} alt="" className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setViewUserId(u.id)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => toggleStatus(u)}
                            className={`p-1.5 transition-colors ${
                              u.status === 'ACTIVE' ? 'text-green-600 hover:text-red-600' : 'text-red-600 hover:text-green-600'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          >
                            {u.status === 'ACTIVE' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              limit={limit}
              onPageChange={setCurrentPage}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </div>

      {showCreateModal && renderModal(false)}
      {showEditModal && renderModal(true)}
      {viewUserId && (
        <UserDetailModal userId={viewUserId} onClose={() => setViewUserId(null)} />
      )}
    </div>
  );
};
