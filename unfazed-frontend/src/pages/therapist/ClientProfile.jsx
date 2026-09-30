import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sessions');

  useEffect(() => { fetchProfile(); }, [clientId]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/clients/${clientId}/profile`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Client">
        <div className="card text-center py-16 text-slate-500">Loading...</div>
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout title="Client">
        <div className="card text-center py-16">
          <p className="text-slate-600">Client not found</p>
          <Link to="/therapist/clients" className="text-emerald-600 mt-4 inline-block">
            ← Back to clients
          </Link>
        </div>
      </PageLayout>
    );
  }

  const { client, bookings, payments, notes } = data;

  const tabs = [
    { id: 'sessions', label: 'Sessions', count: bookings?.length || 0 },
    { id: 'payments', label: 'Payments', count: payments?.length || 0 },
    { id: 'notes', label: 'Notes', count: notes?.length || 0 }
  ];

  return (
    <PageLayout
      title={client.name}
      subtitle={client.email + (client.phone ? ` • ${client.phone}` : '')}
      actions={
        <Link to="/therapist/clients" className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      }
    >
      {/* Client header card */}
      <div className="card mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-semibold flex-shrink-0">
            {client.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold text-slate-900">{client.name}</h2>
              <span className={`badge-${client.status === 'active' ? 'success' : client.status === 'waiting' ? 'warning' : 'neutral'}`}>
                {client.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">{client.email}</p>
            {client.intake?.presentingConcern && (
              <p className="text-sm text-slate-600 mt-3">
                <span className="font-medium text-slate-700">Presenting concern:</span> {client.intake.presentingConcern}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total sessions</div>
            <div className="text-lg font-semibold text-slate-900">{client.totalSessions || 0}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Consent</div>
            <div className="text-sm font-medium text-slate-900">
              {client.intake?.consent?.signed ? (
                <span className="text-emerald-600">✓ Signed</span>
              ) : (
                <span className="text-amber-600">Pending</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Joined</div>
            <div className="text-sm font-medium text-slate-900">{formatDate(client.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'sessions' && (
        <div className="card">
          <h3 className="section-title mb-4">Session history</h3>
          {bookings?.length ? (
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b._id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{formatDate(b.startTime)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{b.duration} min • {b.type}</p>
                  </div>
                  <span className={`badge-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'neutral'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No sessions yet</p>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="card">
          <h3 className="section-title mb-4">Payment history</h3>
          {payments?.length ? (
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p._id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(p.createdAt)} • {p.invoiceNumber || 'No invoice'}
                    </p>
                  </div>
                  <span className={`badge-${p.status === 'paid' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No payments yet</p>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="card">
          <h3 className="section-title mb-4">Session notes</h3>
          {notes?.length ? (
            <div className="space-y-2">
              {notes.map(n => (
                <div key={n._id} className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <span className={`badge-${n.type === 'shared' ? 'success' : 'neutral'}`}>
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(n.sessionDate)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">No notes yet</p>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default ClientProfile;