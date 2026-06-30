import React, { useMemo, useRef, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import { DATA, PERF, FFS_FEES } from '../utils/data';
import Header from './Header';
import Toolbar from './Toolbar';
import SummaryCards from './SummaryCards';
import TabNavigation from './TabNavigation';
import OverviewTab from './OverviewTab';
import SummaryTab from './SummaryTab';
import FFSTab from './FFSTab';
import RetailTab from './RetailTab';
import ScheduleTab from './ScheduleTab';

export default function Dashboard({
  mode, employeeId, selectedPeriods, setSelectedPeriods,
  selectedEmpIds, setSelectedEmpIds, activeTab, setActiveTab,
  allPeriodKeys, onLogout,
}) {
  const activePeriodKeys = useMemo(() =>
    allPeriodKeys.filter(k => selectedPeriods.includes(k)),
    [allPeriodKeys, selectedPeriods]
  );

  const periodsLabel = useMemo(() => {
    if (activePeriodKeys.length === 0) return 'No period selected';
    if (activePeriodKeys.length === 1) return DATA.periods[activePeriodKeys[0]].label;
    if (activePeriodKeys.length === allPeriodKeys.length) return `All periods (${activePeriodKeys.length})`;
    if (activePeriodKeys.length <= 2) return activePeriodKeys.map(k => DATA.periods[k].label).join(', ');
    return `${activePeriodKeys.length} periods selected`;
  }, [activePeriodKeys, allPeriodKeys]);

  const mbsRows = useMemo(() => {
    const out = [];
    const selSet = new Set(selectedEmpIds);
    const usingSubset = mode === 'admin' && selectedEmpIds.length > 0;
    activePeriodKeys.forEach(pk => {
      const p = DATA.periods[pk];
      if (!p) return;
      let rows = p.monthly_bonus_summary;
      if (mode === 'employee') {
        rows = rows.filter(e => e.employee_id === employeeId);
      } else if (usingSubset) {
        rows = rows.filter(e => selSet.has(e.employee_id));
      }
      rows.forEach(r => out.push({ ...r, period_key: pk, period_label: p.label }));
    });
    return out;
  }, [activePeriodKeys, mode, employeeId, selectedEmpIds]);

  const currentEmpIds = useMemo(() =>
    [...new Set(mbsRows.map(e => e.employee_id))],
    [mbsRows]
  );

  const isMultiEmpView = currentEmpIds.length > 1;

  const empName = useMemo(() => {
    const m = {};
    activePeriodKeys.forEach(pk => {
      DATA.periods[pk]?.monthly_bonus_summary.forEach(e => { m[e.employee_id] = e.name; });
    });
    return m;
  }, [activePeriodKeys]);

  const userLabel = useMemo(() => {
    if (mode === 'employee') {
      const emp = mbsRows[0];
      return emp ? `${emp.name} (${emp.employee_id})` : employeeId;
    }
    return 'Admin';
  }, [mode, mbsRows, employeeId]);

  const contentRef = useRef(null);

  const handleExportPDF = useCallback(() => {
    const element = contentRef.current;
    if (!element) return;
    const empLabel = mode === 'employee' ? userLabel : 'All Employees';
    const filename = `Bonus_Dashboard_${empLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };
    html2pdf().set(opt).from(element).save();
  }, [mode, userLabel]);

  return (
    <div>
      <Header mode={mode} userLabel={userLabel} onLogout={onLogout} onExportPDF={handleExportPDF} />
      <div ref={contentRef}>
      {activeTab !== 'schedule' && (
        <Toolbar
          mode={mode}
          allPeriodKeys={allPeriodKeys}
          selectedPeriods={selectedPeriods}
          setSelectedPeriods={setSelectedPeriods}
          selectedEmpIds={selectedEmpIds}
          setSelectedEmpIds={setSelectedEmpIds}
          activePeriodKeys={activePeriodKeys}
          hideEmployeeFilter={activeTab === 'overview'}
        />
      )}
      <div className="container">
        {activeTab !== 'overview' && activeTab !== 'schedule' && (
          <>
            <h2 className="cum-header">Cumulative Bonusing</h2>
            <SummaryCards
              mode={mode}
              mbsRows={mbsRows}
              employeeId={employeeId}
              activePeriodKeys={activePeriodKeys}
            />
          </>
        )}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} mode={mode} />

        {activeTab === 'overview' && mode === 'admin' && (
          <OverviewTab
            activePeriodKeys={activePeriodKeys}
            periodsLabel={periodsLabel}
          />
        )}
        {activeTab === 'summary' && (
          <SummaryTab
            mode={mode}
            mbsRows={mbsRows}
            periodsLabel={periodsLabel}
            activePeriodKeys={activePeriodKeys}
          />
        )}
        {activeTab === 'ffs' && (
          <FFSTab
            mode={mode}
            activePeriodKeys={activePeriodKeys}
            currentEmpIds={currentEmpIds}
            empName={empName}
            isMultiEmpView={isMultiEmpView}
            periodsLabel={periodsLabel}
          />
        )}
        {activeTab === 'retail' && (
          <RetailTab
            mode={mode}
            activePeriodKeys={activePeriodKeys}
            currentEmpIds={currentEmpIds}
            empName={empName}
            isMultiEmpView={isMultiEmpView}
            periodsLabel={periodsLabel}
          />
        )}
        {activeTab === 'schedule' && <ScheduleTab />}
      </div>
      </div>
    </div>
  );
}
