import React from 'react';
import { EmptyState } from './EmptyState';
import { formatROI, formatValue } from '../utils/formatters';

const KPI_MAP = {
  high_roi_rate: { label: 'High ROI Rate', icon: '🎯', format: 'percent' },
  mean_roi_ratio: { label: 'Mean ROI Ratio', icon: '📈', format: 'roi' },
  total_campaigns: { label: 'Campaigns Analysed', icon: '📋', format: 'number' },
  total_revenue_usd: { label: 'Total Revenue', icon: '💰', format: 'currency' },
  median_campaign_cost_usd: { label: 'Median Campaign Cost', icon: '💸', format: 'currency' },
  gold_tier_count: { label: 'Gold Tier Partners', icon: '🥇', format: 'number' },
  p1_partner_count: { label: 'P1 Strategic Partners', icon: '⭐', format: 'number' },
  anomaly_count: { label: 'Anomalous Campaigns', icon: '⚠️', format: 'number' },
  mean_audience_quality_score: { label: 'Audience Quality Index', icon: '👥', format: 'float' }
};

export default function KPICards({ data }) {
  if (!data || Object.keys(data).length === 0) return <EmptyState message='No KPI data found.' />;
  
  return (
    <div className='kpi-grid'>
      {Object.entries(data).map(([key, val]) => {
        const spec = KPI_MAP[key];
        if (!spec) return null;
        let displayValue = spec.format === 'roi' ? formatROI(val) : formatValue(val, spec.format);
        let colorStyle = { color: 'var(--color-text-primary)' };
        let badgeStyle = {};
        if (key === 'high_roi_rate') {
          if (val >= 50) colorStyle.color = 'var(--color-success)';
          else if (val < 30) colorStyle.color = 'var(--color-danger)';
        }
        if (key === 'mean_roi_ratio') {
          if (val >= 3.0) colorStyle.color = 'var(--color-success)';
          else if (val < 1.5) colorStyle.color = 'var(--color-danger)';
        }
        if (key === 'anomaly_count' && val > 0) badgeStyle = { background: 'var(--color-warning)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-pill)' };
        if (key === 'gold_tier_count' && val > 0) badgeStyle = { background: 'var(--color-gold)', color: '#1A1530', padding: '2px 8px', borderRadius: 'var(--radius-pill)' };

        return (
          <div key={key} className='kpi-card'>
            <div className='kpi-card-header'>
              <span>{spec.icon}</span> <span>{spec.label}</span>
            </div>
            <div className='kpi-card-value' style={colorStyle}>
              <span style={badgeStyle}>{displayValue}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}