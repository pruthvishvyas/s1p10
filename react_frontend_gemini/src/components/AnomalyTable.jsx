import React, { useState } from 'react';
import { EmptyState } from './EmptyState';

export default function AnomalyTable({ anomalies }) {
  const [sortCol, setSortCol] = useState('Campaign_Cost_USD');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const perPage = 20;

  if (!anomalies || anomalies.length === 0) return <EmptyState message='No anomalies file found. Ensure pipeline has run and export_for_frontend.py was executed.' />;

  const cols = Object.keys(anomalies[0] ?? {});
  const sorted = [...anomalies].sort((a, b) => {
    const valA = a[sortCol];
    const valB = b[sortCol];
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
        {anomalies.length} campaigns flagged as anomalous
      </div>
      <div style={{ overflowX: 'auto', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--color-surface)' }}>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              {cols.map(c => (
                <th key={c} onClick={() => handleSort(c)} style={{ padding: 'var(--space-3)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {c} {sortCol === c ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => {
              const isP1 = row.partnership_priority?.includes('P1');
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', borderLeft: isP1 ? '3px solid #C0392B' : 'none', background: isP1 ? 'rgba(192,57,43,0.04)' : 'transparent' }}>
                  {cols.map(c => <td key={c} style={{ padding: 'var(--space-3)' }}>{row[c]}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)' }}>← Prev</button>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)' }}>Next →</button>
      </div>
    </div>
  );
}