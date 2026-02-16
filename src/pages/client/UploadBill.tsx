import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Upload, Calendar, DollarSign, FileText, Users, Loader2 } from 'lucide-react';

interface Admin {
  id: number;
  name: string;
  email: string;
}

export const UploadBill: React.FC = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [billType, setBillType] = useState('');
  const [billDate, setBillDate] = useState('');
  const [amount, setAmount] = useState('');
  const [adminId, setAdminId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/users/admins');
      setAdmins(response.data);
    } catch {
      toast.error('Failed to load admins list');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billType || !billDate || !amount || !adminId || !file) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bill_type', billType);
      formData.append('bill_date', billDate);
      formData.append('amount', amount);
      formData.append('admin_id', adminId);
      formData.append('bill_file', file);

      await api.post('/bills/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Bill uploaded successfully! Admin has been notified.');
      navigate('/bills/my');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to upload bill');
    } finally {
      setLoading(false);
    }
  };

  const billTypes = [
    { value: 'LIGHT', label: '💡 Light Bill' },
    { value: 'BIN', label: '🗑️ Bin Bill' },
    { value: 'VOTER', label: '🗳️ Voter Bill' },
    { value: 'NEWSPAPER', label: '📰 Newspaper Bill' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload New Bill</h1>
        <p className="text-gray-500 mt-1">Submit a bill for admin review and approval</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bill Type</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none bg-white"
                required
              >
                <option value="">Select bill type</option>
                {billTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bill Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bill Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter bill amount"
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Select Admin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Admin</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none bg-white"
                required
                disabled={loadingAdmins}
              >
                <option value="">{loadingAdmins ? 'Loading admins...' : 'Select an admin'}</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bill File</label>
            <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 hover:border-indigo-400 transition-colors">
              <div className="text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="mt-3">
                  <label className="cursor-pointer rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors">
                    Choose File
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      required
                    />
                  </label>
                </div>
                {file ? (
                  <p className="mt-3 text-sm text-green-600 font-medium">✓ {file.name}</p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">PDF, JPG, PNG, DOC up to 10MB</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Bill
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
