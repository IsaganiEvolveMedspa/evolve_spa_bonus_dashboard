import React from 'react';

export default function Header({ mode, userLabel, onLogout, onExportPDF }) {
  return (
    <div className="header">
      <div>
        <h1>
          Evolve Med Spa — Bonus Dashboard{' '}
          <span className="badge">{mode === 'admin' ? 'ADMIN' : 'EMPLOYEE'}</span>
        </h1>
      </div>
      <div className="right">
        <span style={{ fontSize: '13px', color: '#d1d5db' }}>{userLabel}</span>
        <button type="button" className="export-btn" onClick={onExportPDF}>
          Export PDF
        </button>
        <a onClick={onLogout}>Sign out</a>
      </div>
    </div>
  );
}
