import React, { useState } from 'react';
import { api } from '../../api/client';
import { Sparkles, Calendar, Clock, Save, ArrowLeft } from 'lucide-react';

const defaultQuestion = (num) => ({
  question_number: num,
  question_text: '',
  options: [
    { option_key: 'A', option_text: '', is_correct: false },
    { option_key: 'B', option_text: '', is_correct: false },
    { option_key: 'C', option_text: '', is_correct: false },
    { option_key: 'D', option_text: '', is_correct: false },
  ],
});

export const QuizBuilder = ({ quizToEdit, onSaved, onCancel }) => {
  const [title, setTitle] = useState(quizToEdit?.title || '');
  const [quizDate, setQuizDate] = useState(quizToEdit?.quiz_date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(quizToEdit?.start_time || '10:00');
  const [endTime, setEndTime] = useState(quizToEdit?.end_time || '10:05');
  const [durationMinutes, setDurationMinutes] = useState(quizToEdit?.duration_minutes || 20);
  const [passageTitle, setPassageTitle] = useState(quizToEdit?.passage_title || '');
  const [passageContent, setPassageContent] = useState(quizToEdit?.passage_content || '');
  const [instructions, setInstructions] = useState(
    quizToEdit?.instructions || 'Read the following paragraph carefully before answering the 4 questions below.'
  );
  const [status, setStatus] = useState(quizToEdit?.status || 'SCHEDULED');
  const [questions, setQuestions] = useState(() => {
    if (quizToEdit?.questions?.length === 4) {
      return quizToEdit.questions;
    }
    return [defaultQuestion(1), defaultQuestion(2), defaultQuestion(3), defaultQuestion(4)];
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleQuestionTextChange = (idx, text) => {
    const updated = [...questions];
    updated[idx].question_text = text;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx, optIdx, text) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].option_text = text;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIdx, optIdx) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.map((opt, i) => ({
      ...opt,
      is_correct: i === optIdx,
    }));
    setQuestions(updated);
  };

  const validate = () => {
    const errs = [];
    if (!title.trim()) errs.push('Quiz title is required.');
    if (!passageContent.trim()) errs.push('Reading passage content cannot be empty.');
    if (questions.length !== 4) errs.push('Quiz must contain exactly 4 questions.');

    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      if (!q.question_text.trim()) errs.push(`Question ${qNum} text is missing.`);
      const correctCount = q.options.filter((o) => o.is_correct).length;
      if (correctCount !== 1) errs.push(`Question ${qNum} must have exactly 1 correct answer selected.`);
      q.options.forEach((opt) => {
        if (!opt.option_text.trim()) errs.push(`Question ${qNum}, Option ${opt.option_key} is empty.`);
      });
    });

    setErrors(errs);
    return errs.length === 0;
  };

  const normalizeTimeTo24h = (timeStr) => {
    if (!timeStr) return '10:00';
    const str = String(timeStr).trim();
    const match = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (!match) return str;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const modifier = match[3]?.toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const normalizeDateToISO = (dateStr) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const str = String(dateStr).trim();
    const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const [, m, d, y] = slashMatch;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return str;
  };

  const handleSave = async (targetStatus) => {
    if (!validate()) return;

    setSaving(true);
    setErrors([]);

    const finalTitle = title.trim() || passageTitle.trim() || 'Daily Reading Assessment';
    const payload = {
      title: finalTitle,
      quiz_date: normalizeDateToISO(quizDate),
      start_time: normalizeTimeTo24h(startTime),
      end_time: normalizeTimeTo24h(endTime),
      duration_minutes: Number(durationMinutes) || 20,
      passage_title: passageTitle.trim() || finalTitle,
      passage_content: passageContent.trim(),
      instructions,
      status: targetStatus || status,
      questions,
    };

    try {
      let res;
      if (quizToEdit?.id) {
        res = await api.updateAdminQuiz(quizToEdit.id, payload);
      } else {
        res = await api.createAdminQuiz(payload);
      }
      if (onSaved) onSaved(res);
    } catch (err) {
      const extractedErrors = [];
      if (err.data && typeof err.data === 'object') {
        Object.entries(err.data).forEach(([field, msgs]) => {
          const list = Array.isArray(msgs) ? msgs : [msgs];
          list.forEach(m => {
            extractedErrors.push(typeof m === 'string' ? `${field}: ${m}` : JSON.stringify(m));
          });
        });
      }
      if (extractedErrors.length === 0) {
        extractedErrors.push(err.message || 'Failed to save quiz.');
      }
      setErrors(extractedErrors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '28px', maxWidth: '880px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
            {quizToEdit ? 'Edit Daily Quiz' : 'Create Daily Quiz Session'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Configure the reading passage, 4 multiple-choice questions, and correct answers.
          </p>
        </div>

        {onCancel && (
          <button onClick={onCancel} className="btn-secondary" style={{ padding: '6px 12px' }}>
            <ArrowLeft size={14} /> Back
          </button>
        )}
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '13px',
        }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Please resolve the following:</strong>
          <ul style={{ paddingLeft: '20px' }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Section 1: Basic Config */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Quiz Title *
          </label>
          <input
            type="text"
            placeholder="e.g. The James Webb Space Telescope & Deep Space Discovery"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Quiz Date *
          </label>
          <input
            type="date"
            value={quizDate}
            onChange={(e) => setQuizDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Start Time *
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            End Time *
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Duration (Minutes) *
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Section 2: Reading Passage */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>
          Reading Passage & Instructions
        </h3>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Passage Title (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Breakthroughs in Optical Infrared Astronomy"
            value={passageTitle}
            onChange={(e) => setPassageTitle(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Passage Content *
          </label>
          <textarea
            rows={6}
            placeholder="Paste the daily reading paragraph here..."
            value={passageContent}
            onChange={(e) => setPassageContent(e.target.value)}
            style={{ width: '100%', lineHeight: 1.6 }}
          />
        </div>
      </div>

      {/* Section 3: 4 Questions */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Four Multiple-Choice Questions (Exactly 4)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Select the radio button next to the 1 correct answer for each question.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-completed">
                  Question {qIdx + 1}
                </span>
              </div>

              <input
                type="text"
                placeholder={`Enter Question ${qIdx + 1} text...`}
                value={q.question_text}
                onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                style={{ width: '100%', marginBottom: '12px', background: '#ffffff' }}
              />

              {/* 4 Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: opt.is_correct ? '#f0fdf4' : '#ffffff',
                      border: opt.is_correct ? '1.5px solid #16a34a' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '6px 10px',
                    }}
                  >
                    <input
                      type="radio"
                      name={`correct_${qIdx}`}
                      checked={opt.is_correct}
                      onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                      style={{ cursor: 'pointer' }}
                      title="Mark as correct answer"
                    />
                    <strong style={{ fontSize: '12px', color: opt.is_correct ? '#16a34a' : 'var(--text-muted)' }}>
                      {opt.option_key}.
                    </strong>
                    <input
                      type="text"
                      placeholder={`Option ${opt.option_key} text...`}
                      value={opt.option_text}
                      onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                      style={{ flex: 1, border: 'none', background: 'transparent', padding: '4px', fontSize: '13px' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <button
          onClick={() => handleSave('DRAFT')}
          disabled={saving}
          className="btn-secondary"
        >
          Save as Draft
        </button>

        <button
          onClick={() => handleSave('LIVE')}
          disabled={saving}
          className="btn-primary"
        >
          <Sparkles size={15} />
          {saving ? 'Saving...' : 'Save & Publish Quiz'}
        </button>
      </div>
    </div>
  );
};
