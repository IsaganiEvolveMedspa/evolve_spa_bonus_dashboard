import React, { useState, useMemo } from 'react';
import { SCHEDULE } from '../utils/data';
import { fmtMoney } from '../utils/formatters';

export default function ScheduleTab() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('__ALL__');

  const categories = useMemo(() => {
    const cats = [...new Set(SCHEDULE.items.map(i => i.category))].sort();
    return cats;
  }, []);

  const items = useMemo(() => {
    let filtered = SCHEDULE.items.slice();
    if (catFilter !== '__ALL__') filtered = filtered.filter(i => i.category === catFilter);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.service.toLowerCase().includes(s) || i.category.toLowerCase().includes(s)
      );
    }
    filtered.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.service.localeCompare(b.service);
    });
    return filtered;
  }, [search, catFilter]);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Current Fee For Service Schedule</h2>
        <div className="meta">Last updated: {SCHEDULE.last_updated} · {SCHEDULE.items.length} services</div>
      </div>

      {SCHEDULE.notes && SCHEDULE.notes.length > 0 && (
        <div className="notes">
          <strong>Notes:</strong>
          <ul>
            {SCHEDULE.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}

      <div className="schedule-search">
        <input
          type="text"
          placeholder="Search service name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="__ALL__">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="empty">No services match your filters.</div>
      ) : (
        <div className="table-wrap">
          <table className="t-schedule">
            <thead>
              <tr>
                <th>Category</th>
                <th>Service Name</th>
                <th className="num">Fee for Service ($)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td><span className="cat-pill">{item.category}</span></td>
                  <td>{item.service}</td>
                  <td className="num">{fmtMoney(item.fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
