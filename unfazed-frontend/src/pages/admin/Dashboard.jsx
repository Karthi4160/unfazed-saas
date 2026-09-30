import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import brand from '../../config/brand';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [recentTherapists, setRecentTherapists] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { secret });
      localStorage.setItem('adminToken', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, therapistsRes, trendRes, activityRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers }),
        axios.get(`${API_URL}/admin/therapists`, { headers }),
        axios.get(`${API_URL}/admin/revenue-trend`, { headers }),
        axios.get(`${API_URL}/admin/recent-activity`, { headers })
      ]);
      setStats(statsRes.data.stats);
      setTherapists(therapistsRes.data.therapists || []);
      setRevenueTrend(trendRes.data.trend || []);
      setRecentTherapists(activityRes.data.recentTherapists || []);
      setRecentPayments(activityRes.data.recentPayments || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (therapistId) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.patch(`${API_URL}/admin/therapists/${therapistId}/toggle`, {}, { headers });
      fetchData();
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  // ---- Login screen ----
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
              {brand.logoLetter}
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-slate-400 mt-2">
              {brand.name} platform administration
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Sign in as admin</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <label className="label">Admin secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="input-field mb-4"
              placeholder="Enter ADMIN_SECRET from .env"
              required
            />

            <button type="submit" className="w-full btn-primary py-3">
              Sign in
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700 mt-4"
            >
              ← Back to site
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- Loading ----
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  // ---- Filter therapists by search ----
  const filteredTherapists = therapists.filter(t =>
    !search ||
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = stats ? [
    { label: 'Total Therapists', value: stats.totalTherapists, hint: `${stats.activeTherapists} active` },
    { label: 'Total Clients', value: stats.totalClients, hint: 'Across all therapists' },
    { label: 'Total Bookings', value: stats.totalBookings, hint: 'All time' },
    { label: 'Platform Revenue', value: formatCurrency(stats.totalRevenue), hint: `${stats.transactionCount} transactions` },
    { label: 'Platform Fees', value: formatCurrency(stats.totalPlatformFees), hint: 'Earned by platform' }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#0f172a' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              {brand.logoLetter}
            </div>
            <div>
              <div className="font-semibold">{brand.name}</div>
              <div className="text-xs text-slate-400">Admin Panel</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* === Stats Cards === */}
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((s, i) => (
            <div key={i} className="card">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">{s.label}</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.hint}</div>
            </div>
          ))}
        </div>

        {/* === Revenue Chart + Recent Activity === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue trend chart */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title">Revenue trend</h2>
                <p className="text-xs text-slate-500 mt-1">Platform revenue across the last 12 months</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Revenue</span>
              </div>
            </div>

            {revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#adminRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">No revenue data yet</p>
              </div>
            )}
          </div>

          {/* Recent signups */}
          <div className="card">
            <div className="mb-6">
              <h2 className="section-title">Recent signups</h2>
              <p className="text-xs text-slate-500 mt-1">Latest therapist registrations</p>
            </div>

            {recentTherapists.length > 0 ? (
              <div className="space-y-4">
                {recentTherapists.map((t) => (
                  <div key={t._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-semibold flex-shrink-0">
                      {t.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{t.name}</div>
                      <div className="text-xs text-slate-500 truncate">{t.email}</div>
                    </div>
                    <span className={`badge-${t.subscriptionTier === 'free' ? 'neutral' : 'success'} flex-shrink-0`}>
                      {t.subscriptionTier}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No signups yet</p>
            )}
          </div>
        </div>

        {/* === Therapists Table === */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">All therapists</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredTherapists.length} of {therapists.length} therapists
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Therapist</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Clients</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTherapists.map(t => (
                  <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-semibold flex-shrink-0">
                          {t.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900">{t.name}</div>
                          <div className="text-xs text-slate-500 truncate">{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge-${t.subscriptionTier === 'free' ? 'neutral' : 'success'}`}>
                        {t.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.clientCount}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {formatCurrency(t.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(t.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`badge-${t.isActive ? 'success' : 'danger'}`}>
                        {t.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(t._id)}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        {t.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTherapists.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-500">
                      {search ? 'No therapists match your search' : 'No therapists yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;