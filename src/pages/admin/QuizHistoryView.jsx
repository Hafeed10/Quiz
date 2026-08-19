import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Search, Filter, ArrowRight, Edit3, Eye, Calendar, BookOpen } from 'lucide-react';
import { CustomDropdown } from '../../components/CustomDropdown';

export const QuizHistoryView = ({ quizzes, onSelectQuiz, onEditQuiz, onDeleteQuiz, onMakeLive, onCloseQuiz }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
      (statusFilter === 'COMPLETED' && (q.dynamic_status === 'ENDED' || q.dynamic_status === 'ARCHIVED' || q.dynamic_status === 'COMPLETED' || q.status === 'ENDED' || q.status === 'ARCHIVED')) ||
      (statusFilter === 'LIVE' && (q.dynamic_status === 'LIVE' || q.status === 'LIVE')) ||
      (statusFilter === 'SCHEDULED' && (q.dynamic_status === 'SCHEDULED' || q.status === 'SCHEDULED')) ||
      (statusFilter === 'DRAFT' && (q.status === 'DRAFT' || q.dynamic_status === 'DRAFT')) ||
      q.dynamic_status === statusFilter ||
      q.status === statusFilter;

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
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            Comprehensive ledger of all daily academic assessments. Inspect submissions, manage live availability, or update content.
          </p>
        </div>

        {/* Right Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by title or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: '38px',
                paddingRight: '14px',
                paddingTop: '9px',
                paddingBottom: '9px',
                fontSize: '13px',
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                color: '#0f172a',
                width: '220px',
                outline: 'none',
                fontWeight: 600,
                transition: 'border 0.15s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#059669')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
            />
          </div>

          {/* Custom Status Filter Dropdown */}
          <CustomDropdown
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            width="210px"
          />
        </div>
      </div>

      {/* Ledger Table Card */}
      <div className="glass-card" style={{
        overflow: 'hidden',
        background: '#ffffff',
        borderRadius: '20px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.05)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{
                borderBottom: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                <th style={{ padding: '16px 24px' }}>DATE</th>
                <th style={{ padding: '16px 24px' }}>QUIZ TITLE</th>
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
                        <span className={`badge ${isLive ? 'badge-live' : isDraft ? 'badge-ended' : 'badge-completed'}`} style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 800 }}>
                          {isCompleted ? 'COMPLETED' : q.dynamic_status || q.status}
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

                      {/* Actions: Edit, Details */}
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
