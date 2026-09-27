export function EmptyState({ message = 'Run the pipeline first.', icon = '📊' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 'var(--space-16)',
      color: 'var(--color-text-muted)', textAlign: 'center', gap: 'var(--space-4)',
    }}>
      <span style={{ fontSize: '2.5rem' }}>{icon}</span>
      <p style={{ fontSize: 'var(--text-base)', maxWidth: '320px', lineHeight: 1.6, margin: 0 }}>
        {message}
      </p>
    </div>
  );
}