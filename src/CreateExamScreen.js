import React, { useState, useEffect } from 'react';
import { api } from './api.js';
import { useToast } from './ToastContext.js';
import { Toggle, Modal, Loading } from './components.js';
import QuestionEditor from './QuestionEditor.js';

function blankExam() {
  return {
    title: '', description: '', template: 'custom', duration: 60, passingScore: 50, gracePeriod: 0,
    scheduledStart: '', scheduledEnd: '', password: '', usePassword: false,
    navigation: { mode: 'free', allowBacktrack: true, allowMarkForReview: true },
    negativeMarking: { enabled: false, value: 0.25 },
    security: { fullscreenRequired: false, tabSwitchLogging: false, maxTabSwitches: 3, autoSubmitOnTabLimit: false, copyPasteBlocked: false, rightClickBlocked: false, autoSaveInterval: 30, concurrentLoginDetection: false },
    shuffleQuestions: false, shuffleOptions: false,
    sections: [{ id: 's' + Date.now(), name: 'Section 1', description: '', timeLimit: null, shuffleQuestions: false, shuffleOptions: false, questions: [] }],
    assignedStudents: [], assignedAll: false,
    securityMode: 'standard'
  };
}

export default function CreateExamScreen({ examId, user, onBack }) {
  const { showToast } = useToast();
  const [exam, setExam] = useState(examId ? null : blankExam());
  const [templates, setTemplates] = useState({});
  const [saving, setSaving] = useState(false);
  const [editingQ, setEditingQ] = useState(null); // { sectionIdx, question }
  const [showAssign, setShowAssign] = useState(false);
  const [importFromBank, setImportFromBank] = useState(null); // { sectionIdx }
  const [importFromCSV, setImportFromCSV] = useState(null); // { sectionIdx }

  const importQuestions = (sectionIdx, newQuestions) => {
    setExam(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => {
        if (i !== sectionIdx) return s;
        const mapped = newQuestions.map(q => ({
          ...q,
          id: 'q' + Date.now() + Math.random().toString(36).slice(2, 6)
        }));
        return { ...s, questions: [...s.questions, ...mapped] };
      })
    }));
  };

  useEffect(() => {
    api('/api/exams/templates').then(d => setTemplates(d.templates)).catch(() => {});
    if (examId) {
      api(`/api/exams/${examId}`).then(d => {
        const e = d.exam;
        setExam({
          ...blankExam(), ...e,
          usePassword: e.hasPassword,
          password: '',
          scheduledStart: e.scheduledStart ? e.scheduledStart.slice(0, 16) : '',
          scheduledEnd: e.scheduledEnd ? e.scheduledEnd.slice(0, 16) : '',
          sections: e.sections?.length ? e.sections : blankExam().sections
        });
      }).catch(() => { showToast('Failed to load exam', 'error'); onBack(); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  const set = (patch) => setExam(prev => ({ ...prev, ...patch }));
  const setNav = (patch) => setExam(prev => ({ ...prev, navigation: { ...prev.navigation, ...patch } }));
  const setSec = (patch) => setExam(prev => ({ ...prev, security: { ...prev.security, ...patch } }));
  const setNeg = (patch) => setExam(prev => ({ ...prev, negativeMarking: { ...prev.negativeMarking, ...patch } }));

  const applyTemplate = (key) => {
    if (key === 'custom') return set({ template: 'custom' });
    const t = templates[key];
    if (!t) return;
    setExam(prev => ({
      ...prev,
      template: key, duration: t.duration, passingScore: t.passingScore, gracePeriod: t.gracePeriod,
      navigation: { ...t.navigation }, negativeMarking: { ...t.negativeMarking }, security: { ...t.security },
      shuffleQuestions: t.shuffleQuestions, shuffleOptions: t.shuffleOptions
    }));
    showToast(`Applied "${t.title}" template settings`, 'success');
  };

  const addSection = () => setExam(prev => ({ ...prev, sections: [...prev.sections, { id: 's' + Date.now(), name: `Section ${prev.sections.length + 1}`, description: '', timeLimit: null, shuffleQuestions: false, shuffleOptions: false, questions: [] }] }));
  const updateSection = (idx, patch) => setExam(prev => ({ ...prev, sections: prev.sections.map((s, i) => i === idx ? { ...s, ...patch } : s) }));
  const removeSection = (idx) => setExam(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== idx) }));

  const saveQuestion = (q) => {
    const { sectionIdx } = editingQ;
    setExam(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => {
        if (i !== sectionIdx) return s;
        const exists = q.id && s.questions.some(x => x.id === q.id);
        const qWithId = q.id ? q : { ...q, id: 'q' + Date.now() + Math.random().toString(36).slice(2, 6) };
        return { ...s, questions: exists ? s.questions.map(x => x.id === q.id ? q : x) : [...s.questions, qWithId] };
      })
    }));
    setEditingQ(null);
  };
  const removeQuestion = (sectionIdx, qid) => setExam(prev => ({ ...prev, sections: prev.sections.map((s, i) => i === sectionIdx ? { ...s, questions: s.questions.filter(q => q.id !== qid) } : s) }));

  const buildPayload = () => {
    const p = { ...exam };
    p.password = exam.usePassword && exam.password ? exam.password : (examId && exam.usePassword ? undefined : null);
    p.scheduledStart = exam.scheduledStart || null;
    p.scheduledEnd = exam.scheduledEnd || null;
    delete p.usePassword;
    delete p.hasPassword;
    if (p.password === undefined) delete p.password; // keep existing password unchanged
    return p;
  };

  const save = async (publish) => {
    if (!exam.title.trim()) return showToast('Exam title is required', 'error');
    setSaving(true);
    try {
      let id = examId;
      if (id) await api(`/api/exams/${id}`, { method: 'PUT', body: buildPayload() });
      else { const r = await api('/api/exams', { method: 'POST', body: buildPayload() }); id = r.examId; }

      if (publish) {
        const r = await api(`/api/exams/${id}/publish`, { method: 'POST' });
        showToast(`Published! Code: ${r.examCode}`, 'success');
      } else {
        showToast('Draft saved', 'success');
      }
      onBack();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  if (!exam) return <Loading />;
  const totalQuestions = exam.sections.reduce((n, s) => n + s.questions.length, 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
          <div className="page-title" style={{ marginTop: 12 }}>{examId ? 'Edit Exam' : 'Create Exam'}</div>
          <div className="page-subtitle">{totalQuestions} questions across {exam.sections.length} section(s)</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" disabled={saving} onClick={() => save(false)}>Save Draft</button>
          <button className="btn btn-primary" disabled={saving} onClick={() => save(true)}>Save & Publish</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Basics</div>
        <div className="form-group">
          <label className="form-label">Start from a template</label>
          <select className="form-select" value={exam.template} onChange={e => applyTemplate(e.target.value)}>
            <option value="custom">Custom (no preset)</option>
            <option value="quiz">Quiz</option>
            <option value="midterm">Mid-Term Exam</option>
            <option value="endterm">End-Term Exam</option>
            <option value="assignment">Assignment</option>
          </select>
          <div className="form-hint">Templates pre-fill timing & anti-cheat toggles — you can still change everything below.</div>
        </div>
        <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={exam.title} onChange={e => set({ title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={exam.description} onChange={e => set({ description: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Duration (minutes)</label><input className="form-input" type="number" min="1" value={exam.duration} onChange={e => set({ duration: Number(e.target.value) })} /></div>
          <div className="form-group"><label className="form-label">Passing Score (%)</label><input className="form-input" type="number" min="0" max="100" value={exam.passingScore} onChange={e => set({ passingScore: Number(e.target.value) })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Schedule Start (optional)</label><input className="form-input" type="datetime-local" value={exam.scheduledStart} onChange={e => set({ scheduledStart: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Schedule End (optional)</label><input className="form-input" type="datetime-local" value={exam.scheduledEnd} onChange={e => set({ scheduledEnd: e.target.value })} /></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Sections & Questions <button className="btn btn-secondary btn-sm" onClick={addSection}>+ Add Section</button></div>
        {exam.sections.map((sec, si) => (
          <div key={sec.id} style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <input className="form-input" style={{ fontWeight: 700, flex: 1 }} value={sec.name} onChange={e => updateSection(si, { name: e.target.value })} />
              <input className="form-input" style={{ width: 150 }} type="number" min="0" placeholder="Time limit (min)" value={sec.timeLimit ?? ''} onChange={e => updateSection(si, { timeLimit: e.target.value === '' ? null : Number(e.target.value) })} />
              {exam.sections.length > 1 && <button className="btn btn-danger btn-sm" onClick={() => removeSection(si)}>✕</button>}
            </div>
            <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
              <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={sec.shuffleQuestions} onChange={e => updateSection(si, { shuffleQuestions: e.target.checked })} /> Shuffle questions</label>
              <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={sec.shuffleOptions} onChange={e => updateSection(si, { shuffleOptions: e.target.checked })} /> Shuffle options</label>
            </div>
            {sec.questions.map((q, qi) => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 14 }}><span className="badge badge-info" style={{ marginRight: 8 }}>{q.type === 'multiple-choice' ? 'MCQ' : 'Short'}</span>{qi + 1}. {q.text || '(no text)'} <span style={{ color: '#94a3b8' }}>· {q.points}pt</span></div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingQ({ sectionIdx: si, question: q })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(si, q.id)}>✕</button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingQ({ sectionIdx: si, question: {} })}>+ Add Question</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setImportFromBank({ sectionIdx: si })}>📂 Import from Bank</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setImportFromCSV({ sectionIdx: si })}>📄 Bulk Import (CSV)</button>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">Navigation Controls</div>
        <div className="form-group">
          <label className="form-label">Navigation Mode</label>
          <select className="form-select" value={exam.navigation.mode} onChange={e => setNav({ mode: e.target.value })}>
            <option value="free">Free — jump between any question</option>
            <option value="sequential">Sequential — one question at a time</option>
          </select>
        </div>
        <Toggle label="Allow backtracking" desc="Students can return to previous questions" checked={exam.navigation.allowBacktrack} onChange={v => setNav({ allowBacktrack: v })} />
        <Toggle label="Allow 'Mark for Review'" desc="Students can flag questions to revisit" checked={exam.navigation.allowMarkForReview} onChange={v => setNav({ allowMarkForReview: v })} />
      </div>

      <div className="panel">
        <div className="panel-title">Randomization & Marking</div>
        <Toggle label="Shuffle questions (exam-wide)" desc="Randomize order across all sections" checked={exam.shuffleQuestions} onChange={v => set({ shuffleQuestions: v })} />
        <Toggle label="Shuffle options (exam-wide)" desc="Randomize MCQ option order" checked={exam.shuffleOptions} onChange={v => set({ shuffleOptions: v })} />
        <Toggle label="Negative marking" desc="Deduct points for wrong MCQ answers" checked={exam.negativeMarking.enabled} onChange={v => setNeg({ enabled: v })} />
        {exam.negativeMarking.enabled && (
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Deduction per wrong answer</label>
            <input className="form-input" style={{ maxWidth: 160 }} type="number" min="0" step="0.05" value={exam.negativeMarking.value} onChange={e => setNeg({ value: Number(e.target.value) })} />
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Anti-Cheat & Security <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>All optional — toggle per exam</span></div>
        <Toggle label="Require fullscreen" desc="Exam runs in fullscreen mode" checked={exam.security.fullscreenRequired} onChange={v => setSec({ fullscreenRequired: v })} />
        <Toggle label="Log tab switches / focus loss" desc="Record when student leaves the tab and show a warning" checked={exam.security.tabSwitchLogging} onChange={v => setSec({ tabSwitchLogging: v })} />
        <Toggle label="Block copy / paste" desc="Disable clipboard during exam" checked={exam.security.copyPasteBlocked} onChange={v => setSec({ copyPasteBlocked: v })} />
        <Toggle label="Block right-click" desc="Disable context menu" checked={exam.security.rightClickBlocked} onChange={v => setSec({ rightClickBlocked: v })} />
        <Toggle label="Concurrent login detection" desc="Flag if the same student opens the exam on another device" checked={exam.security.concurrentLoginDetection} onChange={v => setSec({ concurrentLoginDetection: v })} />
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">Autosave interval (seconds)</label>
          <input className="form-input" style={{ maxWidth: 160 }} type="number" min="5" value={exam.security.autoSaveInterval} onChange={e => setSec({ autoSaveInterval: Number(e.target.value) })} />
        </div>
        <div style={{ marginTop: 8 }}>
          <Toggle label="Grace period" desc="Extra minutes after the timer before auto-submit" checked={exam.gracePeriod > 0} onChange={v => set({ gracePeriod: v ? 5 : 0 })} />
          {exam.gracePeriod > 0 && <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Grace minutes</label><input className="form-input" style={{ maxWidth: 160 }} type="number" min="1" value={exam.gracePeriod} onChange={e => set({ gracePeriod: Number(e.target.value) })} /></div>}
        </div>
        <div style={{ marginTop: 8 }}>
          <Toggle label="Password-protect exam" desc="Students must enter a password to start" checked={exam.usePassword} onChange={v => set({ usePassword: v })} />
          {exam.usePassword && <div className="form-group" style={{ marginTop: 12 }}><label className="form-label">Exam password {examId && <span className="form-hint">(leave blank to keep existing)</span>}</label><input className="form-input" style={{ maxWidth: 260 }} value={exam.password} onChange={e => set({ password: e.target.value })} /></div>}
        </div>
      </div>

      <div>
        <div className="panel">
          <div className="panel-title">🔒 Lockdown Mode</div>
          <Toggle
            label="Require Safe Exam Browser (SEB)"
            desc="Students must use SEB to take this exam. SEB enforces full OS-level lockdown including keyboard restrictions, screen capture blocking, and forced fullscreen."
            checked={exam.securityMode === 'seb'}
            onChange={v => {
              const mode = v ? 'seb' : 'standard';
              if (v) {
                set({ securityMode: mode });
                setSec({ fullscreenRequired: true, tabSwitchLogging: true, copyPasteBlocked: true, rightClickBlocked: true, concurrentLoginDetection: true });
              } else {
                set({ securityMode: mode });
              }
            }}
          />
          {exam.securityMode === 'seb' && (
            <div style={{ marginTop: 12, background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#4f46e5', marginBottom: 10 }}>SEB Supported Platforms</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> Windows</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> macOS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> iPadOS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#ef4444', fontWeight: 700 }}>✗</span> <span style={{ color: '#64748b' }}>Android (not supported)</span></div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                When students enter the exam code, they will be prompted to <strong>Launch Exam in SEB</strong> which automatically loads the configuration.
                Students must install SEB from <a href="https://safeexambrowser.org/download" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 600 }}>safeexambrowser.org</a> before the exam.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Student Assignment</div>
        <Toggle label="Assign to all students in my college" desc="Every registered student can take this exam" checked={exam.assignedAll} onChange={v => set({ assignedAll: v })} />
        {!exam.assignedAll && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 14, marginBottom: 10 }}>{exam.assignedStudents.length} student(s) assigned</div>
            <button className="btn btn-secondary" onClick={() => setShowAssign(true)}>Select Students</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginBottom: 40 }}>
        <button className="btn btn-secondary" disabled={saving} onClick={() => save(false)}>Save Draft</button>
        <button className="btn btn-primary" disabled={saving} onClick={() => save(true)}>Save & Publish</button>
      </div>

      {editingQ && (
        <Modal title={editingQ.question.id ? 'Edit Question' : 'Add Question'} onClose={() => setEditingQ(null)} wide>
          <QuestionEditor initial={editingQ.question} onSave={saveQuestion} onCancel={() => setEditingQ(null)} />
        </Modal>
      )}
      {showAssign && (
        <AssignModal selected={exam.assignedStudents} onClose={() => setShowAssign(false)} onSave={(ids) => { set({ assignedStudents: ids }); setShowAssign(false); }} />
      )}
      {importFromBank && (
        <ImportFromBankModal
          onClose={() => setImportFromBank(null)}
          onImport={(questions) => {
            importQuestions(importFromBank.sectionIdx, questions);
            setImportFromBank(null);
            showToast(`Imported ${questions.length} question(s) from bank`, 'success');
          }}
        />
      )}
      {importFromCSV && (
        <ImportFromCSVModal
          onClose={() => setImportFromCSV(null)}
          onImport={(questions) => {
            importQuestions(importFromCSV.sectionIdx, questions);
            setImportFromCSV(null);
            showToast(`Bulk imported ${questions.length} question(s) successfully`, 'success');
          }}
        />
      )}
    </div>
  );
}

function AssignModal({ selected, onClose, onSave }) {
  const [students, setStudents] = useState(null);
  const [picked, setPicked] = useState(new Set(selected));
  useEffect(() => { api('/api/exams/meta/students').then(d => setStudents(d.students)).catch(() => setStudents([])); }, []);
  const toggle = (id) => { const n = new Set(picked); n.has(id) ? n.delete(id) : n.add(id); setPicked(n); };
  return (
    <Modal title="Assign Students" onClose={onClose}>
      {!students ? <Loading /> : students.length === 0 ? (
        <p style={{ color: '#64748b' }}>No students registered in your college yet. Ask your college admin to add students.</p>
      ) : (
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {students.map(s => (
            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
              <input type="checkbox" checked={picked.has(s.id)} onChange={() => toggle(s.id)} />
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div><div style={{ fontSize: 12, color: '#64748b' }}>{s.email}{s.studentId ? ` · ${s.studentId}` : ''}</div></div>
            </label>
          ))}
        </div>
      )}
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => onSave([...picked])}>Save ({picked.size})</button>
      </div>
    </Modal>
  );
}

function ImportFromBankModal({ onClose, onImport }) {
  const { showToast } = useToast();
  const [banks, setBanks] = useState(null);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [bankDetail, setBankDetail] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQids, setSelectedQids] = useState(new Set());
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  useEffect(() => {
    api('/api/question-banks')
      .then(d => setBanks(d.banks))
      .catch(() => setBanks([]));
  }, []);

  const selectBank = (id) => {
    setSelectedBankId(id);
    if (!id) {
      setBankDetail(null);
      return;
    }
    setLoadingQuestions(true);
    api(`/api/question-banks/${id}`)
      .then(d => {
        setBankDetail(d.bank);
        setSelectedQids(new Set());
      })
      .catch(() => showToast('Failed to load bank questions', 'error'))
      .finally(() => setLoadingQuestions(false));
  };

  const toggleSelect = (qid) => {
    setSelectedQids(prev => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  };

  const selectAll = (filteredQuestions) => {
    const allSelected = filteredQuestions.every(q => selectedQids.has(q.id));
    setSelectedQids(prev => {
      const next = new Set(prev);
      filteredQuestions.forEach(q => {
        if (allSelected) next.delete(q.id);
        else next.add(q.id);
      });
      return next;
    });
  };

  const handleImport = () => {
    if (selectedQids.size === 0) return;
    const questionsToImport = bankDetail.questions.filter(q => selectedQids.has(q.id));
    onImport(questionsToImport);
  };

  const filteredQuestions = bankDetail
    ? bankDetail.questions.filter(q => {
        const matchesText = q.text.toLowerCase().includes(search.toLowerCase());
        const matchesTag = !tagFilter || (q.tags || []).some(t => t.toLowerCase() === tagFilter.toLowerCase());
        return matchesText && matchesTag;
      })
    : [];

  const uniqueTags = bankDetail
    ? Array.from(new Set(bankDetail.questions.flatMap(q => q.tags || [])))
    : [];

  return (
    <Modal title="Import from Question Bank" onClose={onClose} wide>
      {!banks ? (
        <Loading />
      ) : banks.length === 0 ? (
        <p style={{ color: '#64748b' }}>No question banks available. Create banks in the Question Banks manager first.</p>
      ) : (
        <div>
          <div className="form-group">
            <label className="form-label">Select Question Bank</label>
            <select className="form-select" value={selectedBankId} onChange={e => selectBank(e.target.value)}>
              <option value="">-- Choose a Bank --</option>
              {banks.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.questionCount} questions)</option>
              ))}
            </select>
          </div>

          {loadingQuestions && <Loading label="Loading questions..." />}

          {bankDetail && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Search questions by text..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {uniqueTags.length > 0 && (
                  <select className="form-select" style={{ width: 180 }} value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
                    <option value="">All Tags</option>
                    {uniqueTags.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>

              {filteredQuestions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>No questions match your filter.</p>
              ) : (
                <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 10, padding: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '2px solid var(--border-color)', fontWeight: 700, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={filteredQuestions.every(q => selectedQids.has(q.id))}
                      onChange={() => selectAll(filteredQuestions)}
                    />
                    <span>Select All ({filteredQuestions.length})</span>
                  </label>
                  {filteredQuestions.map((q, qi) => (
                    <label key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        style={{ marginTop: 3 }}
                        checked={selectedQids.has(q.id)}
                        onChange={() => toggleSelect(q.id)}
                      />
                      <div style={{ fontSize: 14 }}>
                        <div style={{ fontWeight: 600 }}>{qi + 1}. {q.text}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                          <span className="badge badge-info">{q.type === 'multiple-choice' ? 'MCQ' : 'Short Answer'}</span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                          {(q.tags || []).map(t => (
                            <span key={t} className="badge badge-draft" style={{ fontSize: 10 }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={selectedQids.size === 0} onClick={handleImport}>
              Import Selected ({selectedQids.size})
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ImportFromCSVModal({ onClose, onImport }) {
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState([]); // [{ success, error, question }]
  const [preview, setPreview] = useState(false);

  const parseCSV = (text) => {
    const result = [];
    let row = [''];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i+1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push('');
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        result.push(row);
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      result.push(row);
    }
    return result;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
      processCSV(evt.target.result);
    };
    reader.readAsText(file);
  };

  const processCSV = (rawText) => {
    const rows = parseCSV(rawText.trim());
    if (rows.length < 2) {
      setParsed([{ success: false, error: 'Empty file or missing header row' }]);
      setPreview(true);
      return;
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const idxOf = (possibleNames) => headers.findIndex(h => possibleNames.includes(h));

    const typeIdx = idxOf(['type', 'qtype', 'questiontype']);
    const textIdx = idxOf(['text', 'question', 'question text', 'questiontext']);
    const pointsIdx = idxOf(['points', 'score', 'pts', 'point']);
    const timeIdx = idxOf(['time limit', 'time', 'timelimit', 'duration']);
    const correctOptionIdx = idxOf(['correct option', 'correctoption', 'correct index', 'correctindex', 'correct_option']);
    const correctAnswerIdx = idxOf(['correct answer', 'correctanswer', 'answer', 'model answer']);
    const explanationIdx = idxOf(['explanation', 'reason']);
    const tagsIdx = idxOf(['tags', 'tag']);

    const optionIndices = [];
    headers.forEach((h, i) => {
      if (h.startsWith('option')) optionIndices.push(i);
    });

    const parsedQuestions = rows.slice(1).map((row, rIdx) => {
      if (row.length === 1 && row[0] === '') return null;
      
      const getVal = (idx) => (idx !== -1 && row[idx] !== undefined) ? row[idx].trim() : '';

      const text = getVal(textIdx);
      if (!text) {
        return { success: false, error: `Row ${rIdx + 2}: Missing question text` };
      }

      let type = getVal(typeIdx).toLowerCase();
      if (type.includes('mcq') || type.includes('choice') || type.includes('multiple')) {
        type = 'multiple-choice';
      } else if (type.includes('short') || type.includes('answer') || type.includes('text')) {
        type = 'short-answer';
      } else {
        type = optionIndices.some(idx => getVal(idx)) ? 'multiple-choice' : 'short-answer';
      }

      const pointsVal = getVal(pointsIdx);
      const points = pointsVal ? Number(pointsVal) : 1;
      if (isNaN(points) || points < 0) {
        return { success: false, error: `Row ${rIdx + 2}: Invalid points value "${pointsVal}"` };
      }

      const timeVal = getVal(timeIdx);
      const timeLimit = timeVal ? Number(timeVal) : null;
      if (timeLimit !== null && (isNaN(timeLimit) || timeLimit < 0)) {
        return { success: false, error: `Row ${rIdx + 2}: Invalid time limit value "${timeVal}"` };
      }

      const tags = getVal(tagsIdx) ? getVal(tagsIdx).split(/[;,]/).map(t => t.trim()).filter(Boolean) : [];
      const explanation = getVal(explanationIdx);

      if (type === 'multiple-choice') {
        const options = optionIndices
          .map(idx => getVal(idx))
          .filter(Boolean);
        
        if (options.length < 2) {
          return { success: false, error: `Row ${rIdx + 2}: MCQ questions must have at least 2 options` };
        }

        const correctVal = getVal(correctOptionIdx);
        let correctOption = null;

        if (!correctVal) {
          return { success: false, error: `Row ${rIdx + 2}: MCQ questions require a correct option` };
        }

        const parsedInt = parseInt(correctVal);
        if (!isNaN(parsedInt)) {
          if (parsedInt >= 1 && parsedInt <= options.length) {
            correctOption = parsedInt - 1;
          } else if (parsedInt >= 0 && parsedInt < options.length) {
            correctOption = parsedInt;
          }
        }

        if (correctOption === null && correctVal.length === 1) {
          const charCode = correctVal.toUpperCase().charCodeAt(0);
          if (charCode >= 65 && charCode < 65 + options.length) {
            correctOption = charCode - 65;
          }
        }

        if (correctOption === null) {
          const matchedIdx = options.findIndex(o => o.toLowerCase() === correctVal.toLowerCase());
          if (matchedIdx !== -1) {
            correctOption = matchedIdx;
          }
        }

        if (correctOption === null) {
          return { success: false, error: `Row ${rIdx + 2}: Correct option value "${correctVal}" did not match any option (or was out of range)` };
        }

        return {
          success: true,
          question: { type, text, options, correctOption, correctAnswer: '', points, timeLimit, tags, explanation }
        };

      } else {
        const correctAnswer = getVal(correctAnswerIdx);
        return {
          success: true,
          question: { type, text, options: [], correctOption: null, correctAnswer, points, timeLimit, tags, explanation }
        };
      }
    }).filter(Boolean);

    setParsed(parsedQuestions);
    setPreview(true);
  };

  const handleImport = () => {
    const validQuestions = parsed.filter(p => p.success).map(p => p.question);
    onImport(validQuestions);
  };

  const validCount = parsed.filter(p => p.success).length;

  return (
    <Modal title="Bulk Import Questions (CSV)" onClose={onClose} wide>
      {!preview ? (
        <div>
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 18, fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>CSV Format Guide</div>
            <p style={{ color: '#64748b', marginBottom: 8 }}>
              Ensure your CSV file contains a header row. The order of columns does not matter, but column names should be matched as follows:
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 0' }}>Field</th>
                  <th style={{ padding: '6px 0' }}>CSV Column Name(s)</th>
                  <th style={{ padding: '6px 0' }}>Example / Allowed Values</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ fontWeight: 600, padding: '4px 0' }}>Type</td>
                  <td><code>Type</code>, <code>qtype</code></td>
                  <td><code>multiple-choice</code> (or MCQ) / <code>short-answer</code></td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ fontWeight: 600, padding: '4px 0' }}>Text</td>
                  <td><code>Text</code>, <code>Question Text</code></td>
                  <td>"What is the capital of France?"</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ fontWeight: 600, padding: '4px 0' }}>Options</td>
                  <td><code>Option 1</code>, <code>Option 2</code>, etc.</td>
                  <td>Include columns for your choices. Minimum 2 options for MCQ.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ fontWeight: 600, padding: '4px 0' }}>Correct Option</td>
                  <td><code>Correct Option</code></td>
                  <td>Index (<code>1</code> for Option 1), Letter (<code>A</code>), or matching text</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ fontWeight: 600, padding: '4px 0' }}>Answer</td>
                  <td><code>Correct Answer</code>, <code>Answer</code></td>
                  <td>Model text reference for Short Answer questions</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ fontWeight: 600, padding: '4px 0' }}>Points</td>
                  <td><code>Points</code>, <code>score</code></td>
                  <td>Numeric value (e.g. <code>1</code> or <code>2.5</code>)</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600, padding: '4px 0' }}>Tags</td>
                  <td><code>Tags</code></td>
                  <td>Comma-separated tags (e.g. <code>Unit 1, Easy</code>)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Choose CSV File</label>
            <input type="file" accept=".csv" onChange={handleFileUpload} />
          </div>

          <div style={{ textAlign: 'center', margin: '14px 0', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>— OR —</div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>Paste CSV Content</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 13 }}
              placeholder={`Type,Text,Option 1,Option 2,Option 3,Option 4,Correct Option,Points,Tags
MCQ,What is 2 + 2?,3,4,5,6,B,1,"Math, Easy"
Short,Define gravity,,,,,Constant force pulling objects,2,"Physics, Unit 1"`}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={!csvText.trim()} onClick={() => processCSV(csvText)}>
              Preview & Parse →
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Import Preview</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreview(false)}>← Back</button>
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            {parsed.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span className={`badge ${p.success ? 'badge-success' : 'badge-danger'}`} style={{ height: 'fit-content' }}>
                  {p.success ? 'Valid' : 'Error'}
                </span>
                <div style={{ flex: 1, fontSize: 13 }}>
                  {p.success ? (
                    <div>
                      <div style={{ fontWeight: 600 }}>{i + 1}. {p.question.text}</div>
                      <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                        {p.question.type === 'multiple-choice'
                          ? `MCQ · ${p.question.options.length} options · Correct: ${p.question.options[p.question.correctOption]} · ${p.question.points}pt`
                          : `Short Answer · Points: ${p.question.points}pt`
                        }
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--red)', fontWeight: 500 }}>{p.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={validCount === 0} onClick={handleImport}>
              Import Valid Questions ({validCount} / {parsed.length})
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
