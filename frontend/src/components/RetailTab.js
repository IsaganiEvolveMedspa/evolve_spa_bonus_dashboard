import React, { useMemo } from 'react';
import { DATA } from '../utils/data';
import { fmtMoney } from '../utils/formatters';

export default function RetailTab({ mode, activePeriodKeys, currentEmpIds, empName, isMultiEmpView, periodsLabel }) {
  const rows = useMemo(() => {
    const empIds = new Set(currentEmpIds);
    const out = [];
    activePeriodKeys.forEach(pk => {
      const p = DATA.periods[pk];
      if (!p) return;
      p.retail_sales.forEach(r => {
        if (!empIds.has(r.emp)) return;
        out.push({ ...r, period_key: pk, period_label: p.label });
      });
    });
    out.sort((a, b) => {
      if (a.period_key !== b.period_key) return b.period_key.localeCompare(a.period_key);
      if (mode === 'admin' && isMultiEmpView) {
        const an = empName[a.emp] || a.emp, bn = empName[b.emp] || b.emp;
        if (an !== bn) return an.localeCompare(bn);
      }
      return a.prod.localeCompare(b.prod);
    });
    return out;
  }, [activePeriodKeys, currentEmpIds, empName, mode, isMultiEmpView]);

  const showEmpCol = mode === 'admin' && isMultiEmpView;
  const total = rows.reduce((a, r) => a + r.sales, 0);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Retail Products Sales</h2>
        <div className="meta">{periodsLabel}</div>
      </div>
      {rows.length === 0 ? (
        <div className="empty">No retail sales recorded for this selection.</div>
      ) : (
        <div className="table-wrap">
          <table className="t-retail">
            <thead>
              <tr>
                <th>Month</th>
                {showEmpCol && <th>Employee</th>}
                <th>Product Name</th>
                <th className="num">Net Retail Product Sales</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.period_label}</td>
                  {showEmpCol && <td>{empName[r.emp] || r.emp}</td>}
                  <td>{r.prod}</td>
                  <td className="num">{fmtMoney(r.sales)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>TOTAL</td>
                {showEmpCol && <td></td>}
                <td></td>
                <td className="num">{fmtMoney(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
