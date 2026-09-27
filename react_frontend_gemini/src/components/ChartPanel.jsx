import React, { useRef, useEffect } from 'react';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import { EmptyState } from './EmptyState';
import { getChartColors } from '../utils/colors';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1A1530', titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.8)', padding: 12, cornerRadius: 8 } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' } } }
};

function HeatmapTable({ chart }) {
  const data = chart.data || [];
  if (data.length === 0) return <EmptyState message='No heatmap data available.' />;
  const keys = Object.keys(data[0] || {});
  return (
    <div style={{ width: '100%', overflowX: 'auto', maxHeight: '440px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr>{keys.map(k => <th key={k} style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>{k}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
              {keys.map(k => {
                 const val = row[k];
                 let bg = 'transparent';
                 if (typeof val === 'number') {
                   const alpha = Math.max(0.05, Math.min(0.8, val / 10)); // simple interpolation logic
                   bg = `rgba(108,63,200,${alpha})`;
                 }
                 return <td key={k} style={{ padding: '12px 8px', background: bg }}>{typeof val === 'number' ? val.toFixed(2) : val}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartWrapper({ chart }) {
  const chartRef = useRef(null);
  useEffect(() => { return () => { if (chartRef.current) chartRef.current.destroy(); }; }, []);
  if (!chart.data || chart.data.length === 0) return <EmptyState message='No data for this chart' />;

  const colors = getChartColors();
  let ChartComponent = null;
  let formattedData = chart.data;
  
  if (['bar', 'histogram'].includes(chart.type)) {
    ChartComponent = Bar;
    if (!formattedData.datasets) formattedData = { labels: chart.data.map(d=>d.label), datasets: [{ data: chart.data.map(d=>d.value), backgroundColor: colors.primary }] };
  } else if (chart.type === 'line') {
    ChartComponent = Line;
    if (!formattedData.datasets) formattedData = { labels: chart.data.map(d=>d.label), datasets: [{ data: chart.data.map(d=>d.value), borderColor: colors.primary, tension: 0.4, fill: true, backgroundColor: 'rgba(108,63,200,0.08)' }] };
  } else if (chart.type === 'scatter') {
    ChartComponent = Scatter;
    if (!formattedData.datasets) formattedData = { datasets: [{ data: chart.data, backgroundColor: colors.accent, pointRadius: 4 }] };
  } else if (chart.type === 'heatmap') {
    return <HeatmapTable chart={chart} />;
  }

  return (
    <div style={{ position: 'relative', height: '380px', width: '100%', minHeight: '340px', maxHeight: '440px', background: 'var(--color-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
      <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>{chart.title}</h3>
      {ChartComponent && <div style={{ height: 'calc(100% - 40px)' }}><ChartComponent ref={chartRef} options={chartOptions} data={formattedData} /></div>}
    </div>
  );
}

export default function ChartPanel({ charts }) {
  if (!charts || charts.length === 0) return <EmptyState message='No chart specs found.' />;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>{charts.map(c => <ChartWrapper key={c.id || Math.random()} chart={c} />)}</div>;
}