import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchClients(); }, [statusFilter]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients', { params: { status: statusFilter || undefined } });
      setClients(res.data.clients || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', newClient);
      setShowAddModal(false);
      setNewClient({ name: '', email: '', phone: '' });
      setMsg('Client added successfully');
      fetchClients();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add client');
    }
  };

  const filtered = clients.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout
      title="Clients"
      subtitle={`${clients.length} ${clients.length === 1 ? 'client' : 'clients'} in your practice`}
      actions={
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      }
    >
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-6">
          {msg}
        </div>
      )}

      {/* Filter bar */}
      <div className="card mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="waiting">Waiting</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card text-center py-12 text-slate-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 font-medium">
            {search || statusFilter ? 'No clients match your filters' : 'No clients yet'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {search || statusFilter ? 'Try different filters' : 'Add your first client to get started'}
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Last session</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c._id}
                  onClick={() => navigate(`/therapist/clients/${c._id}`)}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-sm font-semibold flex-shrink-0">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge-${c.status === 'active' ? 'success' : c.status === 'waiting' ? 'warning' : 'neutral'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.totalSessions || 0}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {c.lastSessionDate ? formatDate(c.lastSessionDate) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add client modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add new client">
        <form onSubmit={handleAddClient} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              required
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              className="input-field"
              placeholder="Client's full name"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              required
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              className="input-field"
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label className="label">Phone (optional)</label>
            <input
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              className="input-field"
              placeholder="9876543210"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add client
            </button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
};

export default ClientList;