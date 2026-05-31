import React from 'react';

export function Sidebar({ brand, role, items, active, onSelect, user, onLogout }) {
  const initials = (user?.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><span className="logo-box" />{brand}</div>
      <div className="sidebar-role">{role}</div>
      <nav className="sidebar-nav">
        {items.map(item => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? 'active' : ''}`}
            onClick={() => onSelect(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>Log out</button>
      </div>
    </aside>
  );
}

export function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        {desc && <div className="toggle-desc">{desc}</div>}
      </div>
      <label className="switch">
        <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
        <span className="slider" />
      </label>
    </div>
  );
}

export function Modal({ title, children, onClose, wide }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${wide ? 'modal-lg' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    draft: 'badge-draft', published: 'badge-published', finished: 'badge-finished',
    available: 'badge-info', upcoming: 'badge-draft', completed: 'badge-success', closed: 'badge-finished'
  };
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status}</span>;
}

export function Loading({ label = 'Loading...' }) {
  return <div className="loading-screen">{label}</div>;
}
