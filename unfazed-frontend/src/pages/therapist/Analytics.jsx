import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const [revenue, setRevenue] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [noShow, setNoShow] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [r, s, c, n] = await Promise.all([
        api.get('/analytics/revenue'),
        api.get('/analytics/sessions-distribution'),
        api.get('/analytics/clients-trend'),
        api.get('/analytics/no-show-trend')
      ]);
      setRevenue(r.data || []);
      setSessions(s.data || []);
      setClients(c.data || []);
      setNoShow(n.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '12px'
  };

  return (
    <PageLayout
      title="Analytics"
      subtitle="Understand the health of your practice."
    >
      {loading ? (
        <div className="card text-center py-16 text-slate-500">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue */}
          <div className="card">
            <div className="mb-6">
              <h3 className="section-title">Revenue trend</h3>
              <p className="text-xs text-slate-500 mt-1">Last 12 months</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Session distribution */}
          <div className="card">
            <div className="mb-6">
              <h3 className="section-title">Session distribution</h3>
              <p className="text-xs text-slate-500 mt-1">By type</p>
            </div>
            {sessions.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sessions}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sessions.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-slate-500">
                No sessions yet
              </div>
            )}
          </div>

          {/* Active clients */}
          <div className="card">
            <div className="mb-6">
              <h3 className="section-title">Active clients</h3>
              <p className="text-xs text-slate-500 mt-1">Monthly trend</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={clients}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="clients" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* No-show rate */}
          <div className="card">
            <div className="mb-6">
              <h3 className="section-title">No-show rate</h3>
              <p className="text-xs text-slate-500 mt-1">Percentage over time</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={noShow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Analytics;