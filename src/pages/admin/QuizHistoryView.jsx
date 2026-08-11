import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Search, Filter, ArrowRight, Edit3, Trash2, Eye, ChevronLeft, ChevronRight, Calendar, AlertTriangle, X } from 'lucide-react';
import { CustomDropdown } from '../../components/CustomDropdown';

export const QuizHistoryView = ({ quizzes, onSelectQuiz, onEditQuiz, onDeleteQuiz, onMakeLive, onCloseQuiz }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'LIVE', label: 'Live Now', badge: 'LIVE', badgeClass: 'badge-live' },
    { value: 'COMPLETED', label: 'Completed / Ended', badge: 'COMPLETED', badgeClass: 'badge-completed' },
    { value: 'SCHEDULED', label: 'Scheduled', badge: 'SCHEDULED', badgeClass: 'badge-scheduled' },
    { value: 'DRAFT', label: 'Draft', badge: 'DRAFT', badgeClass: 'badge-ended' },
  ];

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.quiz_date.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'ALL' ||
      q.dynamic_status === statusFilter ||
      q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const confirmDelete = async () => {
    if (!quizToDelete || !onDeleteQuiz) return;
    setIsDeleting(true);
    try {
      await onDeleteQuiz(quizToDelete.id);
      setQuizToDelete(null);
    } catch (err) {
      alert(`Error deleting quiz: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.15,
            marginBottom: '6px',
          }}>
            Quiz History & Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Comprehensive ledger of all daily academic assessments. Edit configurations, inspect submissions, or remove quizzes.
          </p>
        </div>

        {/* Right Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '34px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '12px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '6px',
                color: '#0f172a',
                width: '180px',
              }}
            />
          </div>

          {/* Custom Status Filter Dropdown */}
          <CustomDropdown
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            width="200px"
          />
        </div>
      </div>

      {/* Ledger Table Card */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                <th style={{ padding: '14px 20px' }}>DATE</th>
                <th style={{ padding: '14px 20px' }}>TITLE</th>
                <th style={{ padding: '14px 20px' }}>STATUS</th>
                <th style={{ padding: '14px 20px' }}>PARTICIPANTS</th>
                <th style={{ padding: '14px 20px' }}>AVG. SCORE</th>
                <th style={{ padding: '14px 20px' }}>WINNER</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No historical quizzes match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((q, idx) => {
                  const isDraft = q.status === 'DRAFT';
                  const isLive = q.dynamic_status === 'LIVE';
                  const isCompleted = q.dynamic_status === 'ENDED' || q.status === 'ENDED';
                  const idLabel = `ID: LX-${String(q.id).padStart(3, '0')}-${String.fromCharCode(65 + (idx % 26))}`;

                  return (
                    <tr
                      key={q.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Date */}
                      <td style={{ padding: '16px 20px', color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        {q.quiz_date}
                      </td>

                      {/* Title */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                          {q.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          {idLabel}
                        </div>
                      </td>

                      {/* Status Pill */}
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`badge ${isLive ? 'badge-live' : isDraft ? 'badge-ended' : 'badge-completed'}`}>
                          {isCompleted ? 'COMPLETED' : q.dynamic_status || q.status}
                        </span>
                      </td>

                      {/* Participants */}
                      <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: 600 }}>
                        {isDraft ? '—' : q.completed_count ?? q.participants_count ?? 0}
                      </td>

                      {/* Avg. Score */}
                      <td style={{ padding: '16px 20px', color: '#065f46', fontWeight: 700 }}>
                        {isDraft || q.average_score === null || q.average_score === undefined ? '—' : `${q.average_score}/4`}
                      </td>

                      {/* Winner */}
                      <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: 600 }}>
                        {isDraft ? '—' : q.winner_name || '—'}
                      </td>

                      {/* Actions: Edit, Delete, Details */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          {/* Details / View Submissions Button */}
                          <button
                            onClick={() => onSelectQuiz(q.id)}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '6px',
                              color: '#065f46',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '5px 9px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              transition: 'all 0.15s ease',
                            }}
                            title="View Quiz Submissions & Analytics"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#065f46';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ecfdf5';
                              e.currentTarget.style.color = '#065f46';
                            }}
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>

                          {/* Edit Quiz Button */}
                          <button
                            onClick={() => onEditQuiz(q)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              color: '#334155',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '5px 9px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              transition: 'all 0.15s ease',
                            }}
                            title="Edit Questions & Content"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#334155';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#334155';
                            }}
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          {/* Delete Quiz Button */}
                          <button
                            onClick={() => setQuizToDelete(q)}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              color: '#dc2626',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '5px 9px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              transition: 'all 0.15s ease',
                            }}
                            title="Delete Quiz"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#dc2626';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fef2f2';
                              e.currentTarget.style.color = '#dc2626';
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Bar */}
        <div style={{
          padding: '14px 20px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748b',
        }}>
          <div>
            Showing <strong>1 to {filteredQuizzes.length}</strong> of {filteredQuizzes.length} entries
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>
              Full CRUD Enabled • Changes synced to MongoDB Atlas
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {quizToDelete && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setQuizToDelete(null)}>
          <div
            className="modal-container modal-container-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuizToDelete(null)}
              className="modal-close-btn"
              title="Cancel"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingRight: '36px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                minWidth: '42px',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Delete Daily Quiz?
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                {quizToDelete.title}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Date: <strong>{quizToDelete.quiz_date}</strong> • Status: <strong>{quizToDelete.dynamic_status || quizToDelete.status}</strong>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '22px' }}>
              Are you sure you want to permanently delete this quiz? All associated questions, options, and participant attempts will also be removed.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setQuizToDelete(null)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                disabled={isDeleting}
              >
                <Trash2 size={14} />
                {isDeleting ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
