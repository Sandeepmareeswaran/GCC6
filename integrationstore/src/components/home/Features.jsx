import React from 'react';
import styles from './Features.module.css';
import { useLanguage } from '../../context/LanguageContext';

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: '🔗',
      title: 'Unified Integrations',
      desc: 'Connect Jira, Slack, Notion, Gmail all in one place. No more switching between apps.'
    },
    {
      icon: '🤖',
      title: 'AI Chatbot Assistant',
      desc: 'Ask questions, create tasks, search across platforms with natural language in English, Hindi & Tamil.'
    },
    {
      icon: '📊',
      title: 'Sales Analytics',
      desc: 'Track revenue, orders, and category performance with beautiful charts and insights.'
    },
    {
      icon: '📦',
      title: 'Inventory Management',
      desc: 'Manage products across categories with images, status tracking, and detailed views.'
    },
    {
      icon: '📅',
      title: 'Calendar & Events',
      desc: 'Schedule events, drag-drop to reschedule, color-coded categories synced with Firebase.'
    },
    {
      icon: '🌐',
      title: 'Multilingual Support',
      desc: 'Full translation support powered by Groq AI. Switch between English, Hindi, and Tamil.'
    },
  ];

  const stats = [
    { value: '10+', label: 'Integrations' },
    { value: '3', label: 'Languages' },
    { value: 'Real-time', label: 'Firebase Sync' },
    { value: 'AI', label: 'Powered' },
  ];

  return (
    <section className={styles.featuresContainer}>
      {/* Stats Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '48px',
        marginBottom: '48px',
        flexWrap: 'wrap',
        padding: '0 20px',
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'var(--primary, #22c55e)',
              lineHeight: 1,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--content-text-muted, #6b7280)',
              marginTop: '8px',
            }}>
              {t(stat.label)}
            </div>
          </div>
        ))}
      </div>

      {/* Section Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '0 20px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '12px',
          color: 'var(--content-text, #1e1e2d)',
        }}>
          {t('Everything You Need')}
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--content-text-muted, #6b7280)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {t('A complete workspace solution designed for teams that want to work smarter, not harder.')}
        </p>
      </div>

      {/* Features Grid */}
      <div className={styles.grid}>
        {features.map((f, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.iconWrap}>{f.icon}</div>
            <div>
              <div className={styles.cardTitle}>{t(f.title)}</div>
              <div className={styles.cardDesc}>{t(f.desc)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{
        textAlign: 'center',
        marginTop: '48px',
        padding: '40px 20px',
        background: 'var(--sidebar-bg, #1e1e2d)',
        borderRadius: '20px',
        margin: '48px 20px 0',
      }}>
        <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: '600', marginBottom: '12px' }}>
          {t('Ready to get started?')}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
          {t('Join your team in the unified workspace today.')}
        </p>
        <a href="/dashboard" style={{
          display: 'inline-block',
          padding: '14px 40px',
          background: 'var(--primary, #22c55e)',
          color: '#fff',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '15px',
        }}>
          {t('Open Dashboard')} →
        </a>
      </div>
    </section>
  );
};

export default Features;
