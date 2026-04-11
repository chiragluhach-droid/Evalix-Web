import React, { useState } from "react";
import { useToast } from './ToastContext.js';
import API_BASE_URL from './apiConfig.js';

// ========== PREMIUM STYLES ==========
const createExamStyles = `
  :root {
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --primary-light: #e0e7ff;
    --success: #10b981;
    --success-light: #d1fae5;
    --bg-main: #f8fafc;
    --bg-surface: #ffffff;
    --text-dark: #0f172a;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --danger: #ef4444;
    --danger-light: #fee2e2;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
    --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes modalEnter {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .create-page {
    min-height: 100vh;
    background: var(--bg-main);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    padding-bottom: 80px;
    color: var(--text-dark);
  }

  /* Glassmorphism Top Action Bar */
  .action-bar {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    padding: 0 40px;
    height: 72px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .bar-left { display: flex; align-items: center; gap: 20px; }

  .back-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: none;
    color: var(--text-muted); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: var(--transition);
    padding: 8px 12px; border-radius: var(--radius-sm);
    margin-left: -12px;
  }

  .back-btn:hover { background: var(--bg-main); color: var(--text-dark); }

  .page-title {
    font-size: 18px; font-weight: 700; color: var(--text-dark);
    padding-left: 20px; border-left: 2px solid var(--border-color);
    letter-spacing: -0.01em;
  }

  .bar-right { display: flex; gap: 12px; align-items: center; }

  .save-status {
    font-size: 13px; font-weight: 500; color: var(--success);
    margin-right: 8px; display: flex; align-items: center; gap: 6px;
  }

  /* Button Overhauls */
  button { font-family: inherit; }
  
  .btn-secondary, .btn-primary, .modal-cancel, .btn-danger {
    padding: 10px 18px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .btn-secondary, .modal-cancel {
    background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-dark);
    box-shadow: var(--shadow-sm);
  }

  .btn-secondary:hover, .modal-cancel:hover { background: var(--bg-main); border-color: #cbd5e1; }

  .btn-primary {
    background: var(--primary); border: 1px solid var(--primary); color: white;
    box-shadow: 0 2px 10px rgba(79, 70, 229, 0.2);
  }

  .btn-primary:hover { background: var(--primary-hover); box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3); transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-danger { background: white; border: 1px solid var(--danger-light); color: var(--danger); }
  .btn-danger:hover { background: var(--danger-light); }

  /* Main Form Area */
  .form-container {
    max-width: 840px; margin: 40px auto; padding: 0 20px;
    display: flex; flex-direction: column; gap: 32px;
    animation: fadeIn 0.5s ease-out forwards;
  }

  .config-card {
    background: var(--bg-surface); border: 1px solid var(--border-color);
    border-radius: var(--radius-lg); padding: 40px; box-shadow: var(--shadow-md);
  }

  .card-header { margin-bottom: 32px; }
  .card-header h2 { font-size: 20px; color: var(--text-dark); font-weight: 700; margin-bottom: 6px; letter-spacing: -0.01em; }
  .card-header p { font-size: 15px; color: var(--text-muted); line-height: 1.5; }

  /* Premium Form Inputs */
  .form-group { margin-bottom: 24px; }
  .form-row { display: flex; gap: 24px; }
  .form-row .form-group { flex: 1; }

  label { display: block; font-size: 14px; font-weight: 600; color: var(--text-dark); margin-bottom: 8px; }

  input[type="text"], input[type="number"], textarea, select {
    width: 100%; padding: 12px 16px; border: 1px solid var(--border-color);
    border-radius: var(--radius-sm); font-size: 15px; font-family: inherit;
    transition: var(--transition); background: var(--bg-main); color: var(--text-dark);
  }

  textarea { resize: vertical; min-height: 120px; line-height: 1.5; }

  input:hover, textarea:hover, select:hover { border-color: #cbd5e1; }
  input:focus, textarea:focus, select:focus {
    outline: none; border-color: var(--primary); background: var(--bg-surface);
    box-shadow: 0 0 0 4px var(--primary-light);
  }

  /* Refined iOS Style Toggle Switches */
  .setting-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 20px 0; border-bottom: 1px solid var(--border-color);
  }
  .setting-row:first-of-type { border-top: 1px solid var(--border-color); padding-top: 24px; }
  .setting-row:last-child { border-bottom: none; padding-bottom: 0; }

  .setting-info { display: flex; align-items: flex-start; gap: 16px; max-width: 80%; }
  .setting-icon { 
    margin-top: 2px; color: var(--primary); background: var(--primary-light); 
    padding: 8px; border-radius: 8px; display: flex; 
  }
  .setting-text h4 { font-size: 15px; font-weight: 600; color: var(--text-dark); margin-bottom: 4px; }
  .setting-text p { font-size: 14px; color: var(--text-muted); line-height: 1.5; }

  .switch { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background-color: #cbd5e1; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 26px;
  }
  .slider:before {
    position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px;
    background-color: white; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  input:checked + .slider { background-color: var(--success); }
  input:checked + .slider:before { transform: translateX(22px); }

  /* Enhanced Questions List */
  .questions-list { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }

  .question-item {
    background: var(--bg-surface); border: 1px solid var(--border-color);
    padding: 24px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);
    position: relative; overflow: hidden; transition: var(--transition);
  }
  .question-item:hover { border-color: #cbd5e1; box-shadow: var(--shadow-md); }
  .question-item::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--primary);
  }

  .question-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 16px; }
  .question-item h4 { color: var(--text-dark); font-size: 16px; line-height: 1.4; font-weight: 600; }
  
  .badges { display: flex; gap: 8px; margin-bottom: 16px; }
  .badge {
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;
  }
  .badge.type { background: var(--bg-main); color: var(--text-muted); border: 1px solid var(--border-color); }
  .badge.points { background: var(--primary-light); color: var(--primary); }

  .question-actions { display: flex; gap: 8px; }
  .btn-icon {
    padding: 8px; border-radius: var(--radius-sm); border: none; cursor: pointer;
    transition: var(--transition); display: flex; align-items: center; justify-content: center;
  }
  .btn-icon.edit { background: var(--bg-main); color: var(--text-dark); border: 1px solid var(--border-color); }
  .btn-icon.edit:hover { background: var(--border-color); }
  .btn-icon.delete { background: white; color: var(--danger); border: 1px solid var(--danger-light); }
  .btn-icon.delete:hover { background: var(--danger-light); }

  .questions-empty {
    text-align: center; padding: 60px 20px; background: var(--bg-main);
    border: 2px dashed #cbd5e1; border-radius: var(--radius-md);
  }
  .empty-icon { color: #94a3b8; margin-bottom: 16px; }
  .questions-empty h3 { font-size: 18px; color: var(--text-dark); margin-bottom: 8px; }
  .questions-empty p { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }

  /* Smooth Modal */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 50;
    padding: 20px;
  }

  .modal-content {
    background: var(--bg-surface); border-radius: var(--radius-lg); padding: 40px;
    width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-lg); animation: modalEnter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  .modal-header { margin-bottom: 32px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; }
  .modal-header h3 { font-size: 20px; color: var(--text-dark); font-weight: 700; }

  .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border-color); }

  .option-input { display: flex; gap: 12px; margin-bottom: 12px; align-items: center; }
  .option-input input[type="text"] { flex: 1; }
  .radio-wrap {
    display: flex; align-items: center; gap: 8px; background: var(--bg-main); 
    padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;
  }
  .radio-wrap:hover { background: var(--primary-light); border-color: var(--primary); }
  .radio-wrap input[type="radio"] { cursor: pointer; width: 16px; height: 16px; accent-color: var(--primary); }
  .radio-wrap span { font-size: 13px; font-weight: 500; color: var(--text-dark); }

  @media (max-width: 768px) {
    .form-row { flex-direction: column; gap: 0; }
    .action-bar { padding: 0 20px; }
    .page-title { display: none; }
    .config-card { padding: 24px; }
    .setting-info { max-width: 70%; }
  }
`;

export const parseBulkQuestions = (rawText) => {
  const blocks = rawText.split(/\n\s*\n/).filter(b => b.trim());
  const parsed = [];
  let skippedCount = 0;

  const normalizeAnswer = (ans) => {
    const clean = ans.toLowerCase().trim().replace(/[.)]/g, "");
    if (clean === 'a' || clean === '1') return 0;
    if (clean === 'b' || clean === '2') return 1;
    if (clean === 'c' || clean === '3') return 2;
    if (clean === 'd' || clean === '4') return 3;
    return -1;
  };

  blocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 3) {
      skippedCount++;
      return;
    }

    const answerRegex = /^(?:answer|ans|correct answer)\s*:\s*([A-D1-4])/i;
    let answerLineIdx = -1;
    let correctIndex = -1;

    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(answerRegex);
      if (match) {
        answerLineIdx = i;
        correctIndex = normalizeAnswer(match[1]);
        break;
      }
    }

    if (answerLineIdx === -1 || correctIndex === -1) {
      skippedCount++;
      return;
    }

    const questionText = lines[0].replace(/^\d+[\.\)]\s*/, '').trim();
    const options = [];

    for (let i = 1; i < answerLineIdx; i++) {
       const optText = lines[i].replace(/^[A-Da-d1-4][.)]\s*/, '').trim();
       if (optText) options.push(optText);
    }

    if (options.length >= 2 && correctIndex >= 0 && correctIndex < options.length) {
      parsed.push({
        type: "multiple-choice",
        text: questionText,
        options: options,
        correctOption: correctIndex,
        points: 1
      });
    } else {
      skippedCount++;
    }
  });

  return { parsed, skippedCount };
};

function CreateExamScreen({ examId, initialExam, onBack }) {
  const { showToast } = useToast();
  const [examData, setExamData] = useState({
    title: initialExam?.title || '',
    description: initialExam?.description || '',
    duration: initialExam?.duration || 60,
    passingScore: initialExam?.passingScore || 50,
  });

  const [questions, setQuestions] = useState(initialExam?.questions || []);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parsedPreview, setParsedPreview] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);

  const [questionForm, setQuestionForm] = useState({
    type: 'multiple-choice',
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    points: 1
  });

  const [security, setSecurity] = useState(initialExam?.security || {
    fullscreen: true,
    tabTracking: true,
    copyPaste: true,
    webcam: false,
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSecurity = (key) => setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm(prev => ({ ...prev, options: newOptions }));
  };

  const addOptionField = () => setQuestionForm(prev => ({ ...prev, options: [...prev.options, ''] }));
  const removeOptionField = (index) => setQuestionForm(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));

  const openAddQuestion = () => {
    setQuestionForm({ type: 'multiple-choice', text: '', options: ['', '', '', ''], correctOption: 0, points: 1 });
    setEditingQuestion(null);
    setShowQuestionModal(true);
  };

  const openEditQuestion = (index) => {
    setQuestionForm(questions[index]);
    setEditingQuestion(index);
    setShowQuestionModal(true);
  };

  const saveQuestion = () => {
    if (!questionForm.text) return showToast('Question text is required', 'error');
    if (questionForm.type === 'multiple-choice') {
      const filledOptions = questionForm.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) return showToast('At least 2 options are required', 'error');
    }
    if (editingQuestion !== null) {
      const newQuestions = [...questions];
      newQuestions[editingQuestion] = questionForm;
      setQuestions(newQuestions);
    } else {
      setQuestions(prev => [...prev, questionForm]);
    }
    setShowQuestionModal(false);
  };

  const deleteQuestion = (index) => setQuestions(prev => prev.filter((_, i) => i !== index));

  const handleOpenPasteModal = () => {
    setPasteText(""); setParsedPreview([]); setSkippedCount(0); setShowPasteModal(true);
  };

  const executeParse = () => {
    const { parsed, skippedCount: skipped } = parseBulkQuestions(pasteText);
    if (parsed.length === 0) return showToast("Could not parse valid questions. Check formatting.", "error");
    setParsedPreview(parsed); setSkippedCount(skipped);
  };

  const handleConfirmPaste = () => {
    setQuestions(prev => [...prev, ...parsedPreview]);
    setShowPasteModal(false);
    showToast(`${parsedPreview.length} questions added!`, "success");
  };

  const handleSaveDraft = async () => {
    if (!examData.title) return showToast("Exam title is required", 'error');
    setIsSaving(true); setSaveStatus('');
    try {
      const token = localStorage.getItem('token');
      if (!token) { showToast('Session expired. Please log in.', 'error'); onBack(); return; }

      const payload = { ...examData, duration: parseInt(examData.duration), passingScore: parseInt(examData.passingScore), questions, security };
      const url = examId ? `${API_BASE_URL}/api/exams/${examId}` : `${API_BASE_URL}/api/exams`;
      const method = examId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token'); localStorage.removeItem('user');
        showToast('Session expired. Please log in.', 'error'); onBack(); return;
      }

      if (response.ok) {
        setSaveStatus('✓ Saved'); showToast('Draft saved', 'success');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        const errorData = await response.json();
        showToast('Failed to save draft: ' + (errorData.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showToast('Error saving draft: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishExam = async () => {
    if (!examId) return showToast("Please save draft first", 'error');
    if (questions.length === 0) return showToast("Add questions before publishing", 'error');
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        showToast(`Exam published! Code: ${data.examCode}`, 'success'); onBack();
      } else {
        const errorData = await response.json();
        showToast('Failed to publish: ' + (errorData.error || 'Unknown'), 'error');
      }
    } catch (error) { showToast('Error publishing: ' + error.message, 'error'); } 
    finally { setIsSaving(false); }
  };

  return (
    <>
      <style>{createExamStyles}</style>

      <div className="create-page">
        {/* Action Bar */}
        <div className="action-bar">
          <div className="bar-left">
            <button className="back-btn" onClick={onBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Dashboard
            </button>
            <div className="page-title">{examData.title || "Untitled Assessment"}</div>
          </div>
          <div className="bar-right">
            {saveStatus && <div className="save-status">{saveStatus}</div>}
            <button className="btn-secondary" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button className="btn-primary" onClick={handlePublishExam} disabled={isSaving || !examId} title={!examId ? "Save as draft first" : ""}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              Publish
            </button>
          </div>
        </div>

        <div className="form-container">
          {/* General Information */}
          <div className="config-card">
            <div className="card-header">
              <h2>General Setup</h2>
              <p>Configure the primary details and instructions for the assessment.</p>
            </div>
            <div className="form-group">
              <label>Assessment Title</label>
              <input type="text" name="title" placeholder="e.g., Midterm Computer Science 101" value={examData.title} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Instructions for Candidates</label>
              <textarea name="description" placeholder="Explain the rules, formatting, and expectations..." value={examData.description} onChange={handleInputChange}></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Duration (Minutes)</label>
                <input type="number" name="duration" min="1" value={examData.duration} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Passing Threshold (%)</label>
                <input type="number" name="passingScore" min="1" max="100" value={examData.passingScore} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* Proctoring Settings */}
          <div className="config-card">
            <div className="card-header">
              <h2>Evalix Proctoring</h2>
              <p>Enable automated security measures to maintain assessment integrity.</p>
            </div>
            {[
              { id: 'fullscreen', title: 'Enforce Fullscreen', desc: 'Candidates must remain in full-screen mode. Exits are flagged.', icon: <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/> },
              { id: 'tabTracking', title: 'Tab Switch Tracking', desc: 'Monitor and flag if a candidate navigates away to another browser tab.', icon: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></> },
              { id: 'copyPaste', title: 'Disable Copy/Paste', desc: 'Prevent copying questions or pasting pre-written answers into inputs.', icon: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></> },
              { id: 'webcam', title: 'Webcam Monitoring', desc: 'Periodically capture candidate imagery to verify identity and presence.', icon: <><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></> }
            ].map(setting => (
              <div className="setting-row" key={setting.id}>
                <div className="setting-info">
                  <div className="setting-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{setting.icon}</svg></div>
                  <div className="setting-text">
                    <h4>{setting.title}</h4>
                    <p>{setting.desc}</p>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={security[setting.id]} onChange={() => toggleSecurity(setting.id)} />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>

          {/* Question Builder */}
          <div className="config-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>Question Bank <span style={{color: 'var(--text-muted)', fontWeight: 500, fontSize: '16px'}}>({questions.length})</span></h2>
                <p>Construct or paste the questions for this exam.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-secondary" onClick={handleOpenPasteModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  Bulk Import
                </button>
                <button className="btn-primary" onClick={openAddQuestion}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="questions-empty">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h3>Your exam is empty</h3>
                <p>Start building your assessment by adding questions manually or pasting them in bulk.</p>
                <button className="btn-primary" onClick={openAddQuestion} style={{ margin: '0 auto' }}>Create First Question</button>
              </div>
            ) : (
              <div className="questions-list">
                {questions.map((q, index) => (
                  <div key={index} className="question-item">
                    <div className="question-header">
                      <h4>{index + 1}. {q.text}</h4>
                      <div className="question-actions">
                        <button className="btn-icon edit" onClick={() => openEditQuestion(index)} title="Edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                        <button className="btn-icon delete" onClick={() => deleteQuestion(index)} title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                      </div>
                    </div>
                    <div className="badges">
                      <span className="badge type">{q.type === 'multiple-choice' ? 'Multiple Choice' : 'Short Answer'}</span>
                      <span className="badge points">{q.points} {q.points === 1 ? 'Point' : 'Points'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Single Question Editor Modal */}
      {showQuestionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingQuestion !== null ? 'Edit Question' : 'Add New Question'}</h3>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Question Format</label>
                <select name="type" value={questionForm.type} onChange={handleQuestionFormChange}>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>
              <div className="form-group" style={{maxWidth: '120px'}}>
                <label>Points</label>
                <input type="number" name="points" min="1" value={questionForm.points} onChange={handleQuestionFormChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Question Prompt</label>
              <textarea name="text" placeholder="What is the capital of..." value={questionForm.text} onChange={handleQuestionFormChange}></textarea>
            </div>

            {questionForm.type === 'multiple-choice' && (
              <div className="form-group">
                <label>Answer Choices (Select Correct)</label>
                {questionForm.options.map((option, idx) => (
                  <div key={idx} className="option-input">
                    <label className="radio-wrap">
                      <input type="radio" name="correctOption" checked={questionForm.correctOption === idx} onChange={() => setQuestionForm(prev => ({ ...prev, correctOption: idx }))} />
                      <span>{String.fromCharCode(65 + idx)}</span>
                    </label>
                    <input type="text" placeholder={`Option ${idx + 1}`} value={option} onChange={(e) => handleOptionChange(idx, e.target.value)} />
                    {questionForm.options.length > 2 && (
                      <button className="btn-icon delete" onClick={() => removeOptionField(idx)} title="Remove option">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button className="btn-secondary" onClick={addOptionField} style={{ width: '100%', marginTop: '12px', borderStyle: 'dashed' }}>+ Add Option</button>
              </div>
            )}
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowQuestionModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveQuestion}>Save Question</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Paste Modal */}
      {showPasteModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3>Bulk Import Questions</h3>
            </div>
            {parsedPreview.length === 0 ? (
              <>
                <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '13px', color: '#3730a3' }}>
                  <p style={{ fontWeight: 600, marginBottom: '8px' }}>Format Requirement:</p>
                  <p>Separate questions by an empty line. List options below the question, ending with the answer.</p>
                  <pre style={{ marginTop: '12px', background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #c7d2fe', overflow: 'auto', color: 'var(--text-dark)' }}>
                    What is the speed of light?{'\n'}A) 300,000 km/s{'\n'}B) 150,000 km/s{'\n'}C) 500,000 km/s{'\n'}D) 1,000,000 km/s{'\n'}Answer: A
                  </pre>
                </div>
                <div className="form-group">
                  <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Paste your formatted text here..." style={{ minHeight: '280px', fontFamily: 'monospace', fontSize: '14px' }}></textarea>
                </div>
                <div className="modal-actions">
                  <button className="modal-cancel" onClick={() => setShowPasteModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={executeParse}>Parse & Preview</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '20px', background: 'var(--success-light)', border: '1px solid var(--success)', padding: '16px', borderRadius: 'var(--radius-sm)', color: '#047857', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {parsedPreview.length} questions parsed successfully
                </div>
                {skippedCount > 0 && (
                  <div style={{ marginBottom: '20px', background: 'var(--danger-light)', padding: '12px', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '14px' }}>
                    ⚠️ {skippedCount} blocks were skipped due to invalid formatting.
                  </div>
                )}
                <div style={{ maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingRight: '8px' }}>
                  {parsedPreview.map((q, i) => (
                    <div key={i} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                      <h4 style={{ fontSize: '15px', color: 'var(--text-dark)', marginBottom: '16px', lineHeight: '1.4' }}>{i + 1}. {q.text}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} style={{ 
                            padding: '10px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)', border: '1px solid', 
                            borderColor: optIdx === q.correctOption ? 'var(--success)' : 'var(--border-color)', 
                            background: optIdx === q.correctOption ? 'var(--success-light)' : 'var(--bg-main)', 
                            color: optIdx === q.correctOption ? '#047857' : 'inherit',
                            display: 'flex', justifyContent: 'space-between'
                          }}>
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {optIdx === q.correctOption && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="modal-cancel" onClick={() => setParsedPreview([])}>Back to Edit</button>
                  <button className="btn-primary" style={{ background: 'var(--success)', borderColor: 'var(--success)' }} onClick={handleConfirmPaste}>Import {parsedPreview.length} Questions</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default CreateExamScreen;