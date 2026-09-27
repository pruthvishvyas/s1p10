import React from 'react';
import { EmptyState } from './EmptyState';
import { TIER_COLORS } from '../utils/colors';
import { formatROI, formatUSD, formatValue } from '../utils/formatters';

export default function TierMatrix({ tiers }) {
  if (!tiers || tiers.length === 0) return <EmptyState message='No influencer tiers found.' />;

  const getStrategy = (tierName) => {
    if (tierName.includes('Gold')) return { label: 'Priority Partner', bg: 'var(--color-success)', color: '#fff' };
    if (tierName.includes('Silver')) return { label: 'Steady State', bg: 'var(--color-info)', color: '#fff' };
    return { label: 'Test Budget Only', bg: 'var(--color-warning)', color: '#fff' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
      {tiers.map(tier => {
         const style = TIER_COLORS[tier.tier] || { bg: '#888', text: '#fff', icon: '•' };
         const strategy = getStrategy(tier.tier);
         return (
           <div key={tier.tier} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
             <div style={{ background: style.bg, color: style.text, padding: 'var(--space-4)', fontSize: 'var(--text-lg)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
               <span>{style.icon}</span> {tier.tier}
             </div>
             <div style={{ padding: 'var(--space-4)' }}>
               <div style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                 <strong>{tier.influencer_count || 0}</strong> influencers in this tier
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                 <MetricRow label='ROI Ratio' value={formatROI(tier.mean_roi_ratio)} />
                 <MetricRow label='Engagement' value={formatValue(tier.mean_engagement, 'percent')} />
                 <MetricRow label='AQ Score' value={formatValue(tier.mean_aq, 'float')} />
                 <MetricRow label='Cost/Conv' value={formatUSD(tier.mean_cpa)} />
               </div>
               <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
                 <span style={{ background: strategy.bg, color: strategy.color, padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase' }}>
                   {strategy.label}
                 </span>
               </div>
             </div>
           </div>
         );
      })}
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{label}</span>
      <span style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>{value}</span>
    </div>
  );
}