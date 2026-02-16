import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Pagination } from '../../components/Pagination';
import { FileText, Loader2, Eye } from 'lucide-react';

interface Bill {
  id: number;
  bill_type: string;
  bill_date: string;
  amount: number;
  bill_file: string;
  status: string;
  remarks: string | null;
  admin_name: string;
  created_at: string;
}

export const MyBills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);
  const [viewBill, setViewBill] = useState<Bill | null>(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/bills/client?page=${currentPage}&limit=${limit}`);
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
        <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>
        <p className="text-gray-500 mt-1">View and track all your submitted bills</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bills yet</h3>
            <p className="text-gray-500 mt-1">Upload your first bill to get started</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${Number(bill.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {bill.admin_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(bill.status)}`}>
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

      {/* Bill Detail Modal */}
      {viewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewBill(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bill Details #{viewBill.id}</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Type</span>
                <span className="font-medium">{getBillTypeIcon(viewBill.bill_type)} {viewBill.bill_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{new Date(viewBill.bill_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-900">${Number(viewBill.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Admin</span>
                <span className="font-medium">{viewBill.admin_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(viewBill.status)}`}>
                  {viewBill.status}
                </span>
              </div>
              {viewBill.remarks && (
                <div className="py-2 border-b">
                  <span className="text-gray-500 block mb-1">Remarks</span>
                  <p className="text-sm bg-gray-50 rounded-lg p-3">{viewBill.remarks}</p>
                </div>
              )}
              {viewBill.bill_file && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">File</span>
                  <a
                    href={`http://localhost:5000/uploads/${viewBill.bill_file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View File ↗
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={() => setViewBill(null)}
              className="mt-6 w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
