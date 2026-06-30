import React, { useMemo } from 'react';
import { DATA, FFS_FEES } from '../utils/data';
import { fmtMoney, fmtInt } from '../utils/formatters';

export default function FFSTab({ mode, activePeriodKeys, currentEmpIds, empName, isMultiEmpView, periodsLabel }) {
  const rows = useMemo(() => {
    const empIds = new Set(currentEmpIds);
    const out = [];
    activePeriodKeys.forEach(pk => {
      const p = DATA.periods[pk];
      if (!p) return;
      p.ffs_breakdown.forEach(r => {
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
      return a.svc.localeCompare(b.svc);
    });
    return out;
  }, [activePeriodKeys, currentEmpIds, empName, mode, isMultiEmpView]);

  const showEmpCol = mode === 'admin' && isMultiEmpView;

  let totCnt = 0, totQty = 0, totPay = 0;
  rows.forEach(r => { totCnt += r.cnt; totQty += r.qty; totPay += r.pay; });

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>FFS Breakdown by Service</h2>
        <div className="meta">{periodsLabel}</div>
      </div>
      {rows.length === 0 ? (
        <div className="empty">No FFS services recorded for this selection.</div>
      ) : (
        <div className="table-wrap">
          <table className="t-ffs">
            <thead>
              <tr>
                <th>Month</th>
                {showEmpCol && <th>Employee</th>}
                <th>Service Name</th>
                <th className="num">Service Count</th>
                <th className="num">Product Usage Qty</th>
                <th className="num">FFS Payout per Service/Syringe</th>
                <th className="num">Total FFS Payout</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const feeMap = FFS_FEES[r.period_key] || {};
                const perSvc = Object.prototype.hasOwnProperty.call(feeMap, r.svc)
                  ? feeMap[r.svc]
                  : (r.cnt ? r.pay / r.cnt : 0);
                return (
                  <tr key={i}>
                    <td>{r.period_label}</td>
                    {showEmpCol && <td>{empName[r.emp] || r.emp}</td>}
                    <td>{r.svc}</td>
                    <td className="num">{fmtInt(r.cnt)}</td>
                    <td className="num">{fmtInt(r.qty)}</td>
                    <td className="num">{fmtMoney(perSvc)}</td>
                    <td className="num">{fmtMoney(r.pay)}</td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td>TOTAL</td>
                {showEmpCol && <td></td>}
                <td></td>
                <td className="num">{fmtInt(totCnt)}</td>
                <td className="num">{fmtInt(totQty)}</td>
                <td className="num"></td>
                <td className="num">{fmtMoney(totPay)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
