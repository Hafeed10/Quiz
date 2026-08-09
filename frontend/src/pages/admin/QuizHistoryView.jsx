import React, { useState } from 'react';
import { Search, Filter, ArrowRight, Edit3, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { CustomDropdown } from '../../components/CustomDropdown';

export const QuizHistoryView = ({ quizzes, onSelectQuiz, onEditQuiz }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

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
            Quiz History
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            A comprehensive ledger of all past academic assessments, including completion status and top-level analytics.
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

      {/* Ledger Table Card in Crisp White */}
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
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>ACTION</th>
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
                        {isDraft ? '—' : q.completed_count || q.participants_count || 120}
                      </td>

                      {/* Avg. Score */}
                      <td style={{ padding: '16px 20px', color: '#065f46', fontWeight: 700 }}>
                        {isDraft ? '—' : '82%'}
                      </td>

                      {/* Winner */}
                      <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: 600 }}>
                        {isDraft ? '—' : q.winner_name || 'Rahul S.'}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {isDraft ? (
                          <button
                            onClick={() => onEditQuiz(q)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#065f46',
                              fontWeight: 700,
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            EDIT <Edit3 size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectQuiz(q.id)}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '4px',
                              color: '#065f46',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#065f46';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ecfdf5';
                              e.currentTarget.style.color = '#065f46';
                            }}
                          >
                            DETAILS <ArrowRight size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Bar */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              disabled={currentPage === 1}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <ChevronLeft size={14} />
            </button>

            <button style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: '#065f46',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
            }}>
              1
            </button>

            <button style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              fontSize: '12px',
              cursor: 'pointer',
            }}>
              2
            </button>

            <button style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              fontSize: '12px',
              cursor: 'pointer',
            }}>
              3
            </button>

            <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>

            <button
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
