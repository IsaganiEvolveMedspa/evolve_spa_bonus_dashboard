import React, { useMemo } from 'react';
import { PERF } from '../utils/data';
import { fmtMoney, fmtInt, perfClass } from '../utils/formatters';

function PerfCard({ mode, employeeId, activePeriodKeys }) {
  if (mode === 'admin') {
    let a = 0, t = 0;
    activePeriodKeys.forEach(pk => {
      const c = (PERF.company || {})[pk];
      if (c) { a += c.actual || 0; t += c.target || 0; }
    });
    const pct = t ? (100 * a / t) : null;
    return (
      <div className="card highlight perf">
        <div className="lbl">Evolve Performance to Goal</div>
        <div className="val">
          {pct !== null ? (
            <span className={perfClass(pct)}>{pct.toFixed(1)}%</span>
          ) : 'N/A'}
        </div>
      </div>
    );
  }

  const ordered = [];
  activePeriodKeys.forEach(pk => {
    const locs = ((PERF.emp_locs || {})[pk] || {})[employeeId] || [];
    locs.forEach(l => { if (!ordered.includes(l)) ordered.push(l); });
  });

  const lines = [];
  ordered.forEach(loc => {
    let a = 0, t = 0, found = false;
    activePeriodKeys.forEach(pk => {
      const lp = ((PERF.locations || {})[pk] || {})[loc];
      if (lp) { found = true; a += lp.actual || 0; t += lp.target || 0; }
    });
    if (found && t > 0) lines.push({ loc, p: 100 * a / t });
  });

  return (
    <div className="card highlight perf">
      <div className="lbl">Performance to Goal</div>
      <div className="val">
        {lines.length ? lines.map(l => (
          <div className="pline" key={l.loc}>
            <span className="ploc">{l.loc}</span>
            <span className={`ppct ${perfClass(l.p)}`}>{l.p.toFixed(1)}%</span>
          </div>
        )) : <div className="pline"><span className="ppct">N/A</span></div>}
      </div>
    </div>
  );
}

export default function SummaryCards({ mode, mbsRows, employeeId, activePeriodKeys }) {
  const sum = (key) => mbsRows.reduce((a, e) => a + (e[key] || 0), 0);
  const uniqueEmps = new Set(mbsRows.map(r => r.employee_id)).size;

  return (
    <div className="summary-cards">
      <PerfCard mode={mode} employeeId={employeeId} activePeriodKeys={activePeriodKeys} />
      {mode === 'admin' && (
        <div className="card">
          <div className="lbl">Employees Shown</div>
          <div className="val">{fmtInt(uniqueEmps)}</div>
        </div>
      )}
      <div className="card">
        <div className="lbl">Sales Bonus</div>
        <div className="val">{fmtMoney(sum('sales_bonus'))}</div>
      </div>
      <div className="card">
        <div className="lbl">Operational Bonus</div>
        <div className="val">{fmtMoney(sum('operational_bonus'))}</div>
      </div>
      <div className="card">
        <div className="lbl">Retail Bonus</div>
        <div className="val">{fmtMoney(sum('retail_bonus'))}</div>
      </div>
      <div className="card">
        <div className="lbl">FFS Bonus</div>
        <div className="val">{fmtMoney(sum('ffs_bonus'))}</div>
      </div>
      <div className="card">
        <div className="lbl">Mgr/Concierge</div>
        <div className="val">{fmtMoney(sum('mgr_concierge_bonus'))}</div>
      </div>
      <div className="card">
        <div className="lbl">Other</div>
        <div className="val">{fmtMoney(sum('catchup'))}</div>
      </div>
      <div className="card highlight">
        <div className="lbl">Total Payout</div>
        <div className="val">{fmtMoney(sum('adjusted_totals'))}</div>
      </div>
    </div>
  );
}
