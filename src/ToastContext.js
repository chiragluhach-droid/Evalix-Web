import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const toastStyles = `
  /* Toasts */
  .toast-container {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    min-width: 300px;
    max-width: 400px;
    pointer-events: auto;
    animation: toastSlideIn 0.3s ease-out forwards;
    border-left: 4px solid var(--primary);
  }

  .toast.error {
    border-left-color: #ef4444;
  }
  
  .toast.success {
    border-left-color: #10b981;
  }

  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .toast.error .toast-icon {
    color: #ef4444;
    background: #fef2f2;
  }

  .toast.success .toast-icon {
    color: #10b981;
    background: #ecfdf5;
  }

  .toast.info .toast-icon {
    color: var(--primary);
    background: #e0e7ff;
  }

  .toast-message {
    flex: 1;
    color: var(--text-dark, #0f172a);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }

  .toast-close {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .toast-close:hover {
    color: #475569;
  }

  @keyframes toastSlideIn {
    from { opacity: 0; transform: translateX(50px) scale(0.9); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }

  /* Confirm Modal */
  .confirm-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
  }

  .confirm-modal {
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: slideUp 0.3s ease-out;
  }

  .confirm-header {
    margin-bottom: 16px;
  }

  .confirm-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-dark, #0f172a);
    margin-bottom: 8px;
  }

  .confirm-message {
    font-size: 15px;
    color: var(--text-muted, #64748b);
    line-height: 1.5;
  }

  .confirm-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 28px;
  }

  .confirm-btn-cancel {
    background: #f1f5f9;
    color: var(--text-dark, #0f172a);
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .confirm-btn-cancel:hover {
    background: #e2e8f0;
  }

  .confirm-btn-ok {
    background: var(--primary, #4f46e5);
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
  }

  .confirm-btn-ok:hover {
    background: var(--primary-hover, #4338ca);
    transform: translateY(-1px);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { message, onConfirm, onCancel, title }

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showConfirm = useCallback((message, onConfirm, title = "Are you sure?") => {
    setConfirmState({
      message,
      title,
      onConfirm: () => {
        setConfirmState(null);
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setConfirmState(null);
      }
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}
      <style>{toastStyles}</style>
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
              {toast.type === 'error' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              )}
              {toast.type === 'info' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              )}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmState && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-header">
              <h3 className="confirm-title">{confirmState.title}</h3>
              <p className="confirm-message">{confirmState.message}</p>
            </div>
            <div className="confirm-actions">
              <button className="confirm-btn-cancel" onClick={confirmState.onCancel}>Cancel</button>
              <button className="confirm-btn-ok" onClick={confirmState.onConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastContext;
