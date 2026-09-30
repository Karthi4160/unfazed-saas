import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import brand from '../../config/brand';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, error } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      return setLocalError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setLocalError('Password must be at least 6 characters');
    }

    setLoading(true);
    await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 opacity-90" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }} />

        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-emerald-700 font-bold">
              {brand.logoLetter}
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">{brand.name}</span>
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Start your practice the modern way.
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
              Free forever for solo therapists. Upgrade when you grow.
            </p>

            <ul className="mt-10 space-y-4">
              {[
                'Up to 5 clients free — no card required',
                'Booking, chat, notes & payments included',
                'Set up in under 5 minutes',
                'Cancel anytime'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-emerald-50 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-l-2 border-emerald-400 pl-4">
            <p className="text-emerald-50 text-sm italic leading-relaxed">
              "I got my practice online in an afternoon. My clients love the booking experience."
            </p>
            <p className="text-xs text-emerald-200 mt-2">— Karthick R., Chennai</p>
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
            <span className="text-xl font-semibold tracking-tight text-slate-900">{brand.name}</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-500 mt-2">
              Free for solo therapists. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {localError || error}
              </div>
            )}

            <div>
              <label className="label">Full name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Dr. Jane Doe"
              />
            </div>

            <div>
              <label className="label">Work email</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="label">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="Repeat password"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-xs text-slate-500 text-center leading-relaxed">
              By signing up, you agree to our{' '}
              <a href="#" className="text-emerald-600 hover:underline">Terms</a> and{' '}
              <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;