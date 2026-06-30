import React, { useMemo } from 'react';
import { fmtMoney } from '../utils/formatters';

function StatusPill({ status }) {
  const v = (status || '').toUpperCase();
  if (v.includes('ACTIVE')) return <span className="pill active">{status}</span>;
  if (v.includes('TERMIN')) return <span className="pill term">{status}</span>;
  if (status) return <span className="pill other">{status}</span>;
  return null;
}

export default function SummaryTab({ mode, mbsRows, periodsLabel, activePeriodKeys }) {
  const rows = useMemo(() => {
    const sorted = [...mbsRows];
    sorted.sort((a, b) => {
      const an = a.name || '', bn = b.name || '';
      if (an !== bn) return an.localeCompare(bn);
      return (b.period_key || '').localeCompare(a.period_key || '');
    });
    return sorted;
  }, [mbsRows]);

  const showMonthCol = activePeriodKeys.length > 1;

  const moneyKeys = ['sales_bonus', 'operational_bonus', 'retail_bonus', 'ffs_bonus', 'mgr_concierge_bonus', 'catchup', 'adjusted_totals'];

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Monthly Bonus Summary</h2>
        <div className="meta">{rows.length} row(s) · {periodsLabel}</div>
      </div>
      {rows.length === 0 ? (
        <div className="empty">No bonus data for this selection.</div>
      ) : (
        <div className="table-wrap">
          <table className="t-summary">
            <thead>
              <tr>
                {showMonthCol && <th>Month</th>}
                {mode === 'admin' && (
                  <>
                    <th>Employee ID</th>
                    <th>Location</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Status Type</th>
                    <th>Float</th>
                    <th>FFS Eligible</th>
                  </>
                )}
                {mode === 'employee' && (
                  <>
                    <th>Status</th>
                    <th>Status Type</th>
                  </>
                )}
                <th className="num">Sales Bonus</th>
                <th className="num">Operational Bonus</th>
                <th className="num">Retail Bonus</th>
                <th className="num">FFS Bonus</th>
                <th className="num">Mgr/Concierge</th>
                <th className="num">Other</th>
                <th className="num gap-left">Total Payout</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={i}>
                  {showMonthCol && <td>{e.period_label}</td>}
                  {mode === 'admin' && (
                    <>
                      <td>{e.employee_id}</td>
                      <td>{e.location}</td>
                      <td>{e.name}</td>
                      <td>{e.position}</td>
                      <td><StatusPill status={e.status} /></td>
                      <td>{e.status_type}</td>
                      <td>{e.float}</td>
                      <td>{e.ffs_eligible}</td>
                    </>
                  )}
                  {mode === 'employee' && (
                    <>
                      <td><StatusPill status={e.status} /></td>
                      <td>{e.status_type}</td>
                    </>
                  )}
                  <td className="num">{fmtMoney(e.sales_bonus)}</td>
                  <td className="num">{fmtMoney(e.operational_bonus)}</td>
                  <td className="num">{fmtMoney(e.retail_bonus)}</td>
                  <td className="num">{fmtMoney(e.ffs_bonus)}</td>
                  <td className="num">{fmtMoney(e.mgr_concierge_bonus)}</td>
                  <td className="num">{fmtMoney(e.catchup)}</td>
                  <td className="num gap-left">{fmtMoney(e.adjusted_totals)}</td>
                </tr>
              ))}
              {rows.length > 1 && (
                <tr className="total-row">
                  {showMonthCol && <td>TOTAL</td>}
                  {!showMonthCol && mode === 'admin' && <td>TOTAL</td>}
                  {!showMonthCol && mode === 'employee' && <td>TOTAL</td>}
                  {mode === 'admin' && <><td></td><td></td><td></td><td></td><td></td><td></td><td></td></>}
                  {mode === 'employee' && <><td></td></>}
                  {moneyKeys.map((k, idx) => (
                    <td key={k} className={`num ${idx === moneyKeys.length - 1 ? 'gap-left' : ''}`}>
                      {fmtMoney(rows.reduce((a, e) => a + (e[k] || 0), 0))}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
