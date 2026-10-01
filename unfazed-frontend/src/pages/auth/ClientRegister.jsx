import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import brand from '../../config/brand';

const ClientRegister = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    therapistSlug: ''
  });
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Pre-select therapist if passed via URL (?therapist=slug)
    const slugFromUrl = searchParams.get('therapist');
    if (slugFromUrl) {
      setForm(prev => ({ ...prev, therapistSlug: slugFromUrl }));
    }
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const res = await axios.get(`${API_URL}/therapists`);
      const list = res.data.therapists || [];
      setTherapists(list);
      // Auto-select if only one therapist
      if (list.length === 1 && !form.therapistSlug) {
        setForm(prev => ({ ...prev, therapistSlug: list[0].slug }));
      }
    } catch (err) {
      console.error('Fetch therapists error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (!form.therapistSlug) {
      return setError('Please select your therapist');
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/client/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        therapistSlug: form.therapistSlug
      });

      const { token, client } = res.data;

      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('clientData');

      localStorage.setItem('token', token);
      localStorage.setItem('userType', 'client');
      localStorage.setItem('clientData', JSON.stringify(client));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      window.location.href = '/client/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-700 to-slate-900 opacity-90" />
        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-emerald-700 font-bold">
              {brand.logoLetter}
            </div>
            <span className="text-xl font-semibold text-white">{brand.name}</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Begin your wellness journey.
            </h1>
            <p className="text-emerald-100 text-lg max-w-md">
              Create your account, choose your therapist, and book your first session.
            </p>
          </div>
          <div className="text-emerald-200 text-xs">
            🔒 Your data is private and encrypted.
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              {brand.logoLetter}
            </div>
            <span className="text-xl font-semibold text-slate-900">{brand.name}</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-500 mt-2">Takes less than 2 minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            {/* NEW: Therapist selection */}
            <div>
              <label className="label">Select your therapist</label>
              <select
                required
                value={form.therapistSlug}
                onChange={(e) => setForm({ ...form, therapistSlug: e.target.value })}
                className="input-field"
              >
                <option value="">Choose a therapist</option>
                {therapists.map(t => (
                  <option key={t._id} value={t.slug}>{t.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Your therapist will see you in their client list
              </p>
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
                placeholder="9876543210"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                  placeholder="Min 6 chars"
                />
              </div>
              <div>
                <label className="label">Confirm</label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="input-field"
                  placeholder="Repeat"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/client/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;