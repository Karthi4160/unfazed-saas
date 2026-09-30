import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ClientProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    presentingConcern: '',
    history: '',
    medications: '',
    allergies: ''
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const clientId = user?._id || user?.id;

  useEffect(() => {
    if (authLoading) return;
    if (!clientId) { setLoading(false); return; }
    fetchProfile();
  }, [clientId, authLoading]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/clients/${clientId}`);
      setClient(res.data.client);
      setForm({
        presentingConcern: res.data.client?.intake?.presentingConcern || '',
        history: res.data.client?.intake?.history || '',
        medications: res.data.client?.intake?.medications || '',
        allergies: res.data.client?.intake?.allergies || ''
      });
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitIntake = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/clients/${clientId}/intake`, form);
      setMsg('Intake information saved');
      fetchProfile();
    } catch (err) {
      setMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const captureConsent = async () => {
    try {
      await api.post(`/clients/${clientId}/consent`, { version: '1.0' });
      setMsg('Consent captured successfully');
      fetchProfile();
    } catch (err) {
      setMsg('Failed to capture consent');
    }
  };

  if (authLoading || loading) {
    return (
      <PageLayout title="My Profile">
        <div className="card text-center py-16">
          <LoadingSpinner message="Loading profile..." />
        </div>
      </PageLayout>
    );
  }

  const consentSigned = client?.intake?.consent?.signed;

  return (
    <PageLayout
      title="My Profile"
      subtitle="Your account, intake information, and consent status."
    >
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-6">
          {msg}
        </div>
      )}

      {/* Account info card */}
      <div className="card mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-semibold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
            {user?.phone && <p className="text-sm text-slate-500">{user.phone}</p>}
          </div>
          <div className={`badge-${consentSigned ? 'success' : 'warning'} flex-shrink-0`}>
            {consentSigned ? 'Consent signed' : 'Consent pending'}
          </div>
        </div>
      </div>

      {/* Consent card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            consentSigned ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            <svg className={`w-5 h-5 ${consentSigned ? 'text-emerald-700' : 'text-amber-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              {consentSigned ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              {consentSigned ? 'Consent signed' : 'Consent required'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {consentSigned
                ? `You signed the terms of service and privacy policy on ${new Date(client.intake.consent.signedAt).toLocaleDateString()}.`
                : 'Please read and accept the terms of service and privacy policy to proceed with therapy sessions.'}
            </p>
            {!consentSigned && (
              <button onClick={captureConsent} className="btn-primary mt-4">
                I agree & sign consent
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Intake form */}
      <div className="card">
        <div className="mb-6">
          <h2 className="section-title">Intake information</h2>
          <p className="text-sm text-slate-500 mt-1">
            This helps your therapist understand your background. Everything you share is private.
          </p>
        </div>

        <form onSubmit={submitIntake} className="space-y-4">
          <div>
            <label className="label">Presenting concern</label>
            <textarea
              rows={3}
              value={form.presentingConcern}
              onChange={(e) => setForm({ ...form, presentingConcern: e.target.value })}
              className="input-field"
              placeholder="What brings you to therapy? What would you like to work on?"
            />
          </div>

          <div>
            <label className="label">History</label>
            <textarea
              rows={3}
              value={form.history}
              onChange={(e) => setForm({ ...form, history: e.target.value })}
              className="input-field"
              placeholder="Any relevant history — previous therapy, life events, etc."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Current medications</label>
              <input
                value={form.medications}
                onChange={(e) => setForm({ ...form, medications: e.target.value })}
                className="input-field"
                placeholder="List any medications, or 'None'"
              />
            </div>
            <div>
              <label className="label">Allergies</label>
              <input
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="input-field"
                placeholder="List any allergies, or 'None'"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save intake information'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default ClientProfilePage;