import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

function Dashboard() {
          const [username, setUsername] = useState('User');
          const { currentTheme } = useTheme();
          const { t } = useLanguage();

          useEffect(() => {
                    const storedUsername = localStorage.getItem('username');
                    if (storedUsername) {
                              setUsername(storedUsername);
                    }
          }, []);

          const styles = {
                    container: { padding: '10px' },
                    header: { marginBottom: '30px' },
                    greeting: { fontSize: '28px', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '5px' },
                    subtitle: { fontSize: '14px', color: currentTheme.textSecondary },
                    sectionTitle: { fontSize: '20px', fontWeight: '700', color: currentTheme.textPrimary, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
                    componentsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' },
                    componentCard: { background: currentTheme.bgCard, borderRadius: '16px', padding: '24px', boxShadow: currentTheme.shadow, border: `1px solid ${currentTheme.borderColor}`, transition: 'all 0.2s ease', cursor: 'pointer', textDecoration: 'none', display: 'block' },
                    cardHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' },
                    cardIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
                    cardTitle: { fontSize: '18px', fontWeight: '600', color: currentTheme.textPrimary, marginBottom: '4px' },
                    cardSubtitle: { fontSize: '13px', color: currentTheme.textSecondary },
                    cardDescription: { fontSize: '14px', color: currentTheme.textSecondary, lineHeight: '1.5', marginBottom: '16px' },
                    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                    badge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
                    openBtn: { padding: '8px 16px', background: currentTheme.accent, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
                    statsSection: { marginBottom: '40px' },
                    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
                    statCard: { background: currentTheme.bgCard, borderRadius: '14px', padding: '20px', boxShadow: currentTheme.shadow, border: `1px solid ${currentTheme.borderColor}` },
                    statValue: { fontSize: '28px', fontWeight: '700', marginBottom: '4px' },
                    statLabel: { fontSize: '13px', color: currentTheme.textSecondary },
          };

          const components = [
                    { id: 'home', path: '/', name: 'Home', icon: '🏠', iconBg: currentTheme.name === 'dark' ? '#1e3a5f' : '#dbeafe', description: 'Your personalized landing page with quick access to all features.', status: 'Active' },
                    { id: 'dashboard', path: '/dashboard', name: 'Dashboard', icon: '📊', iconBg: currentTheme.name === 'dark' ? '#3b1d4a' : '#f3e8ff', description: 'Overview of all integrations, analytics, and key metrics.', status: 'Current' },
                    { id: 'mail', path: '/mail', name: 'Mail', icon: '📧', iconBg: currentTheme.name === 'dark' ? '#4a3b1d' : '#fef3c7', description: 'Manage emails, compose messages, and track communications.', status: 'Active' },
                    { id: 'jira', path: '/jira', name: 'Jira', icon: '🔵', iconBg: currentTheme.name === 'dark' ? '#1e3a5f' : '#dbeafe', description: 'Track issues, manage sprints, and collaborate with your team.', status: 'Connected' },
                    { id: 'notion', path: '/notion', name: 'Notion', icon: '📝', iconBg: currentTheme.name === 'dark' ? '#2d2d3d' : '#f3f4f6', description: 'Access databases, pages, and organize your workspace.', status: 'Connected' },
                    { id: 'slack', path: '/slack', name: 'Slack', icon: '💬', iconBg: currentTheme.name === 'dark' ? '#4a3b1d' : '#fef3c7', description: 'Send messages, manage channels, and team communication.', status: 'Connected' },
                    { id: 'sales', path: '/sales', name: 'Sales', icon: '💰', iconBg: currentTheme.accentLight, description: 'Track sales performance, revenue, and customer analytics.', status: 'Active' },
                    { id: 'inventory', path: '/inventory', name: 'Inventory', icon: '📦', iconBg: currentTheme.name === 'dark' ? '#4a3b1d' : '#fef3c7', description: 'Manage stock levels, products, and warehouse operations.', status: 'Active' },
                    { id: 'todo', path: '/todo', name: 'ToDo', icon: '✅', iconBg: currentTheme.accentLight, description: 'Create, organize, and track your tasks and projects.', status: 'Active' },
                    { id: 'notes', path: '/notes', name: 'Notes', icon: '📄', iconBg: currentTheme.name === 'dark' ? '#3b1d4a' : '#f3e8ff', description: 'Take notes, save ideas, and organize your thoughts.', status: 'Active' },
          ];

          const quickStats = [
                    { label: 'Total Integrations', value: '10', color: currentTheme.accent },
                    { label: 'Connected APIs', value: '3', color: currentTheme.info },
                    { label: 'Active Features', value: '10', color: currentTheme.warning },
                    { label: 'Tasks Today', value: '5', color: '#8b5cf6' },
          ];

          return (
                    <div style={styles.container}>
                              <div style={styles.header}>
                                        <h1 style={styles.greeting}>{t('Hello')}, {username}! 👋</h1>
                                        <p style={styles.subtitle}>
                                                  {t('Welcome to your Integration Store dashboard. Access all your tools from one place.')}
                                        </p>
                              </div>

                              <div style={styles.statsSection}>
                                        <div style={styles.statsGrid}>
                                                  {quickStats.map((stat, index) => (
                                                            <div key={index} style={styles.statCard}>
                                                                      <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
                                                                      <div style={styles.statLabel}>{t(stat.label)}</div>
                                                            </div>
                                                  ))}
                                        </div>
                              </div>

                              <div>
                                        <h2 style={styles.sectionTitle}>
                                                  <span>🧩</span> {t('All Components')}
                                        </h2>
                                        <div style={styles.componentsGrid}>
                                                  {components.map((comp) => (
                                                            <Link
                                                                      key={comp.id}
                                                                      to={comp.path}
                                                                      style={styles.componentCard}
                                                                      onMouseEnter={(e) => {
                                                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                                                e.currentTarget.style.boxShadow = currentTheme.shadowHover;
                                                                                e.currentTarget.style.borderColor = currentTheme.accent;
                                                                      }}
                                                                      onMouseLeave={(e) => {
                                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                                e.currentTarget.style.boxShadow = currentTheme.shadow;
                                                                                e.currentTarget.style.borderColor = currentTheme.borderColor;
                                                                      }}
                                                            >
                                                                      <div style={styles.cardHeader}>
                                                                                <div style={{ ...styles.cardIcon, background: comp.iconBg }}>{comp.icon}</div>
                                                                                <div>
                                                                                          <div style={styles.cardTitle}>{t(comp.name)}</div>
                                                                                          <div style={styles.cardSubtitle}>{t('Integration')}</div>
                                                                                </div>
                                                                      </div>
                                                                      <div style={styles.cardDescription}>{t(comp.description)}</div>
                                                                      <div style={styles.cardFooter}>
                                                                                <span style={{ ...styles.badge, background: currentTheme.accentLight, color: currentTheme.accent }}>
                                                                                          {t(comp.status)}
                                                                                </span>
                                                                                <span style={styles.openBtn}>{t('Open')} →</span>
                                                                      </div>
                                                            </Link>
                                                  ))}
                                        </div>
                              </div>
                    </div>
          );
}

export default Dashboard;