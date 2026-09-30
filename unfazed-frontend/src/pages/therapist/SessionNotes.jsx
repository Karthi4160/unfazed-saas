import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import Modal from '../../components/common/Modal';

const SessionNotes = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    type: 'private',
    title: '',
    content: '',
    sessionDate: new Date().toISOString().split('T')[0]
  });
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data.clients || []);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notes', form);
      setShowModal(false);
      setForm({
        clientId: '',
        type: 'private',
        title: '',
        content: '',
        sessionDate: new Date().toISOString().split('T')[0]
      });
      setMsg('Note created successfully');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create note');
    }
  };

  return (
    <PageLayout
      title="Session Notes"
      subtitle="Create and manage clinical notes for your sessions."
      actions={
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Note
        </button>
      }
    >
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-6">
          {msg}
        </div>
      )}

      <div className="card text-center py-16">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Notes organized by client</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Navigate to a client profile to view their session notes, or create a new note using the button above.
        </p>
        <a href="/therapist/clients" className="btn-secondary inline-flex">
          Go to Clients
        </a>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New session note" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Client</label>
            <select
              required
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="input-field"
            >
              <option value="">Select client</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'private' })}
                className={`text-left p-3 rounded-lg border transition-all ${
                  form.type === 'private'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-900">Private</span>
                </div>
                <p className="text-xs text-slate-500">Only you can see this</p>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'shared' })}
                className={`text-left p-3 rounded-lg border transition-all ${
                  form.type === 'shared'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-900">Shared</span>
                </div>
                <p className="text-xs text-slate-500">Client can view this</p>
              </button>
            </div>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="e.g. Initial Assessment"
            />
          </div>

          <div>
            <label className="label">Session date</label>
            <input
              type="date"
              value={form.sessionDate}
              onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Content</label>
            <textarea
              rows={6}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-field"
              placeholder="Write your session notes here..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Note
            </button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
};

export default SessionNotes;