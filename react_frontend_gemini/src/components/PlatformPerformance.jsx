import React, { useState } from 'react';
import { EmptyState } from './EmptyState';
import { formatROI, formatUSD, formatValue } from '../utils/formatters';

export default function PlatformPerformance({ platforms }) {
  if (!platforms || platforms.length === 0) return <EmptyState message='No platform data found.' />;
  
  const sorted = [...platforms].sort((a, b) => (b.mean_roi_ratio || 0) - (a.mean_roi_ratio || 0));
  const bestPlatform = sorted[0]?.Platform;

  return (
    <div style={{ overflowX: 'auto', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Platform</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Campaigns</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>High ROI Rate</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Mean ROI Ratio</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Mean Cost</th>
            <th style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Mean Revenue</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => {
             const isBest = p.Platform === bestPlatform;
             let rateColor = 'var(--color-text-primary)';
             if (p.high_roi_rate >= 50) rateColor = 'var(--color-success)';
             else if (p.high_roi_rate >= 30) rateColor = 'var(--color-warning)';
             else rateColor = 'var(--color-danger)';
             
             return (
               <tr key={p.Platform} style={{ borderBottom: '1px solid var(--color-border)', borderLeft: isBest ? '3px solid var(--color-success)' : '3px solid transparent', background: isBest ? 'rgba(39,174,96,0.04)' : 'transparent' }}>
                 <td style={{ padding: 'var(--space-4)', fontWeight: 600 }}>{p.Platform} {isBest && '🏆'}</td>
                 <td style={{ padding: 'var(--space-4)' }}>{p.campaign_count}</td>
                 <td style={{ padding: 'var(--space-4)', color: rateColor, fontWeight: 600 }}>{formatValue(p.high_roi_rate, 'percent')}</td>
                 <td style={{ padding: 'var(--space-4)', fontWeight: 700 }}>{formatROI(p.mean_roi_ratio)}</td>
                 <td style={{ padding: 'var(--space-4)' }}>{formatUSD(p.mean_cost)}</td>
                 <td style={{ padding: 'var(--space-4)' }}>{formatUSD(p.mean_revenue)}</td>
               </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
}