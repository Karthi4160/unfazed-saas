import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { formatCurrency, formatDate, statusColor } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api.get(`/payments/therapist/${user?.id}`),
        api.get(`/payments/revenue/${user?.id}`)
      ]);
      setPayments(pRes.data.payments || []);
      setStats(sRes.data.stats);
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
      alert('Could not download invoice');
    }
  };

  const statCards = stats ? [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Net Revenue', value: formatCurrency(stats.totalNetRevenue), color: 'text-blue-600 bg-blue-50' },
    { label: 'Platform Fees', value: formatCurrency(stats.totalPlatformFees), color: 'text-amber-600 bg-amber-50' },
    { label: 'Transactions', value: stats.transactionCount, color: 'text-purple-600 bg-purple-50' }
  ] : [];

  return (
    <PageLayout
      title="Payments"
      subtitle="Track your revenue, fees, and invoices."
    >
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="card">
              <div className={`w-10 h-10 rounded-lg ${s.color} mb-4`} />
              <div className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Transactions table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="section-title">Transaction history</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 font-medium">No payments yet</p>
            <p className="text-xs text-slate-500 mt-1">Transactions will appear here after your first session</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
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
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{p.clientId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge-${p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">{p.invoiceNumber || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'paid' && p.invoiceNumber ? (
                      <button
                        onClick={() => downloadInvoice(p._id, p.invoiceNumber)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
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
        )}
      </div>
    </PageLayout>
  );
};

export default Payments;