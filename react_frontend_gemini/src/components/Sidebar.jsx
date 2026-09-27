import React from 'react';

const TABS = ['ROI Overview', 'Platform Analysis', 'Influencer Tiers', 'Campaign Insights', 'ROI Forecaster', 'Anomalies'];
const ICONS = ['📊', '📡', '🏆', '💡', '🎯', '⚠️'];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className='sidebar'>
      <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: '1.5rem' }}>🎯</span>
        <div className='brand-text'>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-primary)' }}>Influencer ROI</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marketing Analytics</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: 'var(--space-4) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {TABS.map((tab, i) => {
          const isActive = activeTab === i;
          return (
            <button key={tab} onClick={() => setActiveTab(i)} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-6)',
              background: isActive ? 'rgba(108,63,200,0.08)' : 'transparent',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
              textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: isActive ? 600 : 500,
              transition: 'all 0.2s ease'
            }}>
              <span className='icon' style={{ fontSize: '1.25rem' }}>{ICONS[i]}</span>
              <span className='label'>{tab}</span>
            </button>
          );
        })}
      </nav>
      <div className='source-pill' style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: '#F1F2F6', color: '#4A4565', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
          Source: CSV
        </span>
      </div>
    </div>
  );
}