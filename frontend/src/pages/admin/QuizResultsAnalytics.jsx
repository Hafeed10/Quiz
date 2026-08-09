import React, { useState } from 'react';
import { Calendar, Download, TrendingUp, Award, Users, Repeat, CheckCircle } from 'lucide-react';

export const QuizResultsAnalytics = ({ quizId }) => {
  const [period, setPeriod] = useState('weekly'); // 'daily' | 'weekly'
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '32px',
            fontWeight: 800,
            color: '#1c1917',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '6px',
          }}>
            Engagement Analytics
          </h1>
          <p style={{ fontSize: '13px', color: '#78716c' }}>
            A comprehensive overview of participant interaction and academic performance over the trailing 30-day period.
          </p>
        </div>

        {/* Right Header Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={{
            background: '#ffffff',
            border: '1px solid #e7e5e4',
            borderRadius: '6px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#1c1917',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}>
            <Calendar size={14} color="#78716c" />
            <span>{dateRange}</span>
          </button>

          <button
            onClick={() => alert('Exporting Analytics Report as CSV / PDF...')}
            style={{
              background: '#1c1917',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* Card 1 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '10px',
          padding: '20px 22px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716c' }}>
              AVG. COMPLETION RATE
            </span>
            <span style={{ color: 'var(--accent-gold)' }}>📈</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#1c1917' }}>
              78.4%
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
            }}>
              ↗ +2.1%
            </span>
          </div>

          <div style={{ width: '100%', height: '4px', background: '#f5f5f4', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '78.4%', height: '100%', background: '#1c1917' }} />
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '10px',
          padding: '20px 22px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716c' }}>
              AVG. QUIZ SCORE
            </span>
            <span style={{ color: 'var(--accent-gold)' }}>🎯</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#1c1917' }}>
              3.1 <span style={{ fontSize: '16px', color: '#78716c', fontWeight: 500 }}>/ 4</span>
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
            }}>
              Steady
            </span>
          </div>

          <div style={{ width: '100%', height: '4px', background: '#f5f5f4', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '77.5%', height: '100%', background: 'var(--accent-gold)' }} />
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '10px',
          padding: '20px 22px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716c' }}>
              ACTIVE PARTICIPANTS
            </span>
            <span style={{ color: 'var(--accent-gold)' }}>👥</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#1c1917' }}>
              4,250
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
            }}>
              ↗ +420
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#a8a29e' }}>Unique users in last 30d</span>
        </div>

        {/* Card 4 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '10px',
          padding: '20px 22px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716c' }}>
              RETENTION RATE
            </span>
            <span style={{ color: 'var(--accent-gold)' }}>🏷️</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', fontWeight: 800, color: '#1c1917' }}>
              92%
            </h3>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}>
              ↘ -1.2%
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#a8a29e' }}>Returning users month over month</span>
        </div>
      </div>

      {/* Middle Chart: Participation Trends */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e7e5e4',
        borderRadius: '12px',
        padding: '28px 32px',
        marginBottom: '32px',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '20px',
            fontWeight: 800,
            color: '#1c1917',
          }}>
            Participation Trends
          </h3>

          {/* Daily / Weekly Toggle */}
          <div style={{
            display: 'flex',
            background: '#f5f5f4',
            borderRadius: '6px',
            padding: '3px',
            border: '1px solid #e7e5e4',
          }}>
            <button
              onClick={() => setPeriod('daily')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: period === 'daily' ? '#1c1917' : 'transparent',
                color: period === 'daily' ? '#ffffff' : '#78716c',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: period === 'weekly' ? '#1c1917' : 'transparent',
                color: period === 'weekly' ? '#ffffff' : '#78716c',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Custom SVG Trend Chart */}
        <div style={{ position: 'relative', height: '240px', width: '100%' }}>
          <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid lines */}
            <line x1="40" y1="20" x2="780" y2="20" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="60" x2="780" y2="60" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="100" x2="780" y2="100" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="140" x2="780" y2="140" stroke="#e7e5e4" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="40" y1="180" x2="780" y2="180" stroke="#e7e5e4" strokeWidth="1" />

            {/* Y axis labels */}
            <text x="5" y="24" fontSize="10" fill="#a8a29e" fontFamily="monospace">4,500</text>
            <text x="5" y="64" fontSize="10" fill="#a8a29e" fontFamily="monospace">4,000</text>
            <text x="5" y="104" fontSize="10" fill="#a8a29e" fontFamily="monospace">3,500</text>
            <text x="5" y="144" fontSize="10" fill="#a8a29e" fontFamily="monospace">3,000</text>
            <text x="5" y="184" fontSize="10" fill="#a8a29e" fontFamily="monospace">2,500</text>

            {/* Gold Target Dotted Line */}
            <path
              d="M 60 110 Q 280 90 520 70 T 760 50"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Solid Black Trend Line */}
            <path
              d="M 60 90 Q 280 75 520 50 T 760 40"
              fill="none"
              stroke="#1c1917"
              strokeWidth="2.5"
            />

            {/* Data Points */}
            <circle cx="60" cy="90" r="4" fill="#ffffff" stroke="#1c1917" strokeWidth="2" />
            <circle cx="280" cy="75" r="4" fill="#ffffff" stroke="#1c1917" strokeWidth="2" />
            <circle cx="520" cy="50" r="4" fill="#ffffff" stroke="#1c1917" strokeWidth="2" />
            <circle cx="760" cy="40" r="4" fill="#ffffff" stroke="#1c1917" strokeWidth="2" />

            <circle cx="60" cy="110" r="3.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="280" cy="90" r="3.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="520" cy="70" r="3.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="760" cy="50" r="3.5" fill="#ffffff" stroke="#ca8a04" strokeWidth="2" />

            {/* Active tool label */}
            <g transform="translate(560, 20)">
              <rect x="0" y="0" width="130" height="22" rx="4" fill="#ffffff" stroke="#e7e5e4" />
              <circle cx="10" cy="11" r="3" fill="#1c1917" />
              <text x="18" y="14" fontSize="10" fontWeight="600" fill="#1c1917">4,250 Participants</text>
            </g>

            {/* X axis labels */}
            <text x="50" y="196" fontSize="11" fill="#78716c">Week 1</text>
            <text x="270" y="196" fontSize="11" fill="#78716c">Week 2</text>
            <text x="510" y="196" fontSize="11" fill="#78716c">Week 3</text>
            <text x="750" y="196" fontSize="11" fill="#78716c">Week 4</text>
          </svg>
        </div>
      </div>

      {/* Bottom Two Cards: Score Distribution | Peak Engagement Hours */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
      }}>
        {/* Score Distribution */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '12px',
          padding: '24px 28px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontWeight: 800,
            color: '#1c1917',
            marginBottom: '20px',
          }}>
            Score Distribution
          </h3>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px' }}>
            {[
              { label: '0/4', pct: 5, height: '15px' },
              { label: '1/4', pct: 15, height: '45px' },
              { label: '2/4', pct: 35, height: '110px' },
              { label: '3/4', pct: 45, height: '140px' },
              { label: '4/4', pct: 60, height: '170px' },
            ].map((col, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#a8a29e' }}>{col.pct}%</span>
                <div style={{
                  width: '44px',
                  height: col.height,
                  background: '#1c1917',
                  borderRadius: '4px 4px 0 0',
                }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#57534e' }}>{col.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Engagement Hours */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '12px',
          padding: '24px 28px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.03)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontWeight: 800,
            color: '#1c1917',
            marginBottom: '20px',
          }}>
            Peak Engagement Hours
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { time: '08:00 - 09:00', width: '25%' },
              { time: '09:00 - 10:00', width: '45%' },
              { time: '10:00 - 11:00', width: '70%' },
              { time: '11:00 - 12:00', width: '85%' },
              { time: '12:00 - 13:00', width: '30%' },
            ].map((slot, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
                <span style={{ width: '90px', color: '#78716c', fontFamily: 'monospace' }}>{slot.time}</span>
                <div style={{ flex: 1, height: '22px', background: '#f5f5f4', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: slot.width,
                    height: '100%',
                    background: '#e7e5e4',
                    borderRadius: '4px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
