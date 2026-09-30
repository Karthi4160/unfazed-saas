import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get(`/bookings/client/${user?.id}`);
      setBookings(res.data.bookings || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const upcoming = bookings.filter(b =>
    new Date(b.startTime) > new Date() && ['confirmed', 'pending'].includes(b.status)
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      to: '/client/book',
      title: 'Book a session',
      desc: 'Schedule your next appointment',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      to: '/client/chat',
      title: 'Message therapist',
      desc: 'Chat securely with your therapist',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      to: '/client/notes',
      title: 'Shared notes',
      desc: 'View session summaries from your therapist',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-purple-50 text-purple-700'
    }
  ];

  return (
    <PageLayout
      title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'there'}`}
      subtitle="Welcome back. Here's what's on your schedule."
    >
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action, i) => (
          <Link key={i} to={action.to} className="card-hover group">
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
              </svg>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{action.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
              </div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Upcoming sessions</h2>
            <p className="text-xs text-slate-500 mt-1">Your next scheduled appointments</p>
          </div>
          <Link to="/client/sessions" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading...</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 font-medium">No upcoming sessions</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Book your first session to get started</p>
            <Link to="/client/book" className="btn-primary inline-flex">
              Book a session
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(b => (
              <div key={b._id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-emerald-700">
                      {new Date(b.startTime).toLocaleString('en-IN', { month: 'short' })}
                    </span>
                    <span className="text-base font-bold text-emerald-700 leading-none">
                      {new Date(b.startTime).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {formatDateTime(b.startTime)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.duration} minutes • with {b.therapistId?.name || 'Therapist'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'neutral'}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ClientDashboard;