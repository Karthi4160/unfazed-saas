import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const ClientSessions = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get(`/bookings/client/${user?.id}`);
      setBookings(res.data.bookings || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(b.startTime) > new Date() && ['confirmed', 'pending'].includes(b.status);
    if (filter === 'completed') return b.status === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'no-show'].includes(b.status);
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All', count: bookings.length },
    { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => new Date(b.startTime) > new Date() && ['confirmed', 'pending'].includes(b.status)).length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => ['cancelled', 'no-show'].includes(b.status)).length }
  ];

  return (
    <PageLayout
      title="My Sessions"
      subtitle="Your complete session history."
    >
      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                filter === t.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                filter === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 font-medium">No sessions found</p>
          <p className="text-xs text-slate-500 mt-1">
            {filter === 'all' ? 'Book your first session to get started' : `No ${filter} sessions`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b._id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-emerald-700">
                    {new Date(b.startTime).toLocaleString('en-IN', { month: 'short' })}
                  </span>
                  <span className="text-base font-bold text-emerald-700 leading-none">
                    {new Date(b.startTime).getDate()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{formatDateTime(b.startTime)}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {b.duration} min • with {b.therapistId?.name || 'Therapist'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-medium text-slate-900">{formatCurrency(b.amount)}</span>
                <span className={`badge-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'completed' ? 'neutral' : 'danger'}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default ClientSessions;