// Shared design system styles for all dashboards. Injected once via <style>.
const theme = `
  :root {
    --primary: #4f46e5;
    --primary-light: #e0e7ff;
    --primary-hover: #4338ca;
    --bg-main: #ffffff;
    --bg-secondary: #f8fafc;
    --text-dark: #0f172a;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --green: #10b981;
    --red: #ef4444;
    --amber: #f59e0b;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg-secondary); color: var(--text-dark); }

  .app-shell { display: flex; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    width: 248px; background: #fff; border-right: 1px solid var(--border-color);
    display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0; left: 0; z-index: 20;
  }
  .sidebar-brand {
    padding: 22px 24px; font-size: 22px; font-weight: 800; color: var(--primary);
    display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color);
  }
  .sidebar-brand .logo-box { width: 26px; height: 26px; background: var(--primary); border-radius: 7px; border-top-right-radius: 2px; border-bottom-left-radius: 2px; }
  .sidebar-role { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); padding: 16px 24px 8px; }
  .sidebar-nav { flex: 1; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px;
    font-size: 14px; font-weight: 500; color: var(--text-muted); cursor: pointer; border: none; background: none; text-align: left; width: 100%;
    transition: all 0.15s;
  }
  .nav-item:hover { background: var(--bg-secondary); color: var(--text-dark); }
  .nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
  .nav-item .nav-icon { font-size: 18px; width: 20px; text-align: center; }
  .sidebar-footer { padding: 16px; border-top: 1px solid var(--border-color); }
  .sidebar-user { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .sidebar-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
  .sidebar-user-info { overflow: hidden; }
  .sidebar-user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-user-email { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .logout-btn { width: 100%; padding: 10px; border: 1px solid var(--border-color); background: #fff; border-radius: 8px; font-size: 13px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
  .logout-btn:hover { border-color: var(--red); color: var(--red); }

  /* Main content */
  .main-content { flex: 1; margin-left: 248px; padding: 32px 40px; max-width: 100%; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
  .page-title { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .page-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 4px; }

  /* Stat cards */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card { background: #fff; border: 1px solid var(--border-color); border-radius: 16px; padding: 20px; }
  .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
  .stat-value { font-size: 30px; font-weight: 800; margin-top: 6px; letter-spacing: -1px; }
  .stat-icon { font-size: 22px; margin-bottom: 8px; display: block; }

  /* Cards & panels */
  .panel { background: #fff; border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
  .panel-title { font-size: 17px; font-weight: 700; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }

  /* Tables */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--text-muted); padding: 10px 14px; border-bottom: 2px solid var(--border-color); font-weight: 600; }
  .data-table td { padding: 13px 14px; border-bottom: 1px solid var(--border-color); font-size: 14px; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: var(--bg-secondary); }

  /* Buttons */
  .btn { padding: 11px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; display: inline-flex; align-items: center; gap: 8px; }
  .btn-primary { background: var(--primary); color: #fff; }
  .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
  .btn-secondary { background: var(--bg-secondary); color: var(--text-dark); border: 1px solid var(--border-color); }
  .btn-secondary:hover { background: #eef2f7; }
  .btn-danger { background: #fef2f2; color: var(--red); }
  .btn-danger:hover { background: #fee2e2; }
  .btn-sm { padding: 7px 12px; font-size: 13px; }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  /* Badges */
  .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-draft { background: #f1f5f9; color: var(--text-muted); }
  .badge-published { background: #ecfdf5; color: var(--green); }
  .badge-finished { background: #fef3c7; color: var(--amber); }
  .badge-success { background: #ecfdf5; color: var(--green); }
  .badge-danger { background: #fef2f2; color: var(--red); }
  .badge-info { background: var(--primary-light); color: var(--primary); }

  /* Forms */
  .form-group { margin-bottom: 18px; }
  .form-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 7px; }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 11px 14px; border: 1px solid var(--border-color); border-radius: 10px;
    font-size: 14px; background: var(--bg-secondary); color: var(--text-dark); font-family: inherit;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-hint { font-size: 12px; color: var(--text-muted); margin-top: 5px; }

  /* Toggle switch */
  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border-color); }
  .toggle-row:last-child { border-bottom: none; }
  .toggle-label { font-size: 14px; font-weight: 600; }
  .toggle-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .switch { position: relative; width: 46px; height: 26px; flex-shrink: 0; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 26px; transition: 0.2s; }
  .slider:before { content: ""; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.2s; }
  .switch input:checked + .slider { background: var(--primary); }
  .switch input:checked + .slider:before { transform: translateX(20px); }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: #fff; border-radius: 18px; padding: 28px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
  .modal-lg { max-width: 720px; }
  .modal-title { font-size: 20px; font-weight: 800; margin-bottom: 20px; }
  .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

  /* Empty states */
  .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
  .empty-state .empty-icon { font-size: 44px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 17px; color: var(--text-dark); margin-bottom: 6px; }

  /* Tabs */
  .tab-bar { display: flex; gap: 4px; border-bottom: 1px solid var(--border-color); margin-bottom: 24px; }
  .tab { padding: 12px 18px; font-size: 14px; font-weight: 600; color: var(--text-muted); cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; margin-bottom: -1px; }
  .tab:hover { color: var(--text-dark); }
  .tab.active { color: var(--primary); border-bottom-color: var(--primary); }

  .loading-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: var(--text-muted); font-size: 15px; }

  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default theme;
