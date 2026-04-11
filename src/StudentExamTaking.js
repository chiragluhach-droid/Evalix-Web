import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from './ToastContext.js';
import API_BASE_URL from './apiConfig.js';

const examStyles = `
 :root {
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --success: #10b981;
    --bg-main: #f8fafc;
    --bg-surface: #ffffff;
    --text-dark: #0f172a;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --danger: #ef4444;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .exam-container {
    min-height: 100vh;
    background-color: var(--bg-main);
    /* DUAL LAYER CRISS-CROSS WATERMARK TO DESTROY OCR */
    background-image: 
      url("data:image/svg+xml,%3Csvg width='280' height='140' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='rgba(15,23,42,0.12)' font-family='sans-serif' font-weight='800' letter-spacing='1' text-anchor='middle' alignment-baseline='middle' transform='rotate(-35 140 70)'%3EEvalix - Anti Cheating%3C/text%3E%3C/svg%3E"),
      url("data:image/svg+xml,%3Csvg width='280' height='140' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='rgba(15,23,42,0.09)' font-family='sans-serif' font-weight='800' letter-spacing='1' text-anchor='middle' alignment-baseline='middle' transform='rotate(35 140 70)'%3EEvalix - Anti Cheating%3C/text%3E%3C/svg%3E"),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
    background-repeat: repeat, repeat, repeat;
    background-position: 0 0, 140px 70px, 0 0;
    background-size: 280px 140px, 280px 140px, 150px 150px;
    background-attachment: fixed;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .exam-header {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.05);
    padding: 20px 32px; 
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .exam-title {
    font-size: 24px; 
    font-weight: 700;
    color: var(--text-dark);
  }

  .exam-timer {
    font-size: 20px; 
    font-weight: 600;
    color: var(--danger);
  }

  .exam-timer.warning {
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    50.1%, 100% { opacity: 0.5; }
  }

  @keyframes authFadeInRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  /* === NEW LAYOUT WRAPPER === */
  .exam-wrapper {
    display: flex;
    max-width: 1200px; /* Middle ground width */
    margin: 40px auto; 
    padding: 0 32px;
    gap: 40px; 
    align-items: flex-start;
  }

  .exam-content {
    flex: 1;
    min-width: 0;
  }

  /* === SIDEBAR NAVIGATOR === */
  .exam-sidebar {
    width: 340px; /* Middle ground sidebar */
    position: sticky;
    top: 140px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 12px; 
    padding: 24px; 
    flex-shrink: 0;
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px; 
    margin-top: 18px;
  }

  .nav-btn {
    aspect-ratio: 1;
    border-radius: 6px;
    border: 1px solid var(--border-color); 
    background: rgba(255, 255, 255, 0.5);
    color: var(--text-dark);
    font-weight: 600;
    font-size: 15px; 
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-btn:hover {
    border-color: var(--primary);
    background: white;
  }

  .nav-btn.answered {
    background: var(--success);
    color: white;
    border-color: var(--success);
  }

  .nav-btn.visited-unanswered {
    background: var(--danger);
    color: white;
    border-color: var(--danger);
  }

  .nav-btn.current {
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
    border-color: var(--primary);
    transform: scale(1.06); 
    z-index: 2;
  }

  .exam-instructions {
    background: transparent;
    border: none;
    border-radius: 12px;
    padding: 28px 0;
    margin-bottom: 28px;
    box-shadow: none;
  }

  .instructions-header {
    font-size: 20px; 
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 16px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
  }

  .instructions-text {
    font-size: 16px; 
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 16px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
  }

  .exam-rules {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
    gap: 16px;
    margin-top: 20px;
  }

  .rule-item {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(2px);
    padding: 14px; 
    border-radius: 8px;
    font-size: 14px; 
    border-left: 4px solid var(--primary); 
  }

  .questions-container {
    display: flex;
    flex-direction: column;
    gap: 36px; 
  }

  .question-block {
    background: transparent;
    border: none;
    border-radius: 12px;
    padding: 20px 0;
    box-shadow: none;
  }

  .question-header {
    margin-bottom: 24px;
  }

  .question-number {
    font-size: 14px; 
    color: var(--text-muted);
    font-weight: 600;
    margin-bottom: 8px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
  }

  .question-text {
    font-size: 19px; 
    line-height: 1.5;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 12px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
  }

  .question-meta {
    font-size: 14px; 
    color: var(--text-muted);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 12px; 
  }

  .option-item {
    display: flex;
    align-items: center;
    padding: 14px 20px; 
    border: 1px solid var(--border-color); 
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(2px);
  }

  .option-item:hover {
    border-color: var(--primary);
    background: rgba(248, 250, 252, 0.65);
  }

  .option-item.selected {
    border-color: var(--primary);
    background: rgba(224, 231, 255, 0.65);
  }

  .option-item input[type="radio"],
  .option-item input[type="checkbox"] {
    margin-right: 14px;
    cursor: pointer;
    transform: scale(1.2); 
  }

  .option-label {
    flex: 1;
    cursor: pointer;
    color: var(--text-dark);
    font-size: 16px; 
    line-height: 1.4;
    text-shadow: 0 1px 1px rgba(255,255,255,0.8);
  }

  .short-answer-input {
    width: 100%;
    padding: 14px 18px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 16px; 
    line-height: 1.5;
    font-family: inherit;
    transition: all 0.2s;
    resize: vertical;
    min-height: 140px; 
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(2px);
  }

  .short-answer-input:focus {
    outline: none;
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .exam-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 40px;
    margin-bottom: 40px;
  }

  .btn-submit {
    background: var(--success);
    color: white;
    padding: 14px 36px; 
    border: none;
    border-radius: 8px;
    font-size: 16px; 
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
  }

  .btn-submit:hover {
    background: #059669;
    transform: translateY(-1px);
  }

  .btn-cancel {
    background: white;
    color: var(--text-dark);
    padding: 14px 36px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel:hover {
    background: #f8fafc;
  }

  /* Anti-cheat Overlays */
  .fullscreen-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.95);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    padding: 24px;
  }

  .fullscreen-overlay h2 {
    font-size: 28px; 
    margin-bottom: 16px;
    color: #f87171;
  }

  .fullscreen-overlay p {
    font-size: 18px;
    margin-bottom: 36px;
    color: #cbd5e1;
    max-width: 550px;
    line-height: 1.6;
  }

  .fullscreen-actions {
    display: flex;
    gap: 16px;
  }

  .start-screen {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: var(--bg-main);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
  }

  .start-screen h1 {
    font-size: 32px; 
    color: var(--text-dark);
    margin-bottom: 16px;
  }

  .start-screen p {
    font-size: 18px; 
    color: var(--text-muted);
    max-width: 650px;
    line-height: 1.6;
    margin-bottom: 40px;
  }

  @media (max-width: 960px) {
    .exam-wrapper { flex-direction: column-reverse; }
    .exam-sidebar { width: 100%; position: static; }
  }

  @media (max-width: 768px) {
    .exam-header { padding: 16px 24px; }
    .question-block { padding: 24px 0; }
  }
`;

function StudentExamTaking({ exam, studentName, studentEmail, examCode, onExit, isResuming, existingAttempt }) {
  const { showToast, showConfirm } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0])); // NEW: Track visited questions
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60); // in seconds
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraReadyRef = useRef(false);

  // NEW: Update visited questions when currentQuestion changes
  useEffect(() => {
    setVisitedQuestions(prev => {
      if (prev.has(currentQuestion)) return prev;
      const newSet = new Set(prev);
      newSet.add(currentQuestion);
      return newSet;
    });
  }, [currentQuestion]);

  // NEW: Helper function to determine the color status of navigation buttons
  const getQuestionStatus = (index) => {
    const hasAnswer = answers[index] !== undefined && answers[index] !== '';
    if (hasAnswer) return 'answered';
    if (visitedQuestions.has(index)) return 'visited-unanswered';
    return ''; // simple state
  };

  // Initialize webcam
  useEffect(() => {
    if (!exam?.security?.webcam) return;

    let stream = null;

    const initCamera = async () => {
      console.log("[WEBCAM] Requesting stream...");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        console.log("[WEBCAM] Stream received");

        // WAIT for next render cycle
        setTimeout(() => {
          const video = videoRef.current;
          if (!video) {
            console.log("[WEBCAM] Video ref not ready");
            return;
          }

          video.srcObject = stream;

          video.onloadedmetadata = () => {
            console.log("[WEBCAM] Metadata loaded");

            video.play()
              .then(() => {
                console.log("[WEBCAM] Video is now playing");
                cameraReadyRef.current = true;
              })
              .catch(err => console.error("Play error:", err));
          };
        }, 300); // important delay
        
        // Add fallback: force play even if metadata fails
        setTimeout(() => {
          const video = videoRef.current;
          if (video && video.readyState === 0) {
            console.log("[WEBCAM] Forcing play fallback");
            video.play().catch(() => {});
            cameraReadyRef.current = true;
          }
        }, 1500);
      } catch (err) {
        console.error("Webcam init error:", err);
      }
    };

    initCamera();

    return () => {
      cameraReadyRef.current = false;
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureSnapshot = useCallback(async (reason, retries = 0) => {
    if (!exam?.security?.webcam) return;
    
    console.log(`[SNAPSHOT] Triggered for reason: ${reason} (Attempt: ${retries})`);
    if (!videoRef.current || !canvasRef.current) {
      console.log(`[SNAPSHOT] Aborted: Missing video or canvas refs`);
      return;
    }
    
    if (!cameraReadyRef.current) {
      if (retries > 6) {
        console.log(`[SNAPSHOT] Aborted: Camera failed to reach ready state after 6 retries.`);
        return;
      }
      console.log(`[SNAPSHOT] Camera not ready yet (cameraReady=false). Retrying in 500ms...`);
      setTimeout(() => captureSnapshot(reason, retries + 1), 500);
      return;
    }

    const video = videoRef.current;
    
    console.log(`[SNAPSHOT] Video state - ReadyState: ${video.readyState}, Width: ${video.videoWidth}, Height: ${video.videoHeight}`);

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      if (retries > 6) {
        console.log(`[SNAPSHOT] Aborted: Video failed to initialize frames after 6 retries.`);
        return;
      }
      console.log(`[SNAPSHOT] Video stream not fully rendering. Retrying in 500ms...`);
      setTimeout(() => captureSnapshot(reason, retries + 1), 500);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;
    ctx.drawImage(video, 0, 0, 640, 480);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.6);

    console.log(`[SNAPSHOT] Image generated successfully. Firing API request...`);

    try {
      // Fire-and-forget strictly out of band!
      fetch(`${API_BASE_URL}/api/exams/code/${examCode}/snapshot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail, imageBase64, reason })
      })
      .then(res => console.log(`[SNAPSHOT] API Response Status: ${res.status}`))
      .catch(err => console.error(`[SNAPSHOT] Fetch Error:`, err));
    } catch (err) {
      console.error(err);
    }
  }, [exam?.security?.webcam, examCode, studentEmail]);

  // === Anti-Cheat State ===
  const isFullscreenRequired = exam?.security?.fullscreen;
  const [isStarted, setIsStarted] = useState(!isFullscreenRequired);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Interval-based snapshots
  useEffect(() => {
    if (!isStarted || submitted) return;
    
    console.log("[SNAPSHOT] ⏱️ Snapshot interval STARTED. (Interval: 5000ms)");
    
    const intervalMs = 5000;
    const interval = setInterval(() => {
      console.log("[SNAPSHOT] ⚡ Interval firing...");
      captureSnapshot('random_interval');
    }, intervalMs);

    return () => {
      console.log("[SNAPSHOT] 🛑 Snapshot interval CLEARED (cleanup).");
      clearInterval(interval);
    };
  }, [isStarted, submitted, captureSnapshot]);

  // Load resumed attempt data if resuming
  useEffect(() => {
    if (isResuming && existingAttempt) {
      const startIdx = existingAttempt.currentQuestionIndex || 0;
      setCurrentQuestion(startIdx);
      setAnswers(existingAttempt.answers || {});
      setTimeRemaining(existingAttempt.remainingTime || (exam.duration * 60));
      
      // Mark loaded answers as visited
      if (existingAttempt.answers) {
        setVisitedQuestions(prev => {
          const newSet = new Set(prev);
          newSet.add(startIdx);
          Object.keys(existingAttempt.answers).forEach(k => newSet.add(Number(k)));
          return newSet;
        });
      }
    }
  }, [isResuming, existingAttempt, exam.duration]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-save exam progress every 10 seconds
  useEffect(() => {
    if (submitted) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        await fetch(`${API_BASE_URL}/api/exams/code/${examCode}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: studentEmail,
            answers: answers,
            currentQuestionIndex: currentQuestion,
            remainingTime: timeRemaining
          })
        });

        setShowSaveIndicator(true);
        setLastSaveTime(Date.now());
        setTimeout(() => setShowSaveIndicator(false), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [examCode, studentEmail, answers, currentQuestion, timeRemaining, submitted]);

  // Debounced auto-save on answer change
  useEffect(() => {
    if (submitted) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await fetch(`${API_BASE_URL}/api/exams/code/${examCode}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: studentEmail,
            answers: answers,
            currentQuestionIndex: currentQuestion,
            remainingTime: timeRemaining
          })
        });

        setShowSaveIndicator(true);
        setLastSaveTime(Date.now());
        setTimeout(() => setShowSaveIndicator(false), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000); // Save 1 second after answer change

    return () => clearTimeout(saveTimeout);
  }, [answers]);

  // === Anti-Cheat Effects ===
  useEffect(() => {
    if (submitted) return;

    // Helper to log flags to backend immediately
    const logFlag = async (reason) => {
      try {
        await fetch(`${API_BASE_URL}/api/exams/code/${examCode}/log-exit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentEmail, reason })
        });
      } catch (err) {
        console.error('Failed to log flag:', err);
      }
    };

    // 1. Copy/Paste Prevention
    const handleCopyPaste = (e) => {
      e.preventDefault();
      showToast("Copy/Paste is disabled during this exam.", 'error');
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    if (exam?.security?.copyPaste) {
      document.addEventListener('copy', handleCopyPaste);
      document.addEventListener('cut', handleCopyPaste);
      document.addEventListener('paste', handleCopyPaste);
      document.addEventListener('contextmenu', handleContextMenu);
    }

    // 2. Tab Tracking
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted) {
        setShowTabWarning(true);
        captureSnapshot('tab_switched');
        logFlag('Tab Switched');
      }
    };

    if (exam?.security?.tabTracking) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // 3. Fullscreen Tracking
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreenRequired && isStarted) {
        setShowFullscreenWarning(true);
        captureSnapshot('fullscreen_exit');
        logFlag('Fullscreen Exit');
      } else {
        setShowFullscreenWarning(false);
      }
    };

    if (isFullscreenRequired) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [exam, submitted, isStarted, isFullscreenRequired]);

  // === End Anti-Cheat Effects ===

  const handleStartExam = async () => {
    if (isFullscreenRequired) {
      try {
        await document.documentElement.requestFullscreen();
        setIsStarted(true);
        setTimeout(() => captureSnapshot('initial_join'), 2000);
      } catch (err) {
        showToast("Fullscreen request failed. You must enable fullscreen to take this exam.", 'error');
      }
    } else {
      setIsStarted(true);
      setTimeout(() => captureSnapshot('initial_join'), 2000);
    }
  };

  const handleReturnToFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setShowFullscreenWarning(false);
    } catch (err) {
      showToast("Failed to enter fullscreen.", 'error');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleExit = async () => {
    // Auto-save before exit
    try {
      await fetch(`${API_BASE_URL}/api/exams/code/${examCode}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentEmail: studentEmail,
          answers: answers,
          currentQuestionIndex: currentQuestion,
          remainingTime: timeRemaining
        })
      });
      
      // Log exit count
      await fetch(`${API_BASE_URL}/api/exams/code/${examCode}/log-exit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail })
      });
    } catch (error) {
      console.error('Final save or exit log failed:', error);
    }

    // Close modal and exit
    setShowExitModal(false);
    onExit();
  };

  const handleSubmitExam = async () => {
    showConfirm('Are you sure you want to submit your exam? You cannot change your answers after submission.', async () => {
      setSubmitting(true);

      try {
        // Build responses array
        const responses = exam.questions.map((question, idx) => ({
          questionIndex: idx,
          questionText: question.text,
          questionType: question.type,
          studentAnswer: answers[idx] !== undefined ? answers[idx] : (question.type === 'multiple-choice' ? null : '')
        }));

        // Calculate time taken
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        // Submit to backend
        const response = await fetch(`${API_BASE_URL}/api/exams/code/${examCode}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: studentName,
            studentEmail: studentEmail,
            responses: responses,
            timeTaken: timeTaken
          })
        });

        const data = await response.json();

        if (!response.ok) {
          showToast(data.error || 'Failed to submit exam', 'error');
          setSubmitting(false);
          return;
        }

        setSubmitted(true);
        showToast('Exam submitted successfully!', 'success');
        setTimeout(() => onExit(), 2000);
      } catch (error) {
        console.error('Error submitting exam:', error);
        showToast('Network error. Please try again.', 'error');
        setSubmitting(false);
      }
    });
  };

  const isTimeUp = timeRemaining === 0;
  const timeWarning = timeRemaining < 300; // Less than 5 minutes

  if (!exam || !exam.questions) {
    return <div className="exam-container">Loading exam...</div>;
  }

  const question = exam.questions[currentQuestion];

  // Pre-Exam Start Screen
  if (!isStarted && isFullscreenRequired) {
    return (
      <>
        <style>{examStyles}</style>

        {/* Hidden webcam components unconditionally mapped to lock DOM reconciliation */}
        <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '10px', height: '10px', zIndex: -100 }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="start-screen">
          <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '16px', color: 'var(--text-dark)', fontSize: '24px' }}>Ready to begin?</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
              This exam requires <strong>Fullscreen Mode</strong> and may have active anti-cheating measures (like tab tracking). Ensure you will not be interrupted.
            </p>
            <button className="btn-submit" onClick={handleStartExam} style={{ width: '100%', fontSize: '18px', padding: '16px' }}>
              Start Assessment →
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{examStyles}</style>

      {/* Hidden webcam components */}
      <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '10px', height: '10px', zIndex: -100 }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="exam-container" style={{ filter: showFullscreenWarning || showTabWarning ? 'blur(8px)' : 'none', pointerEvents: showFullscreenWarning || showTabWarning ? 'none' : 'auto' }}>
        {/* Header with timer */}
        <div className="exam-header">
          <h1 className="exam-title">{exam.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {showSaveIndicator && (
              <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '500' }}>
                ✓ Saved
              </div>
            )}
            <div className={`exam-timer ${timeWarning ? 'warning' : ''}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
            <button
              onClick={() => setShowExitModal(true)}
              disabled={submitted}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: submitted ? 'not-allowed' : 'pointer',
                opacity: submitted ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => !submitted && (e.target.style.background = '#f8fafc')}
              onMouseOut={(e) => !submitted && (e.target.style.background = 'transparent')}
            >
              Exit
            </button>
            <button
              onClick={() => captureSnapshot('test_button_clicked')}
              style={{
                background: 'var(--primary)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Test Snapshot
            </button>
          </div>
        </div>

        {/* NEW: Exam Wrapper for layout */}
        <div className="exam-wrapper">
          {/* Exam content */}
          <div className="exam-content">
            {/* Instructions */}
            {currentQuestion === 0 && (
              <div className="exam-instructions">
                <h2 className="instructions-header">Instructions</h2>
                <p className="instructions-text">
                  {exam.description || 'Please read all questions carefully and provide your best answers.'}
                </p>
                <div className="exam-rules">
                  <div className="rule-item">
                    <strong>Duration:</strong> {exam.duration} minutes
                  </div>
                  <div className="rule-item">
                    <strong>Total Questions:</strong> {exam.questions.length}
                  </div>
                  <div className="rule-item">
                    <strong>Passing Score:</strong> {exam.passingScore}%
                  </div>
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="questions-container">
              <div className="question-block">
                <div className="question-header">
                  <div className="question-number">
                    Question {currentQuestion + 1} of {exam.questions.length}
                  </div>
                  <h3 className="question-text">{question.text}</h3>
                  <div className="question-meta">
                    Points: {question.points}
                  </div>
                </div>

                {/* Answer Area */}
                {question.type === 'multiple-choice' ? (
                  <div className="options-list">
                    {question.options.map((option, optIdx) => (
                      <label
                        key={optIdx}
                        className={`option-item ${
                          answers[currentQuestion] === optIdx ? 'selected' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={optIdx}
                          checked={answers[currentQuestion] === optIdx}
                          onChange={() => handleAnswerChange(currentQuestion, optIdx)}
                          disabled={submitted}
                        />
                        <span className="option-label">{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="short-answer-input"
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                    disabled={submitted}
                    onCopy={(e) => {
                      if (exam?.security?.copyPaste) {
                        e.preventDefault();
                        showToast("Copy/Paste is disabled during this exam.", 'error');
                      }
                    }}
                    onCut={(e) => {
                      if (exam?.security?.copyPaste) {
                        e.preventDefault();
                        showToast("Copy/Paste is disabled during this exam.", 'error');
                      }
                    }}
                    onPaste={(e) => {
                      if (exam?.security?.copyPaste) {
                        e.preventDefault();
                        showToast("Copy/Paste is disabled during this exam.", 'error');
                      }
                    }}
                  />
                )}
              </div>

              {/* Navigation */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'space-between',
                  marginBottom: '40px'
                }}
              >
                <button
                  className="btn-cancel"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  ← Previous
                </button>

                <div style={{ color: 'var(--text-muted)', fontSize: '14px', alignSelf: 'center' }}>
                  Question {currentQuestion + 1}/{exam.questions.length}
                </div>

                {currentQuestion < exam.questions.length - 1 ? (
                  <button
                    className="btn-cancel"
                    onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    className="btn-submit"
                    onClick={handleSubmitExam}
                    disabled={submitted || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Exam'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* NEW: Question Navigator Sidebar */}
          <div className="exam-sidebar">
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-dark)' }}>
              Question Navigator
            </h3>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '3px' }}></span> Answered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--danger)', borderRadius: '3px' }}></span> Not Answered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border-color)', borderRadius: '3px' }}></span> Not Visited
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="nav-grid">
              {exam.questions.map((_, idx) => {
                const status = getQuestionStatus(idx);
                const isCurrent = currentQuestion === idx;
                return (
                  <button
                    key={idx}
                    className={`nav-btn ${status} ${isCurrent ? 'current' : ''}`}
                    onClick={() => setCurrentQuestion(idx)}
                    title={`Go to Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Exit Confirmation Modal */}
        {showExitModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: 'authFadeInRight 0.2s ease-out'
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
                animation: 'authFadeInRight 0.3s ease-out'
              }}
            >
              <h2
                style={{
                  color: 'var(--text-dark)',
                  marginBottom: '12px',
                  fontSize: '20px',
                  fontWeight: '700'
                }}
              >
                Exit Exam?
              </h2>
              <p
                style={{
                  color: 'var(--text-muted)',
                  marginBottom: '28px',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
              >
                Your progress will be saved. You can resume this exam later from the same email address.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}
              >
                <button
                  onClick={() => setShowExitModal(false)}
                  style={{
                    padding: '12px',
                    background: 'transparent',
                    color: 'var(--primary)',
                    border: '1.5px solid var(--primary)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => (e.target.style.background = '#f1f5f9')}
                  onMouseOut={(e) => (e.target.style.background = 'transparent')}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExit}
                  style={{
                    padding: '12px',
                    background: 'var(--danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                  }}
                  onMouseOver={(e) => (e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)')}
                  onMouseOut={(e) => (e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.2)')}
                >
                  Exit Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Anti-Cheat Overlays */}
      {showFullscreenWarning && (
        <div className="fullscreen-overlay" style={{ pointerEvents: 'auto' }}>
          <h2>⚠️ Fullscreen Exited</h2>
          <p>This exam requires you to remain in full-screen mode. Please return to full-screen to continue your exam.</p>
          <div className="fullscreen-actions">
            <button
              onClick={handleReturnToFullscreen}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
            >
              Return to Exam
            </button>
            <button
              onClick={() => { setShowFullscreenWarning(false); handleExit(); }}
              style={{ background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
            >
              Exit Exam
            </button>
          </div>
        </div>
      )}

      {showTabWarning && (
        <div className="fullscreen-overlay" style={{ pointerEvents: 'auto' }}>
          <h2>⚠️ Activity Flagged</h2>
          <p>You have switched tabs or windows. This is a violation of exam rules. Your instructor has been notified.</p>
          <button
            onClick={() => setShowTabWarning(false)}
            style={{ marginTop: '20px', background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
          >
            I Understand
          </button>
        </div>
      )}
    </>
  );
}

export default StudentExamTaking;