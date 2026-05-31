import React, { useState } from 'react';

// Reusable question editor form. Calls onSave(question) with a normalized question object.
export default function QuestionEditor({ initial = {}, onSave, onCancel }) {
  const [type, setType] = useState(initial.type || 'multiple-choice');
  const [text, setText] = useState(initial.text || '');
  const [options, setOptions] = useState(initial.options?.length ? initial.options : ['', '']);
  const [correctOption, setCorrectOption] = useState(initial.correctOption ?? 0);
  const [correctAnswer, setCorrectAnswer] = useState(initial.correctAnswer || '');
  const [explanation, setExplanation] = useState(initial.explanation || '');
  const [points, setPoints] = useState(initial.points ?? 1);
  const [timeLimit, setTimeLimit] = useState(initial.timeLimit ?? '');
  const [tags, setTags] = useState((initial.tags || []).join(', '));
  const [error, setError] = useState('');

  const setOption = (i, v) => setOptions(options.map((o, idx) => idx === i ? v : o));
  const addOption = () => setOptions([...options, '']);
  const removeOption = (i) => {
    const next = options.filter((_, idx) => idx !== i);
    setOptions(next);
    if (correctOption >= next.length) setCorrectOption(0);
  };

  const save = () => {
    if (!text.trim()) return setError('Question text is required');
    if (type === 'multiple-choice') {
      const filled = options.filter(o => o.trim());
      if (filled.length < 2) return setError('Provide at least 2 options');
    }
    onSave({
      id: initial.id,
      type, text: text.trim(),
      options: type === 'multiple-choice' ? options : [],
      correctOption: type === 'multiple-choice' ? Number(correctOption) : null,
      correctAnswer: type === 'short-answer' ? correctAnswer : '',
      explanation,
      points: Number(points) || 1,
      timeLimit: timeLimit === '' ? null : Number(timeLimit),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div>
      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="form-group">
        <label className="form-label">Question Type</label>
        <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="short-answer">Short Answer</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Question Text *</label>
        <textarea className="form-textarea" value={text} onChange={e => setText(e.target.value)} />
      </div>

      {type === 'multiple-choice' && (
        <div className="form-group">
          <label className="form-label">Options (select the correct one)</label>
          {options.map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <input type="radio" name="correct" checked={Number(correctOption) === i} onChange={() => setCorrectOption(i)} />
              <input className="form-input" style={{ flex: 1 }} value={o} onChange={e => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
              {options.length > 2 && <button className="btn btn-danger btn-sm" onClick={() => removeOption(i)}>✕</button>}
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={addOption}>+ Add Option</button>
        </div>
      )}

      {type === 'short-answer' && (
        <div className="form-group">
          <label className="form-label">Model Answer (for reference — not auto-graded)</label>
          <input className="form-input" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} />
        </div>
      )}

      <div className="form-row">
        <div className="form-group"><label className="form-label">Points</label><input className="form-input" type="number" min="0" step="0.5" value={points} onChange={e => setPoints(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Time Limit (sec, optional)</label><input className="form-input" type="number" min="0" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="No limit" /></div>
      </div>

      <div className="form-group"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="Unit 1, Easy" value={tags} onChange={e => setTags(e.target.value)} /></div>
      <div className="form-group"><label className="form-label">Explanation (optional)</label><input className="form-input" value={explanation} onChange={e => setExplanation(e.target.value)} /></div>

      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Save Question</button>
      </div>
    </div>
  );
}
