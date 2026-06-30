import React, { useState } from 'react';

export default function LoginPage({ onLoginEmployee, onLoginAdmin }) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [empId, setEmpId] = useState('');
  const [adminPwd, setAdminPwd] = useState('');
  const [error, setError] = useState('');

  const handleEmpLogin = () => {
    if (!empId.trim()) { setError('Please enter your Employee ID.'); return; }
    const err = onLoginEmployee(empId.trim());
    if (err) setError(err);
  };

  const handleAdminLogin = () => {
    const err = onLoginAdmin(adminPwd);
    if (err) setError(err);
  };

  const handleEmpKeyDown = (e) => { if (e.key === 'Enter') handleEmpLogin(); };
  const handleAdminKeyDown = (e) => { if (e.key === 'Enter') handleAdminLogin(); };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="logo">
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#a37b88', letterSpacing: '0.05em' }}>
            EVOLVE
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '0.1em' }}>MED SPA</div>
        </div>
        <h1>Evolve Med Spa Bonus Dashboard</h1>
        <p className="sub">Enter your Employee ID to view your bonus details</p>

        {error && <div className="err">{error}</div>}

        {!showAdmin ? (
          <div>
            <div className="field">
              <label htmlFor="empIdInput">Employee ID</label>
              <input
                type="text"
                id="empIdInput"
                autoComplete="off"
                placeholder="e.g., 4567890"
                value={empId}
                onChange={e => { setEmpId(e.target.value); setError(''); }}
                onKeyDown={handleEmpKeyDown}
                autoFocus
              />
            </div>
            <button className="btn" onClick={handleEmpLogin}>View My Bonus</button>
            <div className="link">
              <a onClick={() => { setShowAdmin(true); setError(''); }}>Admin login →</a>
            </div>
          </div>
        ) : (
          <div>
            <div className="field">
              <label htmlFor="adminPwdInput">Admin Password</label>
              <input
                type="password"
                id="adminPwdInput"
                autoComplete="off"
                placeholder="Enter admin password"
                value={adminPwd}
                onChange={e => { setAdminPwd(e.target.value); setError(''); }}
                onKeyDown={handleAdminKeyDown}
                autoFocus
              />
            </div>
            <button className="btn" onClick={handleAdminLogin}>Admin Sign In</button>
            <div className="link">
              <a onClick={() => { setShowAdmin(false); setError(''); }}>← Back to Employee login</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
