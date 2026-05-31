import React, { useState, useEffect } from 'react';
import { api } from './api.js';
import { Loading } from './components.js';

export default function StudentResults({ examId, onBack }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/student/results/${examId}`).then(d => setResult(d.result)).catch(e => setError(e.message));
  }, [examId]);

  if (error) return (
    <div className="main-content" style={{ margin: 0, padding: 40 }}>
      <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
      <div className="empty-state"><div className="empty-icon">🔒</div><h3>{error}</h3></div>
    </div>
  );
  if (!result) return <Loading />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back to exams</button>
      <div className="panel" style={{ marginTop: 16, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 15, color: '#64748b' }}>{result.examTitle}</div>
        <div style={{ fontSize: 56, fontWeight: 800, color: result.passed ? 'var(--green)' : 'var(--red)', letterSpacing: -2, margin: '10px 0' }}>{result.percentScore}%</div>
        <div style={{ fontSize: 16 }}>{result.totalScore} / {result.totalPoints} points</div>
        <div style={{ marginTop: 14 }}>
          <span className={`badge ${result.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 14, padding: '6px 16px' }}>
            {result.passed ? '✅ Passed' : '❌ Failed'} (pass mark: {result.passingScore}%)
          </span>
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: '#64748b' }}>
          Time taken: {Math.floor((result.timeTaken || 0) / 60)}m {(result.timeTaken || 0) % 60}s · Submitted {new Date(result.submittedAt).toLocaleString()}
        </div>
      </div>

      {(result.sections || []).map((sec, si) => (
        <div key={si} className="panel">
          <div className="panel-title">{sec.sectionName}</div>
          {sec.questions.map((q, qi) => (
            <div key={qi} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{qi + 1}. {q.questionText}</div>
              <div style={{ fontSize: 13 }}>
                {q.questionType === 'multiple-choice' ? (
                  q.isCorrect
                    ? <span className="badge badge-success">Correct</span>
                    : <span className="badge badge-danger">Incorrect</span>
                ) : <span className="badge badge-info">Manually graded</span>}
                <span style={{ float: 'right', color: '#64748b' }}>{q.pointsEarned}/{q.maxPoints} pts</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
