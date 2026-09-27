export function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const SEVERITY_COLORS = {
  HIGH:   { bg: '#C0392B', text: '#fff' },
  MEDIUM: { bg: '#E67E22', text: '#fff' },
  LOW:    { bg: '#27AE60', text: '#fff' },
};

export const TIER_COLORS = {
  'Gold Tier':   { bg: '#F1C40F', text: '#1A1530', icon: '🥇' },
  'Silver Tier': { bg: '#95A5A6', text: '#fff',    icon: '🥈' },
  'Bronze Tier': { bg: '#CD7F32', text: '#fff',    icon: '🥉' },
};

export const PRIORITY_COLORS = {
  'P1_STRATEGIC_PARTNER': { bg: '#27AE60', text: '#fff', label: 'P1 Strategic' },
  'P2_RECOMMENDED':       { bg: '#2980B9', text: '#fff', label: 'P2 Recommended' },
  'P3_MONITOR':           { bg: '#7F8C8D', text: '#fff', label: 'P3 Monitor' },
  'P4_REVIEW_REQUIRED':   { bg: '#E67E22', text: '#fff', label: 'P4 Review' },
  'P5_DO_NOT_REBOOK':     { bg: '#C0392B', text: '#fff', label: 'P5 Do Not Rebook' },
};

export const CATEGORY_BADGE = { bg: '#2C3E50', text: '#fff' };

export function getChartColors() {
  const primary = getCSSVar('--color-primary') || '#6C3FC8';
  const accent  = getCSSVar('--color-accent')  || '#FF6B35';
  return {
    primary,
    accent,
    palette: [primary, accent, '#27AE60', '#2980B9', '#E67E22', '#95A5A6', '#F1C40F', '#CD7F32'],
  };
}