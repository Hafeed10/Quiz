import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select quiz option...',
  width = 'auto',
  popoverWidth = 'max-content',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find matching option or fall back to the first available option
  const selectedOption =
    options.find((opt) => String(opt.value) === String(value)) ||
    (options.length > 0 ? options[0] : null);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        width,
        display: 'inline-block',
        zIndex: isOpen ? 9999 : 1,
      }}
    >
      {/* Trigger Button - Always shows selected quiz */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '9px 16px',
          background: '#ffffff',
          border: isOpen ? '2px solid #059669' : '1.5px solid #cbd5e1',
          borderRadius: 'var(--radius-md)',
          color: '#0f172a',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.15s ease',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#059669')}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = '#cbd5e1';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {selectedOption?.badge && (
            <span
              className={`badge ${selectedOption.badgeClass || 'badge-completed'}`}
              style={{ padding: '2px 8px', fontSize: '10px', flexShrink: 0 }}
            >
              {selectedOption.badge}
            </span>
          )}
          <span style={{ color: '#0f172a', fontWeight: 700 }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={16}
          color="#065f46"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '8px',
          }}
        />
      </button>

      {/* Menu Options Popover in Crisp White with Full Width */}
      {isOpen && (
        <div
          className="glass-card animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '100%',
            width: popoverWidth,
            maxWidth: '640px',
            zIndex: 99999,
            background: '#ffffff',
            border: '2px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '8px',
            maxHeight: '360px',
            overflowY: 'auto',
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No quizzes available.
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = selectedOption && String(opt.value) === String(selectedOption.value);

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? '#065f46' : '#1e293b',
                    background: isSelected ? '#ecfdf5' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                    border: isSelected ? '1px solid #a7f3d0' : '1px solid transparent',
                    marginBottom: '3px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#065f46';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#1e293b';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    {opt.badge && (
                      <span
                        className={`badge ${opt.badgeClass || 'badge-completed'}`}
                        style={{
                          padding: '2px 8px',
                          fontSize: '10px',
                          flexShrink: 0,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {opt.badge}
                      </span>
                    )}
                    <span style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}>
                      {opt.label}
                    </span>
                  </div>

                  {isSelected && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Check size={13} color="#ffffff" strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
