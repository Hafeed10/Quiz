import React, { useState } from 'react';
import { Search, Filter, Edit3, Eye, BookOpen, CheckCircle2 } from 'lucide-react';
import { CustomDropdown } from '../../components/CustomDropdown';

export const QuizHistoryView = ({ quizzes, onSelectQuiz, onEditQuiz, onDeleteQuiz: _onDeleteQuiz, onMakeLive: _onMakeLive, onCloseQuiz }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const getQuizStatus = (q) => {
    const isDraft = q.status === 'DRAFT' || q.dynamic_status === 'DRAFT';
    if (isDraft) return { status: 'DRAFT', label: 'DRAFT', badgeClass: 'badge-ended', isLive: false, isCompleted: false, isDraft: true };

    const hasWinner = Boolean(q.winner_name && q.winner_name.trim() && q.winner_name !== '—');
    const todayStr = new Date().toISOString().split('T')[0];
    const isPastDate = Boolean(q.quiz_date && q.quiz_date < todayStr);
    const isExplicitCompleted = q.dynamic_status === 'ENDED' || q.dynamic_status === 'ARCHIVED' || q.dynamic_status === 'COMPLETED' || q.status === 'ENDED' || q.status === 'ARCHIVED';

    if (isExplicitCompleted || hasWinner || isPastDate) {
      return { status: 'COMPLETED', label: 'COMPLETED', badgeClass: 'badge-completed', isLive: false, isCompleted: true, isDraft: false };
    }

    if (q.dynamic_status === 'LIVE' || q.status === 'LIVE') {
      return { status: 'LIVE', label: 'LIVE', badgeClass: 'badge-live', isLive: true, isCompleted: false, isDraft: false };
    }

    return { status: 'SCHEDULED', label: 'SCHEDULED', badgeClass: 'badge-scheduled', isLive: false, isCompleted: false, isDraft: false };
  };

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

    const quizStatusInfo = getQuizStatus(q);
    const matchesStatus =
      statusFilter === 'ALL' ||
      statusFilter === quizStatusInfo.status;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
      }}>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.2,
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Quiz Ledger & History
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '13px',
            fontWeight: 500,
            marginTop: '6px',
            marginBottom: 0,
          }}>
            Comprehensive ledger of all daily academic assessments. Inspect submissions, manage live availability, or update content.
          </p>
        </div>

        {/* Global Record Metric */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: '#f8fafc',
          padding: '10px 18px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Assessments</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{quizzes.length} Quizzes</div>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{
        background: '#ffffff',
        padding: '18px 24px',
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.02)',
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#f8fafc',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid #cbd5e1',
          width: '320px',
          maxWidth: '100%',
        }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by title or date (YYYY-MM-DD)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              width: '100%',
            }}
          />
        </div>

        {/* Dropdown Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} />
            <span>Filter Status:</span>
          </div>
          <div style={{ width: '220px' }}>
            <CustomDropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                background: '#f8fafc',
                borderBottom: '1.5px solid #e2e8f0',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <th style={{ padding: '16px 24px' }}>DATE</th>
                <th style={{ padding: '16px 24px' }}>QUIZ TITLE & ID</th>
                <th style={{ padding: '16px 24px' }}>STATUS</th>
                <th style={{ padding: '16px 24px' }}>PARTICIPANTS</th>
                <th style={{ padding: '16px 24px' }}>AVG. SCORE</th>
                <th style={{ padding: '16px 24px' }}>WINNER</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                    <BookOpen size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>No Quizzes Found</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>No historical quizzes match your search criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((q, idx) => {
                  const statusInfo = getQuizStatus(q);
                  const isDraft = statusInfo.isDraft;
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
                      <td style={{ padding: '18px 24px', color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>
                        {q.quiz_date}
                      </td>

                      {/* Title */}
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                          {q.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          {idLabel}
                        </div>
                      </td>

                      {/* Status Pill */}
                      <td style={{ padding: '18px 24px' }}>
                        <span className={`badge ${statusInfo.badgeClass}`} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800 }}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Participants */}
                      <td style={{ padding: '18px 24px', color: '#0f172a', fontWeight: 700 }}>
                        {isDraft ? '—' : q.completed_count ?? q.participants_count ?? 0}
                      </td>

                      {/* Avg. Score */}
                      <td style={{ padding: '18px 24px', color: '#065f46', fontWeight: 800 }}>
                        {isDraft || q.average_score === null || q.average_score === undefined ? '—' : `${q.average_score}/4`}
                      </td>

                      {/* Winner */}
                      <td style={{ padding: '18px 24px', color: '#0f172a', fontWeight: 700 }}>
                        {isDraft ? '—' : q.winner_name || '—'}
                      </td>

                      {/* Actions: Edit, Details, Complete */}
                      <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* Details / View Submissions Button */}
                          <button
                            onClick={() => onSelectQuiz(q.id)}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '8px',
                              color: '#065f46',
                              fontWeight: 800,
                              fontSize: '11px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
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
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          {/* Edit Quiz Button */}
                          <button
                            onClick={() => onEditQuiz(q)}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              color: '#334155',
                              fontWeight: 800,
                              fontSize: '11px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              transition: 'all 0.15s ease',
                            }}
                            title="Edit Questions & Content"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#0f172a';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#0f172a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.color = '#334155';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>

                          {/* Complete / Close Quiz Button */}
                          {statusInfo.isLive && onCloseQuiz && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Mark "${q.title}" as COMPLETED and conclude live assessment?`)) {
                                  onCloseQuiz(q.id);
                                }
                              }}
                              style={{
                                background: '#fff1f2',
                                border: '1px solid #fecdd3',
                                borderRadius: '8px',
                                color: '#be123c',
                                fontWeight: 800,
                                fontSize: '11px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                transition: 'all 0.15s ease',
                              }}
                              title="Mark Quiz as Completed"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#be123c';
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.borderColor = '#be123c';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff1f2';
                                e.currentTarget.style.color = '#be123c';
                                e.currentTarget.style.borderColor = '#fecdd3';
                              }}
                            >
                              <CheckCircle2 size={14} />
                              <span>Complete</span>
                            </button>
                          )}
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
          padding: '16px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#64748b',
        }}>
          <span>Showing <strong>1 to {filteredQuizzes.length}</strong> of {quizzes.length} total quizzes</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Full Sync • Changes synced to Backend</span>
        </div>
      </div>
    </div>
  );
};
