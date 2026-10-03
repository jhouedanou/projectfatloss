import React from 'react';

/** Ligne de réglage on/off (options vélo de la page séance, mode immersif…). */
export default function SettingToggle({ icon, title, subtitle, checked, onToggle, ariaLabel }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '14px 16px',
      margin: '0 0 12px 0',
      borderRadius: 'var(--r-card)',
      background: 'var(--surface)',
      border: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {icon}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
            {title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, rgba(235,235,245,0.6))' }}>
            {subtitle}
          </div>
        </div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        style={{
          position: 'relative',
          width: '48px',
          height: '28px',
          flexShrink: 0,
          borderRadius: '100px',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          background: checked ? 'var(--ok)' : 'var(--surface-3)',
          transition: 'background 0.25s ease',
        }}
      >
        <span style={{
          position: 'absolute',
          top: '3px',
          left: checked ? '23px' : '3px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        }} />
      </button>
    </div>
  );
}
