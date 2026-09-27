import React, { useState } from 'react';
import { EmptyState } from './EmptyState';
import { SEVERITY_COLORS, CATEGORY_BADGE } from '../utils/colors';

const CATEGORY_LABELS = {
  CAMPAIGN_ROI_PREVALENCE: '📊 ROI Prevalence',
  BEST_PLATFORM: '📡 Best Platform',
  BEST_NICHE: '🎯 Best Niche',
  MICRO_VS_MEGA: '👥 Micro vs Mega',
  ENGAGEMENT_ROI_CORRELATION: '📈 Engagement Signal',
  COST_EFFICIENCY_FINDING: '💰 Cost Efficiency',
  TOP_PLATFORM_NICHE_COMBO: '🔥 Top Combo',
  ANOMALY_PROFILE: '⚠️ Anomaly Profile',
  GOLD_TIER_PROFILE: '🥇 Gold Tier Profile',
  MODEL_PERFORMANCE: '🤖 Model Performance',
};

export default function InsightCards({ insights }) {
  const [filter, setFilter] = useState('ALL');
  if (!insights || insights.length === 0) return <EmptyState message='No insights generated yet.' />;

  const severityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sorted = [...insights].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  const filtered = filter === 'ALL' ? sorted : sorted.filter(i => i.severity === filter);

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '4px 16px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-sm)', fontWeight: 600,
            background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
            color: filter === f ? '#fff' : 'var(--color-text-secondary)',
            border: `1px solid ${filter === f ? 'var(--color-primary)' : 'var(--color-border)'}`
          }}>{f}</button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState message={`No ${filter} severity insights.`} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map((insight, idx) => (
            <div key={idx} style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
                <span style={{ background: SEVERITY_COLORS[insight.severity]?.bg ?? '#888', color: '#fff', borderRadius: 'var(--radius-pill)', padding: '2px 12px', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                  {insight.severity}
                </span>
                <span style={{ background: CATEGORY_BADGE.bg, color: CATEGORY_BADGE.text, borderRadius: 'var(--radius-pill)', padding: '2px 10px', fontSize: 'var(--text-xs)' }}>
                  {CATEGORY_LABELS[insight.category] || insight.category}
                </span>
              </div>
              <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>{insight.finding}</h4>
              <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: 'var(--space-3)', marginBottom: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                <strong>Evidence:</strong> {insight.evidence}
              </div>
              <div style={{ borderLeft: '3px solid var(--color-success)', paddingLeft: 'var(--space-3)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                <strong>Action:</strong> {insight.action}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}