import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, statusColor } from '../../utils/formatters';
import Modal from '../../components/common/Modal';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const BookingCalendar = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAvailModal, setShowAvailModal] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchAvailability();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get(`/bookings/therapist/${user?.id}`);
      setBookings(res.data.bookings || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAvailability = async () => {
    try {
      const res = await api.get('/availability');
      setAvailability(res.data.availability);
    } catch (err) { console.error(err); }
  };

  const updateWeeklyTemplate = async (dayOfWeek, startTime, endTime, isActive) => {
    const updated = availability.weeklyTemplate.map(t =>
      t.dayOfWeek === dayOfWeek ? { ...t, startTime, endTime, isActive } : t
    );
    try {
      const res = await api.put('/availability/weekly-template', { weeklyTemplate: updated });
      setAvailability(res.data.availability);
    } catch { alert('Failed to update'); }
  };

  return (
    <PageLayout
      title="Calendar & Availability"
      subtitle="Manage your weekly schedule and see upcoming sessions."
      actions={
        <button onClick={() => setShowAvailModal(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Availability
        </button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming bookings - larger */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Upcoming bookings</h2>
            <span className="badge-neutral">{bookings.length} total</span>
          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 font-medium">No bookings yet</p>
              <p className="text-xs text-slate-500 mt-1">Share your public link to start receiving bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 10).map(b => (
                <div key={b._id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-sm font-semibold flex-shrink-0">
                      {b.clientId?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{b.clientId?.name || 'Client'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(b.startTime)}</p>
                    </div>
                  </div>
                  <span className={`badge-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'neutral'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly availability */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Weekly hours</h2>
          </div>

          <div className="space-y-3">
            {availability?.weeklyTemplate?.map(t => (
              <div key={t.dayOfWeek} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{DAYS[t.dayOfWeek]}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.startTime} – {t.endTime}</p>
                </div>
                <span className={`badge-${t.isActive ? 'success' : 'neutral'}`}>
                  {t.isActive ? 'Active' : 'Off'}
                </span>
              </div>
            ))}
            {!availability?.weeklyTemplate?.length && (
              <p className="text-sm text-slate-500 text-center py-4">No schedule set</p>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showAvailModal} onClose={() => setShowAvailModal(false)} title="Edit availability" size="lg">
        <div className="space-y-3">
          {availability?.weeklyTemplate?.map(t => (
            <div key={t.dayOfWeek} className="grid grid-cols-5 gap-2 items-center">
              <span className="text-sm text-slate-700">{DAYS[t.dayOfWeek]}</span>
              <input
                type="time"
                value={t.startTime}
                onChange={(e) => updateWeeklyTemplate(t.dayOfWeek, e.target.value, t.endTime, t.isActive)}
                className="input-field text-sm py-2"
              />
              <input
                type="time"
                value={t.endTime}
                onChange={(e) => updateWeeklyTemplate(t.dayOfWeek, t.startTime, e.target.value, t.isActive)}
                className="input-field text-sm py-2"
              />
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input
                  type="checkbox"
                  checked={t.isActive}
                  onChange={(e) => updateWeeklyTemplate(t.dayOfWeek, t.startTime, t.endTime, e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-600">Available</span>
              </label>
            </div>
          ))}
        </div>
      </Modal>
    </PageLayout>
  );
};

export default BookingCalendar;