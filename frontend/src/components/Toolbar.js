import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DATA } from '../utils/data';

export default function Toolbar({
  mode, allPeriodKeys, selectedPeriods, setSelectedPeriods,
  selectedEmpIds, setSelectedEmpIds, activePeriodKeys,
  hideEmployeeFilter,
}) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [empOpen, setEmpOpen] = useState(false);
  const [empSearch, setEmpSearch] = useState('');
  const periodRef = useRef(null);
  const empRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (periodRef.current && !periodRef.current.contains(e.target)) setPeriodOpen(false);
      if (empRef.current && !empRef.current.contains(e.target)) setEmpOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const periodLabel = useMemo(() => {
    if (selectedPeriods.length === 0) return 'Select periods…';
    if (selectedPeriods.length === allPeriodKeys.length) return `All periods (${allPeriodKeys.length})`;
    if (selectedPeriods.length === 1) return DATA.periods[selectedPeriods[0]]?.label;
    return `${selectedPeriods.length} periods`;
  }, [selectedPeriods, allPeriodKeys]);

  const togglePeriod = (pk) => {
    setSelectedPeriods(prev =>
      prev.includes(pk) ? prev.filter(p => p !== pk) : [...prev, pk]
    );
  };

  const allEmployees = useMemo(() => {
    const map = {};
    activePeriodKeys.forEach(pk => {
      DATA.periods[pk]?.monthly_bonus_summary.forEach(e => {
        if (!map[e.employee_id]) map[e.employee_id] = e.name;
      });
    });
    return Object.entries(map).sort((a, b) => a[1].localeCompare(b[1]));
  }, [activePeriodKeys]);

  const filteredEmployees = useMemo(() => {
    if (!empSearch) return allEmployees;
    const s = empSearch.toLowerCase();
    return allEmployees.filter(([id, name]) =>
      name.toLowerCase().includes(s) || id.includes(s)
    );
  }, [allEmployees, empSearch]);

  const empLabel = useMemo(() => {
    if (selectedEmpIds.length === 0) return `All employees (${allEmployees.length})`;
    if (selectedEmpIds.length === 1) {
      const found = allEmployees.find(([id]) => id === selectedEmpIds[0]);
      return found ? found[1] : selectedEmpIds[0];
    }
    return `${selectedEmpIds.length} employees`;
  }, [selectedEmpIds, allEmployees]);

  const toggleEmp = (id) => {
    setSelectedEmpIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="toolbar">
      <div className="field" ref={periodRef}>
        <label>Period(s)</label>
        <div className="multi-select">
          <button type="button" className="ms-trigger" onClick={() => setPeriodOpen(!periodOpen)}>
            <span>{periodLabel}</span>
            <span className="caret">▼</span>
          </button>
          {periodOpen && (
            <div className="ms-panel">
              <div className="ms-actions">
                <button onClick={() => setSelectedPeriods([...allPeriodKeys])}>Select All</button>
                <button onClick={() => setSelectedPeriods([])}>Clear</button>
              </div>
              {allPeriodKeys.map(pk => (
                <label key={pk} className="ms-row" onClick={() => togglePeriod(pk)}>
                  <input
                    type="checkbox"
                    checked={selectedPeriods.includes(pk)}
                    readOnly
                  />
                  {DATA.periods[pk].label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {mode === 'admin' && !hideEmployeeFilter && (
        <div className="field" ref={empRef}>
          <label>Employee(s)</label>
          <div className="multi-select" style={{ minWidth: '300px' }}>
            <button type="button" className="ms-trigger" onClick={() => setEmpOpen(!empOpen)}>
              <span>{empLabel}</span>
              <span className="caret">▼</span>
            </button>
            {empOpen && (
              <div className="ms-panel">
                <div className="ms-actions">
                  <button onClick={() => setSelectedEmpIds(allEmployees.map(([id]) => id))}>
                    Select All
                  </button>
                  <button onClick={() => setSelectedEmpIds([])}>Clear</button>
                </div>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', marginBottom: '4px' }}>
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={empSearch}
                    onChange={e => setEmpSearch(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                {filteredEmployees.map(([id, name]) => (
                  <label key={id} className="ms-row" onClick={() => toggleEmp(id)}>
                    <input
                      type="checkbox"
                      checked={selectedEmpIds.includes(id)}
                      readOnly
                    />
                    {name} ({id})
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
