import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from './api.js';
import { useToast } from './ToastContext.js';

const examStyles = `
  .exam-root { min-height: 100vh; background: #f1f5f9; display: flex; flex-direction: column; }
  .exam-topbar { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
  .exam-title { font-weight: 800; font-size: 18px; }
  .exam-timer { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; padding: 6px 16px; border-radius: 10px; background: #eef2ff; color: #4f46e5; }
  .exam-timer.warn { background: #fef3c7; color: #b45309; }
  .exam-timer.danger { background: #fef2f2; color: #dc2626; animation: pulse 1s infinite; }
  @keyframes pulse { 50% { opacity: 0.6; } }
  .exam-body { flex: 1; display: flex; gap: 24px; max-width: 1100px; width: 100%; margin: 0 auto; padding: 24px; }
  .exam-main { flex: 1; }
  .exam-side { width: 280px; flex-shrink: 0; }
  .q-card { background: #fff; border-radius: 16px; padding: 28px; border: 1px solid #e2e8f0; }
  .q-meta { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
  .q-section-tag { font-size: 12px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; }
  .q-text { font-size: 19px; font-weight: 600; line-height: 1.5; margin-bottom: 24px; }
  .opt { display: flex; align-items: center; gap: 12px; padding: 15px 18px; border: 1.5px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.12s; font-size: 15px; }
  .opt:hover { border-color: #a5b4fc; background: #f8fafc; }
  .opt.selected { border-color: #4f46e5; background: #eef2ff; }
  .opt input { width: 18px; height: 18px; accent-color: #4f46e5; }
  .opt.locked { opacity: 0.55; cursor: not-allowed; }
  .short-input { width: 100%; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 15px; min-height: 120px; font-family: inherit; resize: vertical; }
  .exam-nav-btns { display: flex; justify-content: space-between; margin-top: 24px; gap: 12px; }
  .ebtn { padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; }
  .ebtn-prev { background: #fff; border: 1px solid #e2e8f0; color: #0f172a; }
  .ebtn-next { background: #4f46e5; color: #fff; }
  .ebtn-review { background: #fef3c7; color: #b45309; }
  .ebtn-submit { background: #10b981; color: #fff; }
  .ebtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .palette { background: #fff; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
  .palette-title { font-size: 13px; font-weight: 700; margin-bottom: 14px; }
  .palette-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .pal-btn { aspect-ratio: 1; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; }
  .pal-btn.answered { background: #4f46e5; color: #fff; border-color: #4f46e5; }
  .pal-btn.current { outline: 3px solid #a5b4fc; }
  .pal-btn.review { background: #f59e0b; color: #fff; border-color: #f59e0b; }
  .pal-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; font-size: 12px; color: #64748b; }
  .pal-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .pal-dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }
  .sec-timer { font-size: 13px; color: #64748b; margin-top: 8px; }
  .overlay-msg { position: fixed; inset: 0; background: rgba(15,23,42,0.92); color: #fff; display: flex; align-items: center; justify-content: center; flex-direction: column; z-index: 9999; text-align: center; padding: 40px; }
  .overlay-msg h1 { font-size: 32px; margin-bottom: 16px; }
  .overlay-msg p { font-size: 16px; opacity: 0.85; max-width: 480px; line-height: 1.6; margin-bottom: 24px; }
  .result-box { background: #fff; color: #0f172a; border-radius: 18px; padding: 40px; max-width: 440px; }
`;

function fmt(s) {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export default function StudentExamTaking({ session, onExit }) {
  const { showToast } = useToast();
  const exam = session.exam;
  const sec = exam.security || {};
  const nav = exam.navigation || { mode: 'free', allowBacktrack: true, allowMarkForReview: true };

  // Flatten questions for linear navigation
  const flat = useRef([]);
  if (flat.current.length === 0) {
    exam.sections.forEach((s, si) => s.questions.forEach((q, qi) => {
      flat.current.push({ key: `${s.id}_${q.id}`, q, sectionId: s.id, sectionName: s.name, sectionIdx: si, qIdxInSection: qi, sectionTimeLimit: s.timeLimit });
    }));
  }
  const questions = flat.current;

  const [answers, setAnswers] = useState(session.savedAnswers || {});
  const [marked, setMarked] = useState(new Set(session.markedForReview || []));
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(session.remainingTime || exam.duration * 60);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // result object or {} for pending
  const [kicked, setKicked] = useState(false); // concurrent login
  const [qStartTime, setQStartTime] = useState(Date.now());

  const answersRef = useRef(answers); answersRef.current = answers;
  const remainingRef = useRef(remaining); remainingRef.current = remaining;
  const submittedRef = useRef(false);

  const cur = questions[current];

  // ---- Auto-submit helper ----
  const doSubmit = useCallback(async (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const r = await api(`/api/student/attempts/${session.attemptId}/submit`, { method: 'POST', body: {} });
      setSubmitted(r.result || {});
      if (auto) showToast('Time up — exam auto-submitted', 'info');
    } catch (e) {
      showToast(e.message, 'error');
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [session.attemptId, showToast]);

  // ---- Countdown timer ----
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(t); doSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted, doSubmit]);

  // ---- Periodic remaining-time save ----
  useEffect(() => {
    if (submitted) return;
    const iv = (sec.autoSaveInterval || 30) * 1000;
    const t = setInterval(() => {
      api(`/api/student/attempts/${session.attemptId}/answer`, {
        method: 'PUT',
        body: { sessionToken: session.sessionToken, key: '__heartbeat__', answer: answersRef.current['__heartbeat__'] ?? null, remainingTime: remainingRef.current }
      }).catch(() => {});
    }, iv);
    return () => clearInterval(t);
  }, [submitted, sec.autoSaveInterval, session.attemptId, session.sessionToken]);

  // ---- Reset per-question timer on navigation ----
  useEffect(() => { setQStartTime(Date.now()); }, [current]);

  // ---- Tab switch / focus loss logging ----
  useEffect(() => {
    if (!sec.tabSwitchLogging || submitted) return;
    const onHide = () => {
      if (document.hidden) {
        api(`/api/student/attempts/${session.attemptId}/flag`, { method: 'POST', body: { type: 'tab_switch', details: 'visibility hidden' } })
          .then(() => {
            showToast('Warning: Further attempt will result in failure.', 'error');
          }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [sec.tabSwitchLogging, submitted, session.attemptId, showToast]);

  // ---- Copy / paste / right-click blocking ----
  useEffect(() => {
    if (submitted) return;
    const blockCopy = e => { if (sec.copyPasteBlocked) { e.preventDefault(); } };
    const blockCtx = e => { if (sec.rightClickBlocked) { e.preventDefault(); } };
    if (sec.copyPasteBlocked) { document.addEventListener('copy', blockCopy); document.addEventListener('paste', blockCopy); document.addEventListener('cut', blockCopy); }
    if (sec.rightClickBlocked) document.addEventListener('contextmenu', blockCtx);
    return () => {
      document.removeEventListener('copy', blockCopy); document.removeEventListener('paste', blockCopy); document.removeEventListener('cut', blockCopy);
      document.removeEventListener('contextmenu', blockCtx);
    };
  }, [sec.copyPasteBlocked, sec.rightClickBlocked, submitted]);

  // ---- Fullscreen enforcement ----
  useEffect(() => {
    if (!sec.fullscreenRequired || submitted) return;
    const tryFs = () => { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); };
    tryFs();
    const onFsChange = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        if (sec.tabSwitchLogging) {
          api(`/api/student/attempts/${session.attemptId}/flag`, { method: 'POST', body: { type: 'fullscreen_exit' } }).catch(() => {});
        }
        showToast('Please stay in fullscreen mode', 'error');
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [sec.fullscreenRequired, sec.tabSwitchLogging, submitted, session.attemptId, showToast]);

  // ---- Save a single answer ----
  const persist = useCallback((key, answer) => {
    const timeSpent = Math.round((Date.now() - qStartTime) / 1000);
    api(`/api/student/attempts/${session.attemptId}/answer`, {
      method: 'PUT',
      body: { sessionToken: session.sessionToken, key, answer, timeSpent, remainingTime: remainingRef.current }
    }).then(() => {}).catch(e => {
      if (e.data?.reason === 'concurrent_login') setKicked(true);
    });
  }, [session.attemptId, session.sessionToken, qStartTime]);

  const setAnswer = (key, val) => {
    setAnswers(prev => { const next = { ...prev, [key]: val }; return next; });
    persist(key, val);
  };

  const toggleReview = () => {
    const key = cur.key;
    const isMarked = marked.has(key);
    setMarked(prev => { const n = new Set(prev); isMarked ? n.delete(key) : n.add(key); return n; });
    api(`/api/student/attempts/${session.attemptId}/review`, { method: 'PUT', body: { key, marked: !isMarked } }).catch(() => {});
  };

  const goto = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    if (nav.mode === 'sequential' && !nav.allowBacktrack && idx < current) return; // no going back
    setCurrent(idx);
  };

  const answeredCount = questions.filter(q => {
    const v = answers[q.key];
    return v !== undefined && v !== null && v !== '';
  }).length;

  // ===== RENDER =====
  if (kicked) {
    return (<><style>{examStyles}</style><div className="overlay-msg">
      <h1>⚠️ Session conflict</h1>
      <p>This exam was opened on another device. For security, this session has been locked. Contact your instructor if this is a mistake.</p>
      <button className="ebtn ebtn-next" onClick={onExit}>Exit</button>
    </div></>);
  }

  if (submitted) {
    const r = submitted;
    const hasResult = r && r.percentScore !== undefined;
    return (<><style>{examStyles}</style><div className="overlay-msg">
      <div className="result-box">
        <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
        <h1 style={{ color: '#0f172a' }}>Submitted!</h1>
        {hasResult ? (
          <>
            <div style={{ fontSize: 52, fontWeight: 800, color: r.passed ? '#10b981' : '#ef4444', margin: '12px 0' }}>{r.percentScore}%</div>
            <p style={{ color: '#64748b' }}>{r.totalScore} / {r.totalPoints} points · {r.passed ? 'Passed' : 'Failed'}</p>
          </>
        ) : (
          <p style={{ color: '#64748b' }}>Your responses were recorded. Results will be available once your teacher publishes them.</p>
        )}
        <button className="ebtn ebtn-next" style={{ marginTop: 20 }} onClick={() => { if (document.fullscreenElement) document.exitFullscreen?.(); onExit(); }}>Back to my exams</button>
      </div>
    </div></>);
  }

  const timerClass = remaining < 60 ? 'danger' : remaining < 300 ? 'warn' : '';
  const val = answers[cur.key];
  const isAnswered = (k) => { const v = answers[k]; return v !== undefined && v !== null && v !== ''; };

  return (
    <>
      <style>{examStyles}</style>
      <div className="exam-root">
        <div className="exam-topbar">
          <div className="exam-title">{exam.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className={`exam-timer ${timerClass}`}>{fmt(remaining)}</div>
          </div>
        </div>

        <div className="exam-body">
          <div className="exam-main">
            <div className="q-card">
              <div className="q-meta">
                <span className="q-section-tag">{cur.sectionName}</span>
                <span style={{ fontSize: 13, color: '#64748b' }}>Question {current + 1} of {questions.length}</span>
                <span className="badge badge-info">{cur.q.points} pt{cur.q.points !== 1 ? 's' : ''}</span>
                {marked.has(cur.key) && <span className="badge badge-finished">Marked for review</span>}
              </div>
              <div className="q-text">{cur.q.text}</div>

              {cur.q.type === 'multiple-choice' ? (
                cur.q.options.map((opt, oi) => (
                  <label key={oi} className={`opt ${Number(val) === oi ? 'selected' : ''}`}>
                    <input type="radio" name={cur.key} checked={Number(val) === oi} onChange={() => setAnswer(cur.key, oi)} />
                    <span>{opt}</span>
                  </label>
                ))
              ) : (
                <textarea className="short-input" value={val || ''} onChange={e => setAnswer(cur.key, e.target.value)} placeholder="Type your answer..." />
              )}

              <div className="exam-nav-btns">
                <button className="ebtn ebtn-prev" disabled={current === 0 || (nav.mode === 'sequential' && !nav.allowBacktrack)} onClick={() => goto(current - 1)}>← Previous</button>
                <div style={{ display: 'flex', gap: 10 }}>
                  {nav.allowMarkForReview && <button className="ebtn ebtn-review" onClick={toggleReview}>{marked.has(cur.key) ? 'Unmark' : '⚑ Mark for Review'}</button>}
                  {current < questions.length - 1
                    ? <button className="ebtn ebtn-next" onClick={() => goto(current + 1)}>Next →</button>
                    : <button className="ebtn ebtn-submit" disabled={submitting} onClick={() => doSubmit(false)}>{submitting ? 'Submitting…' : 'Submit Exam'}</button>}
                </div>
              </div>
            </div>
          </div>

          <div className="exam-side">
            <div className="palette">
              <div className="palette-title">Questions ({answeredCount}/{questions.length} answered)</div>
              <div className="palette-grid">
                {questions.map((q, i) => {
                  let cls = 'pal-btn';
                  if (i === current) cls += ' current';
                  if (marked.has(q.key)) cls += ' review';
                  else if (isAnswered(q.key)) cls += ' answered';
                  const disabled = nav.mode === 'sequential' && !nav.allowBacktrack && i < current;
                  return <button key={q.key} className={cls} disabled={disabled} onClick={() => goto(i)}>{i + 1}</button>;
                })}
              </div>
              <div className="pal-legend">
                <span><span className="pal-dot" style={{ background: '#4f46e5' }} /> Answered</span>
                <span><span className="pal-dot" style={{ background: '#f59e0b' }} /> Marked for review</span>
                <span><span className="pal-dot" style={{ background: '#fff', border: '1px solid #e2e8f0' }} /> Not answered</span>
              </div>
            </div>
            <button className="ebtn ebtn-submit" style={{ width: '100%' }} disabled={submitting} onClick={() => doSubmit(false)}>{submitting ? 'Submitting…' : 'Submit Exam'}</button>
          </div>
        </div>
      </div>
    </>
  );
}
