import React, { useMemo } from 'react';
import { DATA, PERF, LOC_GOAL, TOP_DATA } from '../utils/data';
import { fmtMoney, fmtInt } from '../utils/formatters';

const TYPE_COLORS = {
  FFS: "#a37b88", Sales: "#2e2e2e", Retail: "#c2a6ae",
  Operational: "#8a8786", "Mgr/Concierge": "#7e5c68", Other: "#ccc8c4",
};
const POS_PALETTE = ["#a37b88","#2e2e2e","#7e5c68","#8a8786","#c2a6ae","#5a5a5a","#ccc8c4","#b89aa2","#e8e7e4"];
const CUP_COLORS = ["#D4AF37", "#A8A9AD", "#CD7F32"];
const EXCLUDE_LOCS = new Set(["Marlton","Staten Island","Pikesville","Montvale","Scarsdale"]);

function goalClass(p) {
  return p >= 100 ? "g-good" : (p >= 90 ? "g-mid" : "g-under");
}

function SvgPie({ slices, size }) {
  const total = slices.reduce((a, s) => a + (s.value > 0 ? s.value : 0), 0);
  const r = size / 2;
  if (total <= 0) {
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={r} cy={r} r={r} fill="#f3f4f6" />
      </svg>
    );
  }
  let ang = -Math.PI / 2;
  const paths = [];
  slices.forEach((s, i) => {
    if (!(s.value > 0)) return;
    const frac = s.value / total;
    const a2 = ang + frac * 2 * Math.PI;
    if (frac > 0.99999) {
      paths.push(<circle key={i} cx={r} cy={r} r={r} fill={s.color} />);
    } else {
      const x1 = r + r * Math.cos(ang), y1 = r + r * Math.sin(ang);
      const x2 = r + r * Math.cos(a2), y2 = r + r * Math.sin(a2);
      const large = frac > 0.5 ? 1 : 0;
      paths.push(
        <path key={i} d={`M${r},${r} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`} fill={s.color} />
      );
    }
    ang = a2;
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {paths}
      <circle cx={r} cy={r} r={+(r * 0.55).toFixed(1)} fill="#fff" />
    </svg>
  );
}

function PieBlock({ title, slices }) {
  const total = slices.reduce((a, s) => a + (s.value > 0 ? s.value : 0), 0);
  const visible = slices.filter(s => s.value > 0);
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="pie-wrap">
        <SvgPie slices={slices} size={180} />
        <ul className="legend">
          {visible.length ? visible.map((s, i) => (
            <li key={i}>
              <span className="sw" style={{ background: s.color }} />
              {s.label}
              <span className="lv">
                {fmtMoney(s.value)}
                <span className="lpct">{total ? (100 * s.value / total).toFixed(1) : "0.0"}%</span>
              </span>
            </li>
          )) : <li>No data</li>}
        </ul>
      </div>
    </div>
  );
}

function CupSvg({ color }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={color} aria-hidden="true">
      <path d="M18 2H6v2H2v3a4 4 0 0 0 4 4h.4A6 6 0 0 0 11 17.9V20H7.5v2h9v-2H13v-2.1A6 6 0 0 0 17.6 13H18a4 4 0 0 0 4-4V4h-4V2zM4 7V6h2v3a2 2 0 0 1-2-2zm16 2a2 2 0 0 1-2 2h0V6h2v1z" />
    </svg>
  );
}

function TopTable({ title, nameHead, valHead, rows, fmtVal }) {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <table className="goal-table top-table">
        <thead>
          <tr><th className="rkh"></th><th>{nameHead}</th><th className="num">{valHead}</th></tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((r, i) => (
            <tr key={i}>
              <td className="rkc">
                {i < 3 ? <CupSvg color={CUP_COLORS[i]} /> : i + 1}
              </td>
              <td>{r.k}</td>
              <td className="num">{fmtVal(r.val)}</td>
            </tr>
          )) : <tr><td colSpan="3">No data</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default function OverviewTab({ activePeriodKeys, periodsLabel }) {
  const data = useMemo(() => {
    const rows = [];
    activePeriodKeys.forEach(pk => {
      const p = DATA.periods[pk];
      if (p) p.monthly_bonus_summary.forEach(r => rows.push(r));
    });
    const sum = (k) => rows.reduce((a, r) => a + (r[k] || 0), 0);
    const totalBonus = sum("adjusted_totals");
    let revenue = 0;
    activePeriodKeys.forEach(pk => {
      const c = (PERF.company || {})[pk];
      if (c) revenue += c.actual || 0;
    });
    const dirBonus = rows.filter(r => String(r.position || "").toLowerCase().includes("director"))
      .reduce((a, r) => a + (r.adjusted_totals || 0), 0);
    const inclPct = revenue ? 100 * totalBonus / revenue : 0;
    const exclPct = revenue ? 100 * (totalBonus - dirBonus) / revenue : 0;
    const uniqueEmps = new Set(rows.map(r => r.employee_id)).size;

    const typeSlices = [
      { label: "FFS", value: sum("ffs_bonus") },
      { label: "Sales", value: sum("sales_bonus") },
      { label: "Retail", value: sum("retail_bonus") },
      { label: "Operational", value: sum("operational_bonus") },
      { label: "Mgr/Concierge", value: sum("mgr_concierge_bonus") },
      { label: "Other", value: sum("catchup") },
    ].map(s => ({ ...s, color: TYPE_COLORS[s.label] }));

    const posMap = {};
    rows.forEach(r => {
      const p = r.position || "N/A";
      posMap[p] = (posMap[p] || 0) + (r.adjusted_totals || 0);
    });
    const posSlices = Object.entries(posMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .map((s, i) => ({ ...s, color: POS_PALETTE[i % POS_PALETTE.length] }));

    const svcAgg = {}, payAgg = {};
    activePeriodKeys.forEach(pk => {
      const s = (TOP_DATA.svc || {})[pk] || {};
      for (const n in s) {
        if (!svcAgg[n]) svcAgg[n] = [0, 0];
        svcAgg[n][0] += s[n][0] || 0;
        svcAgg[n][1] += s[n][1] || 0;
      }
      const p = (TOP_DATA.pay || {})[pk] || {};
      for (const g in p) payAgg[g] = (payAgg[g] || 0) + (p[g] || 0);
    });
    const topN = (obj, getVal, n = 5) => Object.entries(obj)
      .map(([k, v]) => ({ k, val: getVal(v) }))
      .filter(x => x.val > 0)
      .sort((a, b) => b.val - a.val)
      .slice(0, n);
    const topServices = topN(svcAgg, v => v[0]);
    const topProducts = topN(svcAgg, v => v[1]);
    const topPayouts = topN(payAgg, v => v);

    const gm = (LOC_GOAL && LOC_GOAL.months) || [];
    const monthLabels = gm.map(m => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(m.slice(5,7),10)-1]);
    const locRows = Object.entries((LOC_GOAL && LOC_GOAL.locations) || {})
      .filter(([name]) => !EXCLUDE_LOCS.has(name))
      .map(([name, d]) => {
        const sa = d.a.reduce((x, v) => x + (v || 0), 0);
        const st = d.t.reduce((x, v) => x + (v || 0), 0);
        return { name, d, ytd: st ? 100 * sa / st : null };
      })
      .sort((a, b) => (b.ytd ?? -1) - (a.ytd ?? -1));

    return { totalBonus, revenue, inclPct, exclPct, uniqueEmps, typeSlices, posSlices, topServices, topProducts, topPayouts, monthLabels, locRows };
  }, [activePeriodKeys]);

  return (
    <div>
      <div className="ov-hero">
        <div className="ov-stat accent">
          <div className="lbl">Total Bonusing</div>
          <div className="big">{fmtMoney(data.totalBonus)}</div>
          <div className="sub">{periodsLabel} · {data.uniqueEmps} employees</div>
        </div>
        <div className="ov-stat">
          <div className="lbl">Total Revenue (Actuals)</div>
          <div className="big">{fmtMoney(data.revenue)}</div>
        </div>
        <div className="ov-stat">
          <div className="lbl">Bonus as % of Revenue</div>
          <div className="big">{data.inclPct.toFixed(2)}%</div>
          <div className="sub">{data.exclPct.toFixed(2)}% excl. Sales Director</div>
        </div>
      </div>

      <div className="ov-charts">
        <PieBlock title="Bonus Breakdown by Type" slices={data.typeSlices} />
        <PieBlock title="Bonus Breakdown by Position" slices={data.posSlices} />
      </div>

      <div className="top-grid">
        <TopTable title="Top 5 Services Performed" nameHead="Service" valHead="Service Count" rows={data.topServices} fmtVal={fmtInt} />
        <TopTable title="Top 5 Products Used" nameHead="Product / Service" valHead="Usage Qty" rows={data.topProducts} fmtVal={fmtInt} />
        <TopTable title="Top 5 FFS Payout Items" nameHead="Service" valHead="Total FFS Payout" rows={data.topPayouts} fmtVal={fmtMoney} />
      </div>

      <div className="chart-card">
        <h3>Performance to Goal by Location · Jan–May 2026 YTD</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="goal-table">
            <thead>
              <tr>
                <th>Location</th>
                {data.monthLabels.map(m => <th key={m} className="num">{m}</th>)}
                <th className="num">YTD</th>
              </tr>
            </thead>
            <tbody>
              {data.locRows.map(r => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  {r.d.t.map((t, i) => {
                    if (r.d.a[i] == null || !t) return <td key={i} className="num">—</td>;
                    const p = 100 * r.d.a[i] / t;
                    return <td key={i} className={`num ${goalClass(p)}`}>{p.toFixed(0)}%</td>;
                  })}
                  <td className={`num ytd ${r.ytd == null ? '' : goalClass(r.ytd)}`}>
                    {r.ytd == null ? '—' : r.ytd.toFixed(0) + '%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
