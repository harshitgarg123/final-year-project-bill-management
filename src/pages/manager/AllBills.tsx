import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Pagination } from '../../components/Pagination';
import { UserDetailModal } from '../../components/UserDetailModal';
import { FileText, Loader2, Filter, Eye, Search, User } from 'lucide-react';

interface Bill {
  id: number;
  client_id: number;
  admin_id: number;
  bill_type: string;
  bill_date: string;
  amount: number;
  bill_file: string;
  status: string;
  remarks: string | null;
  client_name: string;
  client_email: string;
  admin_name: string;
  admin_email: string;
  created_at: string;
}

interface FilterUser {
  id: number;
  name: string;
  email: string;
}

export const AllBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [viewUserId, setViewUserId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [clients, setClients] = useState<FilterUser[]>([]);
  const [admins, setAdmins] = useState<FilterUser[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [clientsRes, adminsRes] = await Promise.all([
        api.get('/users/clients'),
        api.get('/users/admins'),
      ]);
      setClients(clientsRes.data);
      setAdmins(adminsRes.data);
    } catch {
      // Filters won't work but page still loads
    }
  };

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/bills/all?page=${currentPage}&limit=${limit}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (clientFilter) url += `&client_id=${clientFilter}`;
      if (adminFilter) url += `&admin_id=${adminFilter}`;
      const response = await api.get(url);
      setBills(response.data.bills);
      setTotalPages(response.data.totalPages);
      setTotalRecords(response.data.total);
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, statusFilter, clientFilter, adminFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setStatusFilter('');
    setClientFilter('');
    setAdminFilter('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getBillTypeIcon = (type: string) => {
    switch (type) {
      case 'LIGHT': return '💡';
      case 'BIN': return '🗑️';
      case 'VOTER': return '🗳️';
      case 'NEWSPAPER': return '📰';
      default: return '📄';
    }
  };

  const hasActiveFilters = statusFilter || clientFilter || adminFilter;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Bills</h1>
          <p className="text-gray-500 mt-1">Complete overview of all bills in the system</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter size={16} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
              {[statusFilter, clientFilter, adminFilter].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none appearance-none bg-white"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Client</label>
              <select
                value={clientFilter}
                onChange={(e) => { setClientFilter(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none appearance-none bg-white"
              >
                <option value="">All Clients</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Admin</label>
              <select
                value={adminFilter}
                onChange={(e) => { setAdminFilter(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none appearance-none bg-white"
              >
                <option value="">All Admins</option>
                {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
              <Search size={12} className="mr-1" /> Clear all filters
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bills found</h3>
            <p className="text-gray-500 mt-1">{hasActiveFilters ? 'Try adjusting your filters' : 'No bills in the system yet'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Bill</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Admin</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{getBillTypeIcon(bill.bill_type)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{bill.bill_type}</div>
                            <div className="text-xs text-gray-500">#{bill.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setViewUserId(bill.client_id)}
                          className="group text-left"
                          title="Click to view client details"
                        >
                          <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 flex items-center gap-1">
                            {bill.client_name}
                            <User size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs text-gray-500">{bill.client_email}</div>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setViewUserId(bill.admin_id)}
                          className="group text-left"
                          title="Click to view admin details"
                        >
                          <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 flex items-center gap-1">
                            {bill.admin_name}
                            <User size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs text-gray-500">{bill.admin_email}</div>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${Number(bill.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(bill.status)}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setViewBill(bill)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
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

      {/* View Bill Modal */}
      {viewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewBill(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bill Details #{viewBill.id}</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Type</span><span className="font-medium">{getBillTypeIcon(viewBill.bill_type)} {viewBill.bill_type}</span></div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Client</span>
                <button onClick={() => { setViewBill(null); setViewUserId(viewBill.client_id); }} className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  {viewBill.client_name} <User size={12} />
                </button>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Admin</span>
                <button onClick={() => { setViewBill(null); setViewUserId(viewBill.admin_id); }} className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  {viewBill.admin_name} <User size={12} />
                </button>
              </div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(viewBill.bill_date).toLocaleDateString()}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Amount</span><span className="font-semibold">${Number(viewBill.amount).toFixed(2)}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Status</span><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(viewBill.status)}`}>{viewBill.status}</span></div>
              {viewBill.remarks && <div className="py-2 border-b"><span className="text-gray-500 block mb-1">Remarks</span><p className="text-sm bg-gray-50 rounded-lg p-3">{viewBill.remarks}</p></div>}
              {viewBill.bill_file && <div className="flex justify-between py-2"><span className="text-gray-500">File</span><a href={`http://localhost:5000/uploads/${viewBill.bill_file}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View File ↗</a></div>}
            </div>
            <button onClick={() => setViewBill(null)} className="mt-6 w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {viewUserId && (
        <UserDetailModal userId={viewUserId} onClose={() => setViewUserId(null)} />
      )}
    </div>
  );
};
