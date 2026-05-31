import React, { useState } from 'react';
import { api, API_BASE_URL } from './api.js';

const loginStyles = `
  .login-page { min-height: 100vh; display: flex; }
  .login-hero {
    flex: 1; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 60%, #818cf8 100%);
    color: #fff; padding: 60px; display: flex; flex-direction: column; justify-content: center;
  }
  .login-hero-brand { font-size: 30px; font-weight: 800; display: flex; align-items: center; gap: 12px; margin-bottom: 36px; }
  .login-hero-brand .lb { width: 34px; height: 34px; background: #fff; border-radius: 9px; border-top-right-radius: 3px; border-bottom-left-radius: 3px; }
  .login-hero h1 { font-size: 40px; font-weight: 800; line-height: 1.15; letter-spacing: -1px; margin-bottom: 18px; }
  .login-hero p { font-size: 16px; opacity: 0.9; line-height: 1.6; max-width: 440px; }
  .login-feature-list { margin-top: 36px; display: flex; flex-direction: column; gap: 14px; }
  .login-feature { display: flex; align-items: center; gap: 12px; font-size: 15px; opacity: 0.95; }
  .login-feature .fcheck { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }

  .login-form-side { width: 500px; max-width: 100%; background: #fff; display: flex; align-items: center; justify-content: center; padding: 40px; overflow-y: auto; }
  .login-card { width: 100%; max-width: 400px; }

  /* Mode tabs */
  .login-mode-tabs { display: flex; gap: 0; margin-bottom: 28px; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  .login-mode-tab { flex: 1; padding: 11px; font-size: 14px; font-weight: 600; border: none; background: #f8fafc; color: #64748b; cursor: pointer; transition: all 0.15s; }
  .login-mode-tab.active { background: #4f46e5; color: #fff; }

  /* Shared fields */
  .login-field { margin-bottom: 18px; }
  .login-field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #0f172a; }
  .login-field input { width: 100%; padding: 13px 15px; border: 1px solid #e2e8f0; border-radius: 11px; font-size: 15px; background: #f8fafc; font-family: inherit; }
  .login-field input:focus { outline: none; border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
  .login-submit { width: 100%; padding: 14px; background: #4f46e5; color: #fff; border: none; border-radius: 11px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: all 0.15s; }
  .login-submit:hover:not(:disabled) { background: #4338ca; transform: translateY(-1px); }
  .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .login-error { background: #fef2f2; color: #b91c1c; padding: 12px 15px; border-radius: 10px; font-size: 14px; margin-bottom: 20px; border-left: 4px solid #ef4444; }
  .login-note { margin-top: 24px; font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.5; }

  /* Exam join flow */
  .exam-preview-card { background: #f0f4ff; border: 1.5px solid #c7d2fe; border-radius: 14px; padding: 18px; margin-bottom: 22px; }
  .exam-preview-title { font-size: 17px; font-weight: 800; color: #3730a3; margin-bottom: 6px; }
  .exam-preview-meta { display: flex; gap: 16px; font-size: 13px; color: #6366f1; margin-top: 6px; flex-wrap: wrap; }

  .student-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 22px; }
  .student-card-name { font-size: 19px; font-weight: 800; margin-bottom: 4px; }
  .student-card-row { display: flex; gap: 8px; align-items: center; font-size: 13px; color: #64748b; margin-top: 5px; }
  .student-card-row strong { color: #0f172a; }

  .step-back { background: none; border: none; font-size: 13px; color: #64748b; cursor: pointer; padding: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 4px; font-weight: 600; }
  .step-back:hover { color: #4f46e5; }

  .code-input { font-size: 22px; font-weight: 900; letter-spacing: 6px; text-transform: uppercase; text-align: center; font-family: monospace; }

  @media (max-width: 860px) { .login-hero { display: none; } .login-form-side { width: 100%; } }
`;

// ===== ADMIN / TEACHER LOGIN =====
function SignInForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await api('/api/auth/login', { method: 'POST', auth: false, body: { email, password } });
      if (data.user.role === 'student') { setError('Students must use "Join Exam" — enter your exam code.'); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="login-error">{error}</div>}
      <div className="login-field"><label>Email address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" required autoComplete="email" /></div>
      <div className="login-field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required /></div>
      <button className="login-submit" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      <div className="login-note">Admin & teacher accounts are provisioned by your administrator.<br />Contact your college admin if you can't sign in.</div>
    </form>
  );
}

// Quick frontend check: SEB injects 'SEB/' into the user agent string.
// This is for UX only — backend header validation is the real security gatekeeper.
function isSEBBrowser() {
  return /SEB\//i.test(navigator.userAgent);
}

// ===== STUDENT JOIN EXAM FLOW =====
function JoinExamFlow({ onExamStart }) {
  // step: 'code' | 'email' | 'confirm'
  const [step, setStep] = useState('code');
  const [examCode, setExamCode] = useState('');
  const [email, setEmail] = useState('');
  const [examPassword, setExamPassword] = useState('');
  const [examInfo, setExamInfo] = useState(null);   // from exam-preview
  const [joinData, setJoinData] = useState(null);   // { token, student, examId }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookupCode = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const d = await api('/api/student/exam-preview', { method: 'POST', auth: false, body: { examCode: examCode.trim().toUpperCase() } });
      setExamInfo(d.exam);
      // SEB check: if exam requires SEB and browser is not SEB, show block step
      if (d.exam.sebRequired && !isSEBBrowser()) {
        setStep('seb-blocked');
      } else {
        setStep('email');
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const lookupStudent = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const d = await api('/api/student/join', { method: 'POST', auth: false, body: { examCode: examCode.trim().toUpperCase(), email: email.trim().toLowerCase(), examPassword } });
      setJoinData(d);
      setStep('confirm');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const startExam = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/exams/${joinData.examId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${joinData.token}` },
        body: JSON.stringify({})
      });
      const session = await res.json();
      if (!res.ok) throw new Error(session.error || 'Failed to start exam');
      onExamStart({ token: joinData.token, session, student: joinData.student });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep('code'); setExamCode(''); setEmail(''); setExamPassword(''); setExamInfo(null); setJoinData(null); setError(''); };

  return (
    <div>
      {error && <div className="login-error">{error}</div>}

      {/* Step 1: Exam Code */}
      {step === 'code' && (
        <form onSubmit={lookupCode}>
          <div className="login-field">
            <label>Enter your exam code</label>
            <input className="code-input" type="text" maxLength={6} value={examCode} onChange={e => setExamCode(e.target.value.toUpperCase())} placeholder="XXXXXX" required autoFocus />
          </div>
          <button className="login-submit" type="submit" disabled={loading || examCode.length < 6}>{loading ? 'Looking up…' : 'Find Exam →'}</button>
          <div className="login-note">Enter the 6-character code your teacher shared with you.</div>
        </form>
      )}

      {/* Step 2: Email + optional exam password */}
      {step === 'email' && examInfo && (
        <form onSubmit={lookupStudent}>
          <button type="button" className="step-back" onClick={reset}>← Back</button>
          <div className="exam-preview-card">
            <div className="exam-preview-title">{examInfo.title}</div>
            {examInfo.description && <div style={{ fontSize: 13, color: '#6366f1', marginTop: 4 }}>{examInfo.description}</div>}
            <div className="exam-preview-meta">
              <span>⏱ {examInfo.duration} minutes</span>
              <span>❓ {examInfo.totalQuestions} questions</span>
              {examInfo.hasPassword && <span>🔒 Password protected</span>}
              {examInfo.sebRequired && <span style={{ background: '#4f46e5', color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>🔒 SEB Required</span>}
            </div>
          </div>
          <div className="login-field"><label>Your registered email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="yourname@college.edu" required autoFocus /></div>
          {examInfo.hasPassword && <div className="login-field"><label>Exam password</label><input type="password" value={examPassword} onChange={e => setExamPassword(e.target.value)} placeholder="Enter exam password" required /></div>}
          <button className="login-submit" type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Verify & Continue →'}</button>
        </form>
      )}

      {/* Step 3: Confirm student details + start */}
      {step === 'confirm' && joinData && (
        <div>
          <button type="button" className="step-back" onClick={() => setStep('email')}>← Back</button>
          <div className="exam-preview-card" style={{ marginBottom: 16 }}>
            <div className="exam-preview-title">{examInfo.title}</div>
            <div className="exam-preview-meta"><span>⏱ {examInfo.duration} min</span><span>❓ {examInfo.totalQuestions} Qs</span></div>
          </div>
          <div className="student-card">
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', marginBottom: 8 }}>Your Details</div>
            <div className="student-card-name">{joinData.student.name}</div>
            <div className="student-card-row"><span>📧</span><strong>{joinData.student.email}</strong></div>
            {joinData.student.studentId && <div className="student-card-row"><span>🪪</span><strong>{joinData.student.studentId}</strong></div>}
            <div className="student-card-row"><span>🏫</span><strong>{joinData.student.college}</strong></div>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>
            Once you start, the timer begins immediately. Make sure you're ready.
          </p>
          <button className="login-submit" onClick={startExam} disabled={loading}>{loading ? 'Starting…' : '🚀 Start Exam'}</button>
        </div>
      )}

      {/* SEB Blocked Screen */}
      {step === 'seb-blocked' && examInfo && (
        <div>
          <button type="button" className="step-back" onClick={reset}>← Back</button>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Safe Exam Browser Required</div>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
              <strong>{examInfo.title}</strong> must be opened using Safe Exam Browser (SEB).<br />
              SEB provides a secure lockdown environment that prevents access to other applications.
            </p>
            
            <a 
              href={`${API_BASE_URL.replace(/^http/, 'seb')}/api/exams/${examInfo.id}/seb-config?frontendUrl=${encodeURIComponent(window.location.origin)}`}
              className="login-submit" 
              style={{ display: 'block', textDecoration: 'none', background: '#4f46e5', marginBottom: 12 }}
            >
              🚀 Launch Exam in SEB
            </a>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, textAlign: 'left', marginBottom: 20, fontSize: 13, color: '#334155' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Don't have SEB installed?</div>
              Download and install Safe Exam Browser for your device first, then come back and click Launch.
              <div style={{ marginTop: 8 }}>
                <a href="https://safeexambrowser.org/download" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 600 }}>⬇ Download Safe Exam Browser</a>
              </div>
            </div>

            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: 12, fontSize: 12, color: '#92400e', marginBottom: 16 }}>
              ⚠️ SEB is available for <strong>Windows</strong>, <strong>macOS</strong>, and <strong>iPadOS</strong>. Android devices are not supported.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MAIN LOGIN SCREEN =====
export default function LoginScreen({ onLogin, onExamStart }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'join'

  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-page">
        <div className="login-hero">
          <div className="login-hero-brand"><span className="lb" />Evalix</div>
          <h1>Secure assessments,<br />without surveillance.</h1>
          <p>A multi-tenant exam platform built for colleges — powerful anti-cheat controls, question banks, and analytics. No cameras. No AI proctoring.</p>
          <div className="login-feature-list">
            <div className="login-feature"><span className="fcheck">✓</span> Section-based exams with per-question timers</div>
            <div className="login-feature"><span className="fcheck">✓</span> Configurable anti-cheat toggles per exam</div>
            <div className="login-feature"><span className="fcheck">✓</span> Question banks, pools & randomization</div>
            <div className="login-feature"><span className="fcheck">✓</span> Students join via exam code — no dashboard needed</div>
          </div>
        </div>
        <div className="login-form-side">
          <div className="login-card">
            <div className="login-mode-tabs">
              <button className={`login-mode-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => setMode('signin')}>Admin / Teacher</button>
              <button className={`login-mode-tab ${mode === 'join' ? 'active' : ''}`} onClick={() => setMode('join')}>Join Exam (Student)</button>
            </div>
            {mode === 'signin' ? <SignInForm onLogin={onLogin} /> : <JoinExamFlow onExamStart={onExamStart} />}
          </div>
        </div>
      </div>
    </>
  );
}
