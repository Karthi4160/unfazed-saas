import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const ClientNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNote, setExpandedNote] = useState(null);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes/client/${user?.id}`);
      setNotes(res.data.notes || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <PageLayout
      title="Shared Notes"
      subtitle="Session summaries your therapist has shared with you."
    >
      {loading ? (
        <div className="card text-center py-12 text-slate-500">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="card text-center py-20">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-base font-medium text-slate-700">No shared notes yet</p>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            When your therapist shares a session summary with you, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(n => {
            const isExpanded = expandedNote === n._id;
            return (
              <button
                key={n._id}
                type="button"
                onClick={() => setExpandedNote(isExpanded ? null : n._id)}
                className={`card-hover text-left cursor-pointer flex flex-col ${
                  isExpanded ? 'border-emerald-300 bg-emerald-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4.5 h-4.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="badge-success flex-shrink-0">Shared</span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
                  {n.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {formatDate(n.sessionDate)}
                </p>

                <p className={`text-sm text-slate-600 leading-relaxed flex-1 ${
                  isExpanded ? '' : 'line-clamp-3'
                }`}>
                  {n.content}
                </p>

                {n.content?.length > 150 && (
                  <p className="text-xs text-emerald-600 font-medium mt-3">
                    {isExpanded ? 'Click to collapse' : 'Click to read more →'}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};

export default ClientNotes;