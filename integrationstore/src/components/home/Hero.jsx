import React from 'react';
import styles from './Hero.module.css';
import { useLanguage } from '../../context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();

  // Integration icons
  const integrations = [
    { name: 'Jira', icon: '📋', color: '#0052CC' },
    { name: 'Slack', icon: '💬', color: '#4A154B' },
    { name: 'Notion', icon: '📓', color: '#000000' },
    { name: 'Gmail', icon: '📧', color: '#EA4335' },
    { name: 'ToDo', icon: '✅', color: '#22c55e' },
    { name: 'Notes', icon: '📝', color: '#f97316' },
    { name: 'Calendar', icon: '📅', color: '#3b82f6' },
    { name: 'Inventory', icon: '📦', color: '#8b5cf6' },
    { name: 'Sales', icon: '💰', color: '#10b981' },
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.eyebrow}>🚀 {t('IntegrationStore')} · {t('All-in-One Workspace')}</div>
        <h1 className={styles.title}>
          {t('Your Unified Workspace for')} <span style={{ color: 'var(--primary, #22c55e)' }}>{t('Everything')}</span>
        </h1>
        <p className={styles.subtitle}>
          {t('Connect Jira, Slack, Notion, Gmail, and more in one powerful platform. Manage tasks, notes, calendar, inventory, and sales analytics with AI-powered chatbot assistance and multilingual support.')}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
          <a href="/dashboard" style={{
            padding: '14px 32px',
            background: 'var(--sidebar-bg, #1e1e2d)',
            color: '#fff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'transform 0.2s',
          }}>
            {t('Get Started')} →
          </a>
          <a href="/todo" style={{
            padding: '14px 32px',
            background: 'transparent',
            color: 'var(--content-text, #1e1e2d)',
            border: '2px solid var(--border-color, #e5e7eb)',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
          }}>
            {t('View Features')}
          </a>
        </div>
      </div>

      {/* Integration Icons Showcase */}
      <div className={styles.visual}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          padding: '24px'
        }}>
          {integrations.map((int, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              transition: 'transform 0.2s',
              cursor: 'default',
            }}>
              <span style={{ fontSize: '28px' }}>{int.icon}</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{t(int.name)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
