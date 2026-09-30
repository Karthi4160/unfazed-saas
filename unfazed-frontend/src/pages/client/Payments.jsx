import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const ClientPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/payments/client/${user?.id}`);
      setPayments(res.data.payments || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const downloadInvoice = async (paymentId, invoiceNumber) => {
    try {
      const res = await api.get(`/payments/invoice/${paymentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceNumber || paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download failed:', err);
      alert('Could not download invoice');
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <PageLayout
      title="Payments"
      subtitle="Your session payments and invoices."
    >
      {/* Summary card */}
      {payments.length > 0 && (
        <div className="card mb-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total paid</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-slate-500 mt-1">
                Across {payments.filter(p => p.status === 'paid').length} transaction{payments.filter(p => p.status === 'paid').length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12 text-slate-500">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-20">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-base font-medium text-slate-700">No payments yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Your payment history will appear here after booking a session
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice</th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(p.createdAt)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge-${p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {p.invoiceNumber || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'paid' && p.invoiceNumber ? (
                      <button
                        onClick={() => downloadInvoice(p._id, p.invoiceNumber)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer inline-flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
};

export default ClientPayments;