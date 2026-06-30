import React from 'react';

const TABS = [
  { key: 'overview', label: 'Summary', adminOnly: true },
  { key: 'summary', label: 'Monthly Bonus Summary' },
  { key: 'ffs', label: 'FFS Breakdown' },
  { key: 'retail', label: 'Retail Products Sales' },
  { key: 'schedule', label: 'Current FFS Schedule', glow: true },
];

export default function TabNavigation({ activeTab, setActiveTab, mode }) {
  return (
    <div className="tabs">
      {TABS.filter(t => !t.adminOnly || mode === 'admin').map(t => (
        <div
          key={t.key}
          className={`tab ${activeTab === t.key ? 'active' : ''} ${t.glow ? 'glow-green' : ''}`}
          onClick={() => setActiveTab(t.key)}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
