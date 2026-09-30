import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ sessionRate: 1000, currency: 'INR' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [changingTier, setChangingTier] = useState('');

  useEffect(() => {
    fetchSubscription();
    fetchTiers();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await api.get('/subscriptions/current');
      setSubscription(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTiers = async () => {
    try {
      const res = await api.get('/subscriptions/tiers');
      setTiers(res.data.tiers || []);
    } catch (err) { console.error(err); }
  };

  const changeTier = async (tier) => {
    setChangingTier(tier);
    try {
      await api.post('/subscriptions/change-tier', { tier });
      setMsg(`Successfully switched to ${tier} plan`);
      updateUser({ subscriptionTier: tier });
      fetchSubscription();
    } catch (err) {
      setMsg('Failed to change tier');
    } finally {
      setChangingTier('');
    }
  };

  const updatePaymentSettings = async () => {
    setSavingPayment(true);
    try {
      await api.put('/therapists/payment-settings', paymentForm);
      setMsg('Payment settings updated');
    } catch (err) {
      setMsg('Update failed');
    } finally {
      setSavingPayment(false);
    }
  };

  const changePassword = async () => {
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', passwordForm);
      setMsg('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setMsg('Password change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <PageLayout
      title="Settings"
      subtitle="Manage your subscription, payment preferences, and security."
    >
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-6">
          {msg}
        </div>
      )}

      {/* Subscription */}
      <div className="card mb-6">
        <div className="mb-6">
          <h2 className="section-title">Subscription</h2>
          <p className="text-sm text-slate-500 mt-1">
            You're currently on the <span className="font-medium text-slate-700">{subscription?.tier || user?.subscriptionTier}</span> plan
          </p>
        </div>

        {subscription?.usage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active clients</span>
                <span className="text-xs text-slate-600">
                  {subscription.usage.activeClients} / {subscription.usage.limits.maxActiveClients}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (subscription.usage.activeClients / subscription.usage.limits.maxActiveClients) * 100)}%`
                  }}
                />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions this month</span>
                <span className="text-xs text-slate-600">
                  {subscription.usage.sessionsThisMonth} / {subscription.usage.limits.sessionsPerMonth}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (subscription.usage.sessionsThisMonth / subscription.usage.limits.sessionsPerMonth) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Plan cards — improved */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map(t => {
            const isCurrent = subscription?.tier === t.tier;
            const isChanging = changingTier === t.tier;
            return (
              <div
                key={t.tier}
                className={`p-5 rounded-xl border-2 transition-all flex flex-col ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{t.name}</h3>
                  {isCurrent && (
                    <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-slate-900">
                    {t.price?.monthly ? formatCurrency(t.price.monthly) : 'Free'}
                  </span>
                  {t.price?.monthly > 0 && (
                    <span className="text-sm text-slate-500 font-normal">/mo</span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-5 pb-5 border-b border-slate-200/60 flex-1">
                  Up to {t.features.maxActiveClients} active clients
                </p>

                {isCurrent ? (
                  <div className="text-xs text-emerald-700 font-medium text-center py-2.5 flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Your current plan
                  </div>
                ) : (
                  <button
                    onClick={() => changeTier(t.tier)}
                    disabled={isChanging}
                    className="w-full font-medium text-sm py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                  >
                    {isChanging ? 'Switching...' : `Switch to ${t.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment settings */}
      <div className="card mb-6">
        <div className="mb-6">
          <h2 className="section-title">Payment settings</h2>
          <p className="text-sm text-slate-500 mt-1">Set your default session rate</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Session rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input
                type="number"
                value={paymentForm.sessionRate}
                onChange={(e) => setPaymentForm({ ...paymentForm, sessionRate: Number(e.target.value) })}
                className="input-field pl-7"
              />
            </div>
          </div>
          <div>
            <label className="label">Currency</label>
            <select
              value={paymentForm.currency}
              onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
              className="input-field"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={updatePaymentSettings}
            disabled={savingPayment}
            className="btn-primary"
          >
            {savingPayment ? 'Saving...' : 'Save payment settings'}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="card">
        <div className="mb-6">
          <h2 className="section-title">Change password</h2>
          <p className="text-sm text-slate-500 mt-1">Update your account password</p>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="label">Current password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={changePassword}
            disabled={savingPassword}
            className="btn-primary"
          >
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;