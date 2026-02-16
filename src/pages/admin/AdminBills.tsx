import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Pagination } from '../../components/Pagination';
import { UserDetailModal } from '../../components/UserDetailModal';
import { FileText, Loader2, CheckCircle, XCircle, Eye, User } from 'lucide-react';

interface Bill {
  id: number;
  client_id: number;
  bill_type: string;
  bill_date: string;
  amount: number;
  bill_file: string;
  status: string;
  remarks: string | null;
  client_name: string;
  client_email: string;
  created_at: string;
}

export const AdminBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);
  const [actionBill, setActionBill] = useState<Bill | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [viewClientId, setViewClientId] = useState<number | null>(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/bills/admin?page=${currentPage}&limit=${limit}`);
      setBills(response.data.bills);
      setTotalPages(response.data.totalPages);
      setTotalRecords(response.data.total);
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleAction = async () => {
    if (!actionBill || !actionType) return;
    if (actionType === 'reject' && !remarks.trim()) {
      toast.error('Please provide remarks for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/bills/${actionBill.id}/${actionType}`, { remarks });
      toast.success(`Bill ${actionType === 'approve' ? 'approved' : 'rejected'} successfully! Client notified.`);
      setActionBill(null);
      setActionType(null);
      setRemarks('');
      fetchBills();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Failed to ${actionType} bill`);
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assigned Bills</h1>
        <p className="text-gray-500 mt-1">Review and process bills assigned to you</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No assigned bills</h3>
            <p className="text-gray-500 mt-1">Bills targeted to you will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
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
                          onClick={() => setViewClientId(bill.client_id)}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${Number(bill.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(bill.status)}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setViewBill(bill)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          {bill.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => { setActionBill(bill); setActionType('approve'); setRemarks(''); }}
                                className="inline-flex items-center space-x-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                              >
                                <CheckCircle size={14} />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => { setActionBill(bill); setActionType('reject'); setRemarks(''); }}
                                className="inline-flex items-center space-x-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
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

      {/* Action Modal */}
      {actionBill && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setActionBill(null); setActionType(null); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {actionType === 'approve' ? '✅ Approve' : '❌ Reject'} Bill #{actionBill.id}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {actionType === 'approve'
                ? 'Are you sure you want to approve this bill?'
                : 'Please provide a reason for rejection.'}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Type:</span> <span className="font-medium">{actionBill.bill_type}</span></div>
                <div><span className="text-gray-500">Amount:</span> <span className="font-medium">${Number(actionBill.amount).toFixed(2)}</span></div>
                <div><span className="text-gray-500">Client:</span> <span className="font-medium">{actionBill.client_name}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(actionBill.bill_date).toLocaleDateString()}</span></div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Remarks {actionType === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={actionType === 'approve' ? 'Optional remarks...' : 'Reason for rejection (required)'}
                className="w-full rounded-xl border border-gray-300 py-2.5 px-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                rows={3}
                required={actionType === 'reject'}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => { setActionBill(null); setActionType(null); }}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {viewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewBill(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bill Details #{viewBill.id}</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Type</span><span className="font-medium">{getBillTypeIcon(viewBill.bill_type)} {viewBill.bill_type}</span></div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Client</span>
                <button onClick={() => { setViewBill(null); setViewClientId(viewBill.client_id); }} className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  {viewBill.client_name} <User size={12} />
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
      {viewClientId && (
        <UserDetailModal userId={viewClientId} onClose={() => setViewClientId(null)} />
      )}
    </div>
  );
};
