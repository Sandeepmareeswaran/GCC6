import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import * as notionService from '../services/notionService';

function NotionPage() {
          const [isConnected, setIsConnected] = useState(false);
          const [loading, setLoading] = useState(false);
          const [initialLoading, setInitialLoading] = useState(true);
          const [error, setError] = useState('');
          const [apiToken, setApiToken] = useState('');
          const [workspaceInfo, setWorkspaceInfo] = useState(null);

          const [databases, setDatabases] = useState([]);
          const [pages, setPages] = useState([]);
          const [selectedItem, setSelectedItem] = useState(null);
          const [itemContent, setItemContent] = useState([]);
          const [databaseItems, setDatabaseItems] = useState([]);
          const [databaseSchema, setDatabaseSchema] = useState(null);
          const [currentView, setCurrentView] = useState('all');
          const [savingItem, setSavingItem] = useState(null);
          const [newTaskName, setNewTaskName] = useState('');

          // Modern light theme matching app
          const styles = {
                    container: { padding: '10px' },
                    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
                    title: { fontSize: '28px', fontWeight: '700', color: '#1e1e2d', margin: 0 },
                    workspaceBadge: { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' },
                    btnDisconnect: { padding: '8px 18px', background: 'transparent', border: '2px solid #ef4444', borderRadius: '10px', color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
                    mainLayout: { display: 'flex', gap: '24px', minHeight: 'calc(100vh - 120px)' },
                    // Sidebar
                    sidebar: { width: '260px', background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', flexShrink: 0 },
                    sidebarTitle: { fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', marginTop: '8px' },
                    sidebarItem: { padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#4b5563', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s' },
                    sidebarItemActive: { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' },
                    sidebarItemHover: { background: '#f3f4f6' },
                    // Content
                    content: { flex: 1, background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', overflow: 'auto' },
                    pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1e1e2d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' },
                    pageSubtitle: { color: '#6b7280', fontSize: '14px', marginBottom: '28px' },
                    // Connection Card
                    connectionCard: { background: '#fff', borderRadius: '20px', padding: '48px', maxWidth: '480px', margin: '60px auto', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb' },
                    cardIcon: { fontSize: '56px', textAlign: 'center', marginBottom: '20px' },
                    cardTitle: { fontSize: '26px', fontWeight: '700', color: '#1e1e2d', marginBottom: '10px', textAlign: 'center' },
                    cardSubtitle: { color: '#6b7280', textAlign: 'center', marginBottom: '32px', fontSize: '15px' },
                    inputGroup: { marginBottom: '20px' },
                    label: { display: 'block', color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
                    input: { width: '100%', padding: '14px 18px', background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '12px', color: '#1e1e2d', fontSize: '15px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
                    inputFocus: { borderColor: '#22c55e' },
                    btnPrimary: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34,197,94,0.4)', transition: 'all 0.2s' },
                    error: { background: '#fef2f2', color: '#dc2626', padding: '14px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontSize: '14px', border: '1px solid #fecaca' },
                    helpSection: { marginTop: '28px', padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' },
                    // Table Styles
                    tableContainer: { borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', background: '#fff' },
                    table: { width: '100%', borderCollapse: 'collapse' },
                    th: { textAlign: 'left', padding: '14px 18px', background: '#f9fafb', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e5e7eb' },
                    td: { padding: '16px 18px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', verticalAlign: 'middle' },
                    tr: { transition: 'background 0.15s' },
                    trHover: { background: '#f9fafb' },
                    // Property Controls
                    select: { background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', color: '#374151', fontSize: '13px', cursor: 'pointer', fontWeight: '500', minWidth: '120px', outline: 'none' },
                    dateInput: { background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', color: '#374151', fontSize: '13px', outline: 'none' },
                    checkbox: { width: '20px', height: '20px', accentColor: '#22c55e', cursor: 'pointer' },
                    // Status Tags
                    statusTag: { display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
                    statusNotStarted: { background: '#f3f4f6', color: '#6b7280' },
                    statusInProgress: { background: '#dbeafe', color: '#2563eb' },
                    statusDone: { background: '#dcfce7', color: '#16a34a' },
                    priorityHigh: { background: '#fef2f2', color: '#dc2626' },
                    priorityMedium: { background: '#fef3c7', color: '#d97706' },
                    priorityLow: { background: '#dbeafe', color: '#2563eb' },
                    // Add Task
                    addTaskRow: { padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' },
                    addTaskInput: { flex: 1, padding: '10px 14px', background: '#fff', border: '2px dashed #d1d5db', borderRadius: '8px', color: '#1e1e2d', fontSize: '14px', outline: 'none' },
                    addTaskBtn: { padding: '10px 20px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '13px', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' },
                    // Cards Grid
                    cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
                    card: { background: '#fff', border: '2px solid #e5e7eb', borderRadius: '14px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
                    cardHover: { borderColor: '#22c55e', boxShadow: '0 8px 24px rgba(34,197,94,0.15)', transform: 'translateY(-2px)' },
                    cardIcon: { fontSize: '32px' },
                    cardTitle: { fontSize: '15px', fontWeight: '600', color: '#1e1e2d', textAlign: 'center' },
                    // Empty State
                    emptyState: { textAlign: 'center', padding: '80px 20px', color: '#6b7280' },
                    emptyIcon: { fontSize: '64px', marginBottom: '20px', opacity: 0.8 },
                    // Buttons
                    btnBack: { padding: '10px 18px', background: '#f3f4f6', border: '2px solid #e5e7eb', borderRadius: '10px', color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '20px', transition: 'all 0.15s' },
                    openLink: { color: '#22c55e', textDecoration: 'none', fontSize: '13px', fontWeight: '600', marginLeft: 'auto' },
                    savingBadge: { marginLeft: '10px', color: '#22c55e', fontSize: '11px', fontWeight: '500' },
          };

          useEffect(() => { loadConnection(); }, []);

          const loadConnection = async () => {
                    let userEmail = localStorage.getItem('userEmail') || 'guest_' + Date.now();
                    localStorage.setItem('userEmail', userEmail);
                    try {
                              const docRef = doc(db, 'GCCNotion', userEmail);
                              const docSnap = await getDoc(docRef);
                              if (docSnap.exists() && docSnap.data().connected) {
                                        const data = docSnap.data();
                                        notionService.saveCredentials(data.apiToken);
                                        setIsConnected(true);
                                        setWorkspaceInfo({ name: data.workspaceName });
                                        loadAllContent();
                              }
                    } catch (err) { console.error('Error:', err); }
                    setInitialLoading(false);
          };

          const loadAllContent = async () => {
                    setLoading(true);
                    const [dbResult, pageResult] = await Promise.all([notionService.searchDatabases(), notionService.searchPages()]);
                    if (dbResult.success) setDatabases(dbResult.databases || []);
                    if (pageResult.success) setPages(pageResult.pages || []);
                    setLoading(false);
          };

          const handleConnect = async (e) => {
                    e.preventDefault();
                    setError('');
                    setLoading(true);
                    const result = await notionService.connect(apiToken);
                    if (result.success) {
                              notionService.saveCredentials(apiToken);
                              setIsConnected(true);
                              setWorkspaceInfo({ name: result.workspace?.name || 'Notion Workspace' });
                              const userEmail = localStorage.getItem('userEmail');
                              await setDoc(doc(db, 'GCCNotion', userEmail), { connected: true, apiToken, workspaceName: result.workspace?.name || 'Workspace', connectedAt: new Date().toISOString() });
                              loadAllContent();
                    } else { setError(result.error || 'Connection failed'); }
                    setLoading(false);
          };

          const handleDisconnect = async () => {
                    notionService.clearCredentials();
                    setIsConnected(false);
                    const userEmail = localStorage.getItem('userEmail');
                    if (userEmail) await setDoc(doc(db, 'GCCNotion', userEmail), { connected: false });
          };

          const handleDatabaseClick = async (database) => {
                    setSelectedItem({ ...database, type: 'database' });
                    setCurrentView('database');
                    setLoading(true);
                    const [schemaResult, itemsResult] = await Promise.all([notionService.getDatabaseSchema(database.id), notionService.queryDatabase(database.id)]);
                    if (schemaResult.success) setDatabaseSchema(schemaResult);
                    if (itemsResult.success) setDatabaseItems(itemsResult.results || []);
                    setLoading(false);
          };

          const handlePageClick = async (page) => {
                    setSelectedItem({ ...page, type: 'page' });
                    setCurrentView('page');
                    setLoading(true);
                    const result = await notionService.getBlockChildren(page.id);
                    if (result.success) setItemContent(result.blocks || []);
                    setLoading(false);
          };

          const handleBackToList = () => { setSelectedItem(null); setCurrentView('all'); setDatabaseItems([]); setDatabaseSchema(null); setItemContent([]); };

          const updateProperty = async (itemId, propName, propType, value) => {
                    setSavingItem(itemId);
                    let properties = {};
                    if (propType === 'status' || propType === 'select') properties[propName] = { [propType]: value ? { name: value } : null };
                    else if (propType === 'multi_select') properties[propName] = { multi_select: value ? [{ name: value }] : [] };
                    else if (propType === 'date') properties[propName] = { date: value ? { start: value } : null };
                    else if (propType === 'checkbox') properties[propName] = { checkbox: value };
                    else if (propType === 'title') properties[propName] = { title: [{ text: { content: value } }] };
                    await notionService.updatePageProperties(itemId, properties);
                    const result = await notionService.queryDatabase(selectedItem.id);
                    if (result.success) setDatabaseItems(result.results || []);
                    setSavingItem(null);
          };

          const addNewTask = async () => {
                    if (!newTaskName.trim() || !selectedItem) return;
                    setSavingItem('new');
                    let titlePropName = 'Name';
                    if (databaseSchema?.schema) { for (const [name, prop] of Object.entries(databaseSchema.schema)) { if (prop.type === 'title') { titlePropName = name; break; } } }
                    await notionService.createDatabaseItem(selectedItem.id, { [titlePropName]: { title: [{ text: { content: newTaskName } }] } });
                    setNewTaskName('');
                    const result = await notionService.queryDatabase(selectedItem.id);
                    if (result.success) setDatabaseItems(result.results || []);
                    setSavingItem(null);
          };

          const getStatusStyle = (s) => { const v = (s || '').toLowerCase(); if (v.includes('done') || v.includes('complete')) return styles.statusDone; if (v.includes('progress')) return styles.statusInProgress; return styles.statusNotStarted; };
          const getPriorityStyle = (p) => { const v = (p || '').toLowerCase(); if (v.includes('high')) return styles.priorityHigh; if (v.includes('medium')) return styles.priorityMedium; return styles.priorityLow; };
          const getPageIcon = (icon) => icon?.type === 'emoji' ? icon.emoji : '📄';

          if (initialLoading) return <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '16px', color: '#6b7280' }}>Loading...</div>;

          // Connection Screen
          if (!isConnected) {
                    return (
                              <div style={styles.container}>
                                        <div style={styles.connectionCard}>
                                                  <div style={{ fontSize: '56px', textAlign: 'center', marginBottom: '20px' }}>📝</div>
                                                  <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1e1e2d', marginBottom: '10px', textAlign: 'center' }}>Connect to Notion</h2>
                                                  <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '32px', fontSize: '15px' }}>Link your workspace to get started</p>
                                                  {error && <div style={styles.error}>{error}</div>}
                                                  <form onSubmit={handleConnect}>
                                                            <div style={styles.inputGroup}>
                                                                      <label style={styles.label}>Integration Token</label>
                                                                      <input type="password" style={styles.input} placeholder="secret_..." value={apiToken} onChange={(e) => setApiToken(e.target.value)} required />
                                                            </div>
                                                            <button type="submit" style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>{loading ? 'Connecting...' : 'Connect to Notion'}</button>
                                                  </form>
                                                  <div style={styles.helpSection}>
                                                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>How to get your token:</p>
                                                            <ol style={{ fontSize: '13px', color: '#6b7280', paddingLeft: '18px', margin: 0 }}>
                                                                      <li style={{ marginBottom: '6px' }}>Visit <a href="https://www.notion.so/my-integrations" target="_blank" rel="noreferrer" style={{ color: '#22c55e', fontWeight: '600' }}>notion.so/my-integrations</a></li>
                                                                      <li style={{ marginBottom: '6px' }}>Create a new integration</li>
                                                                      <li style={{ marginBottom: '6px' }}>Copy the token and share pages with it</li>
                                                            </ol>
                                                  </div>
                                        </div>
                              </div>
                    );
          }

          return (
                    <div style={styles.container}>
                              {/* Header */}
                              <div style={styles.header}>
                                        <h1 style={styles.title}>Notion</h1>
                                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                  <span style={styles.workspaceBadge}>✨ {workspaceInfo?.name || 'Workspace'}</span>
                                                  <button style={styles.btnDisconnect} onClick={handleDisconnect}>Disconnect</button>
                                        </div>
                              </div>

                              <div style={styles.mainLayout}>
                                        {/* Sidebar */}
                                        <div style={styles.sidebar}>
                                                  <div style={styles.sidebarTitle}>Workspace</div>
                                                  <div style={{ ...styles.sidebarItem, ...(currentView === 'all' ? styles.sidebarItemActive : {}) }} onClick={handleBackToList}>🏠 All Content</div>

                                                  {databases.length > 0 && (
                                                            <>
                                                                      <div style={{ ...styles.sidebarTitle, marginTop: '24px' }}>Databases</div>
                                                                      {databases.map(db => (<div key={db.id} style={{ ...styles.sidebarItem, ...(selectedItem?.id === db.id ? styles.sidebarItemActive : {}) }} onClick={() => handleDatabaseClick(db)}>🗄️ {db.title || 'Untitled'}</div>))}
                                                            </>
                                                  )}

                                                  {pages.length > 0 && (
                                                            <>
                                                                      <div style={{ ...styles.sidebarTitle, marginTop: '24px' }}>Pages</div>
                                                                      {pages.map(page => (<div key={page.id} style={{ ...styles.sidebarItem, ...(selectedItem?.id === page.id ? styles.sidebarItemActive : {}) }} onClick={() => handlePageClick(page)}>{getPageIcon(page.icon)} {page.title || 'Untitled'}</div>))}
                                                            </>
                                                  )}
                                        </div>

                                        {/* Content */}
                                        <div style={styles.content}>
                                                  {/* All Content */}
                                                  {currentView === 'all' && (
                                                            <>
                                                                      <h2 style={styles.pageTitle}>📋 All Shared Content</h2>
                                                                      <p style={styles.pageSubtitle}>Select a database or page to view and edit</p>

                                                                      {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}

                                                                      {!loading && databases.length === 0 && pages.length === 0 && (
                                                                                <div style={styles.emptyState}>
                                                                                          <div style={styles.emptyIcon}>📭</div>
                                                                                          <h3 style={{ fontSize: '20px', color: '#374151', marginBottom: '10px' }}>No content found</h3>
                                                                                          <p style={{ marginBottom: '20px' }}>Share databases and pages with your integration in Notion</p>
                                                                                          <button style={{ ...styles.btnPrimary, width: 'auto', padding: '12px 28px' }} onClick={loadAllContent}>🔄 Refresh</button>
                                                                                </div>
                                                                      )}

                                                                      {databases.length > 0 && (
                                                                                <>
                                                                                          <div style={{ ...styles.sidebarTitle, marginBottom: '16px' }}>Databases</div>
                                                                                          <div style={styles.cardsGrid}>
                                                                                                    {databases.map(db => (
                                                                                                              <div key={db.id} style={styles.card} onClick={() => handleDatabaseClick(db)} onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.15)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                                                                                        <span style={{ fontSize: '32px' }}>🗄️</span>
                                                                                                                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e1e2d' }}>{db.title || 'Untitled'}</div>
                                                                                                              </div>
                                                                                                    ))}
                                                                                          </div>
                                                                                </>
                                                                      )}

                                                                      {pages.length > 0 && (
                                                                                <>
                                                                                          <div style={{ ...styles.sidebarTitle, marginTop: '32px', marginBottom: '16px' }}>Pages</div>
                                                                                          <div style={styles.cardsGrid}>
                                                                                                    {pages.map(page => (
                                                                                                              <div key={page.id} style={styles.card} onClick={() => handlePageClick(page)} onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,0.15)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}>
                                                                                                                        <span style={{ fontSize: '32px' }}>{getPageIcon(page.icon)}</span>
                                                                                                                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e1e2d' }}>{page.title || 'Untitled'}</div>
                                                                                                              </div>
                                                                                                    ))}
                                                                                          </div>
                                                                                </>
                                                                      )}
                                                            </>
                                                  )}

                                                  {/* Database View */}
                                                  {currentView === 'database' && selectedItem && (
                                                            <>
                                                                      <button style={styles.btnBack} onClick={handleBackToList}>← Back to All</button>
                                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                                                                                <h2 style={{ ...styles.pageTitle, marginBottom: 0 }}>{databaseSchema?.icon?.emoji || '🗄️'} {databaseSchema?.title || selectedItem.title}</h2>
                                                                                {selectedItem.url && <a href={selectedItem.url} target="_blank" rel="noreferrer" style={styles.openLink}>Open in Notion ↗</a>}
                                                                      </div>

                                                                      {loading ? <p style={{ color: '#6b7280' }}>Loading...</p> : (
                                                                                <div style={styles.tableContainer}>
                                                                                          <table style={styles.table}>
                                                                                                    <thead>
                                                                                                              <tr>
                                                                                                                        <th style={styles.th}>Task Name</th>
                                                                                                                        {databaseSchema?.schema && Object.entries(databaseSchema.schema).filter(([, p]) => p.type !== 'title' && ['status', 'select', 'multi_select', 'date', 'checkbox'].includes(p.type)).slice(0, 5).map(([name]) => <th key={name} style={styles.th}>{name}</th>)}
                                                                                                              </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                              {databaseItems.map(item => (
                                                                                                                        <tr key={item.id} style={styles.tr} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                                                                                                                  <td style={styles.td}>
                                                                                                                                            <strong style={{ color: '#1e1e2d' }}>{item.title || 'Untitled'}</strong>
                                                                                                                                            {savingItem === item.id && <span style={styles.savingBadge}>✓ Saving...</span>}
                                                                                                                                  </td>
                                                                                                                                  {databaseSchema?.schema && Object.entries(databaseSchema.schema).filter(([, p]) => p.type !== 'title' && ['status', 'select', 'multi_select', 'date', 'checkbox'].includes(p.type)).slice(0, 5).map(([name, prop]) => (
                                                                                                                                            <td key={name} style={styles.td}>
                                                                                                                                                      {(prop.type === 'status' || prop.type === 'select') && (
                                                                                                                                                                <select style={{ ...styles.select, ...getStatusStyle(item.properties?.[name]) }} value={item.properties?.[name] || ''} onChange={e => updateProperty(item.id, name, prop.type, e.target.value)}>
                                                                                                                                                                          <option value="">--</option>
                                                                                                                                                                          {prop.options?.map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
                                                                                                                                                                </select>
                                                                                                                                                      )}
                                                                                                                                                      {prop.type === 'multi_select' && (
                                                                                                                                                                <select style={styles.select} value={item.properties?.[name]?.split(',')[0]?.trim() || ''} onChange={e => updateProperty(item.id, name, 'multi_select', e.target.value)}>
                                                                                                                                                                          <option value="">--</option>
                                                                                                                                                                          {prop.options?.map(opt => <option key={opt.name} value={opt.name}>{opt.name}</option>)}
                                                                                                                                                                </select>
                                                                                                                                                      )}
                                                                                                                                                      {prop.type === 'date' && <input type="date" style={styles.dateInput} value={item.properties?.[name] || ''} onChange={e => updateProperty(item.id, name, 'date', e.target.value)} />}
                                                                                                                                                      {prop.type === 'checkbox' && <input type="checkbox" style={styles.checkbox} checked={item.properties?.[name] === 'Yes'} onChange={e => updateProperty(item.id, name, 'checkbox', e.target.checked)} />}
                                                                                                                                            </td>
                                                                                                                                  ))}
                                                                                                                        </tr>
                                                                                                              ))}
                                                                                                    </tbody>
                                                                                          </table>
                                                                                          <div style={styles.addTaskRow}>
                                                                                                    <span style={{ fontSize: '18px' }}>➕</span>
                                                                                                    <input type="text" style={styles.addTaskInput} placeholder="Add new task..." value={newTaskName} onChange={e => setNewTaskName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNewTask()} />
                                                                                                    <button style={styles.addTaskBtn} onClick={addNewTask} disabled={savingItem === 'new'}>{savingItem === 'new' ? 'Adding...' : 'Add Task'}</button>
                                                                                          </div>
                                                                                </div>
                                                                      )}
                                                            </>
                                                  )}

                                                  {/* Page View */}
                                                  {currentView === 'page' && selectedItem && (
                                                            <>
                                                                      <button style={styles.btnBack} onClick={handleBackToList}>← Back to All</button>
                                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                                                                                <h2 style={{ ...styles.pageTitle, marginBottom: 0 }}>{getPageIcon(selectedItem.icon)} {selectedItem.title || 'Untitled'}</h2>
                                                                                {selectedItem.url && <a href={selectedItem.url} target="_blank" rel="noreferrer" style={styles.openLink}>Open in Notion ↗</a>}
                                                                      </div>
                                                                      {loading ? <p style={{ color: '#6b7280' }}>Loading...</p> : (
                                                                                <div style={{ color: '#374151', lineHeight: 1.8, fontSize: '15px' }}>
                                                                                          {itemContent.map(block => {
                                                                                                    const type = block.type;
                                                                                                    const text = block[type]?.rich_text?.map(t => t.plain_text).join('') || '';
                                                                                                    if (type === 'paragraph') return <p key={block.id} style={{ marginBottom: '12px' }}>{text || <span style={{ color: '#9ca3af' }}>Empty</span>}</p>;
                                                                                                    if (type === 'heading_1') return <h1 key={block.id} style={{ fontSize: '24px', fontWeight: '700', marginTop: '28px', color: '#1e1e2d' }}>{text}</h1>;
                                                                                                    if (type === 'heading_2') return <h2 key={block.id} style={{ fontSize: '20px', fontWeight: '600', marginTop: '24px', color: '#1e1e2d' }}>{text}</h2>;
                                                                                                    if (type === 'heading_3') return <h3 key={block.id} style={{ fontSize: '16px', fontWeight: '600', marginTop: '20px', color: '#374151' }}>{text}</h3>;
                                                                                                    if (type === 'to_do') return (<div key={block.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}><input type="checkbox" checked={block.to_do?.checked} readOnly style={styles.checkbox} /><span style={{ textDecoration: block.to_do?.checked ? 'line-through' : 'none', color: block.to_do?.checked ? '#9ca3af' : '#374151' }}>{text}</span></div>);
                                                                                                    if (type === 'bulleted_list_item') return <li key={block.id} style={{ marginLeft: '24px', marginBottom: '6px' }}>{text}</li>;
                                                                                                    if (type === 'divider') return <hr key={block.id} style={{ border: 'none', borderTop: '2px solid #e5e7eb', margin: '24px 0' }} />;
                                                                                                    if (type === 'child_database') return (<div key={block.id} style={{ ...styles.card, flexDirection: 'row', padding: '16px', gap: '12px' }} onClick={() => handleDatabaseClick({ id: block.id, title: block.child_database?.title })}>🗄️ <span style={{ fontWeight: '600' }}>{block.child_database?.title || 'Database'}</span></div>);
                                                                                                    return null;
                                                                                          })}
                                                                                </div>
                                                                      )}
                                                            </>
                                                  )}
                                        </div>
                              </div>
                    </div>
          );
}

export default NotionPage;