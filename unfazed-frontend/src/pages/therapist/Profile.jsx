import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';

const TherapistProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    credentials: user?.credentials || '',
    yearsOfExperience: user?.yearsOfExperience || '',
    specializations: (user?.specializations || []).join(', '),
    languages: (user?.languages || []).join(', ')
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        specializations: form.specializations.split(',').map(s => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean)
      };
      const res = await api.put('/auth/profile', payload);
      updateUser(res.data.therapist);
      setMsg('Profile updated successfully');
    } catch (err) {
      setMsg('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `${window.location.origin}/${user?.slug}`;

  return (
    <PageLayout
      title="Profile"
      subtitle="This information appears on your public booking page."
    >
      {/* Public URL card */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-1">Your public URL</h3>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium break-all"
            >
              {publicUrl}
            </a>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              setMsg('URL copied to clipboard');
            }}
            className="btn-secondary text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy URL
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {msg && (
          <div className={`text-sm px-4 py-3 rounded-lg ${
            msg.includes('success') || msg.includes('copied')
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {msg}
          </div>
        )}

        <div>
          <label className="label">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea
            name="bio"
            rows={5}
            value={form.bio}
            onChange={handleChange}
            className="input-field"
            placeholder="Tell clients about your practice, approach, and what they can expect..."
          />
          <p className="text-xs text-slate-500 mt-1">Appears on your public profile page</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Credentials</label>
            <input
              name="credentials"
              value={form.credentials}
              onChange={handleChange}
              className="input-field"
              placeholder="M.A. Clinical Psychology"
            />
          </div>
          <div>
            <label className="label">Years of experience</label>
            <input
              name="yearsOfExperience"
              type="number"
              value={form.yearsOfExperience}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label">Specializations</label>
          <input
            name="specializations"
            value={form.specializations}
            onChange={handleChange}
            className="input-field"
            placeholder="Anxiety, Depression, CBT, Mindfulness"
          />
          <p className="text-xs text-slate-500 mt-1">Separate with commas</p>
        </div>

        <div>
          <label className="label">Languages</label>
          <input
            name="languages"
            value={form.languages}
            onChange={handleChange}
            className="input-field"
            placeholder="English, Hindi, Tamil"
          />
          <p className="text-xs text-slate-500 mt-1">Separate with commas</p>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </PageLayout>
  );
};

export default TherapistProfile;