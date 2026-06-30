import React, { useState, useCallback } from 'react';
import './App.css';
import { DATA, ADMIN_PASSWORD } from './utils/data';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [mode, setMode] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  const allPeriodKeys = Object.keys(DATA.periods).sort().reverse();
  const [selectedPeriods, setSelectedPeriods] = useState(allPeriodKeys);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');

  const handleLoginEmployee = useCallback((id) => {
    let found = false;
    for (const pk of Object.keys(DATA.periods)) {
      if (DATA.periods[pk].monthly_bonus_summary.some(e => e.employee_id === id)) {
        found = true;
        break;
      }
    }
    if (!found) return 'Employee ID not found. Please check and try again.';
    setMode('employee');
    setEmployeeId(id);
    setSelectedPeriods(allPeriodKeys);
    setActiveTab('summary');
    return null;
  }, [allPeriodKeys]);

  const handleLoginAdmin = useCallback((pwd) => {
    if (pwd === ADMIN_PASSWORD) {
      setMode('admin');
      setEmployeeId(null);
      setSelectedPeriods(allPeriodKeys);
      setActiveTab('summary');
      return null;
    }
    return 'Incorrect admin password.';
  }, [allPeriodKeys]);

  const handleLogout = useCallback(() => {
    setMode(null);
    setEmployeeId(null);
    setSelectedEmpIds([]);
    setActiveTab('summary');
  }, []);

  if (!mode) {
    return (
      <LoginPage
        onLoginEmployee={handleLoginEmployee}
        onLoginAdmin={handleLoginAdmin}
      />
    );
  }

  return (
    <Dashboard
      mode={mode}
      employeeId={employeeId}
      selectedPeriods={selectedPeriods}
      setSelectedPeriods={setSelectedPeriods}
      selectedEmpIds={selectedEmpIds}
      setSelectedEmpIds={setSelectedEmpIds}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      allPeriodKeys={allPeriodKeys}
      onLogout={handleLogout}
    />
  );
}

export default App;
