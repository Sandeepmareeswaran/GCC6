import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import * as jiraService from '../services/jiraService';
import { useLanguage } from '../context/LanguageContext';
import { DynamicText } from '../components/TranslatedText';

// Issue type icons
const issueTypeIcons = {
          Task: '☑️', Bug: '🐛', Story: '📖', Epic: '⚡', Feature: '✨', Subtask: '📎',
};

// Priority colors and icons
const priorityConfig = {
          Highest: { color: '#ef4444', icon: '▲▲', bg: '#fef2f2' },
          High: { color: '#f97316', icon: '▲', bg: '#fff7ed' },
          Medium: { color: '#eab308', icon: '=', bg: '#fefce8' },
          Low: { color: '#3b82f6', icon: '▼', bg: '#eff6ff' },
          Lowest: { color: '#6b7280', icon: '▼▼', bg: '#f9fafb' },
};

// Status badge colors
const statusColors = {
          done: { bg: '#dcfce7', text: '#16a34a' },
          indeterminate: { bg: '#dbeafe', text: '#2563eb' },
          new: { bg: '#f3f4f6', text: '#374151' },
};

function JiraPage() {
          const [isConnected, setIsConnected] = useState(false);
          const [loading, setLoading] = useState(false);
          const [error, setError] = useState('');
          const [jiraUser, setJiraUser] = useState(null);
          const [credentials, setCredentials] = useState({ email: '', domain: '', apiToken: '' });
          const [projects, setProjects] = useState([]);
          const [selectedProject, setSelectedProject] = useState('');
          const [issues, setIssues] = useState([]);
          const [statuses, setStatuses] = useState([]);
          const [issueTypes, setIssueTypes] = useState([]);
          const [showCreateModal, setShowCreateModal] = useState(false);
          const [newIssue, setNewIssue] = useState({ summary: '', description: '', issueType: '' });
          const [viewMode, setViewMode] = useState('board');
          const [searchQuery, setSearchQuery] = useState('');

          // Drag and drop state
          const [draggedIssue, setDraggedIssue] = useState(null);
          const [dragOverColumn, setDragOverColumn] = useState(null);
          const [transitioning, setTransitioning] = useState(null);

          // Issue detail modal state
          const [selectedIssue, setSelectedIssue] = useState(null);
          const [issueDetail, setIssueDetail] = useState(null);
          const [loadingDetail, setLoadingDetail] = useState(false);
          const [isEditing, setIsEditing] = useState(false);
          const [editForm, setEditForm] = useState({ summary: '', description: '', dueDate: '', assignee: '', priority: '' });

          // Available options for editing
          const [availableUsers, setAvailableUsers] = useState([]);
          const [availablePriorities, setAvailablePriorities] = useState([]);
          const [availableTransitions, setAvailableTransitions] = useState([]);
          const { t } = useLanguage();

          const styles = {
                    container: { padding: '10px' },
                    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
                    title: { fontSize: '28px', fontWeight: '700', color: '#1e1e2d' },
                    toolbar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
                    searchBox: { display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px', gap: '8px' },
                    searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '200px', background: 'transparent' },
                    viewToggle: { display: 'flex', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden' },
                    viewBtn: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
                    viewBtnActive: { background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
                    connectionCard: { background: '#fff', borderRadius: '16px', padding: '40px', maxWidth: '450px', margin: '50px auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
                    cardTitle: { fontSize: '24px', fontWeight: '700', color: '#1e1e2d', marginBottom: '8px', textAlign: 'center' },
                    cardSubtitle: { color: '#6b7280', textAlign: 'center', marginBottom: '30px', fontSize: '14px' },
                    inputGroup: { marginBottom: '20px' },
                    label: { display: 'block', color: '#374151', fontSize: '14px', fontWeight: '500', marginBottom: '8px' },
                    input: { width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', color: '#1e1e2d', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
                    button: { width: '100%', padding: '14px', background: '#22c55e', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
                    error: { color: '#ef4444', textAlign: 'center', marginBottom: '15px', fontSize: '14px', background: '#fef2f2', padding: '10px', borderRadius: '8px' },
                    connectedHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' },
                    userInfo: { display: 'flex', alignItems: 'center', gap: '10px', color: '#6b7280', fontSize: '14px' },
                    projectSelect: { padding: '10px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1e1e2d', fontSize: '14px', outline: 'none', cursor: 'pointer' },
                    createBtn: { padding: '10px 24px', background: '#22c55e', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
                    disconnectBtn: { padding: '10px 20px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '14px', cursor: 'pointer' },
                    kanbanBoard: { display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' },
                    column: { background: '#f9fafb', borderRadius: '12px', padding: '12px', minWidth: '280px', maxWidth: '320px', flex: '0 0 280px', minHeight: '400px', transition: 'all 0.2s' },
                    columnDragOver: { background: '#e0f2fe', border: '2px dashed #3b82f6' },
                    columnHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '8px', background: '#fff', borderRadius: '8px' },
                    columnTitle: { fontSize: '13px', fontWeight: '600', color: '#1e1e2d', textTransform: 'uppercase' },
                    columnCount: { background: '#e5e7eb', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', color: '#374151', fontWeight: '600' },
                    issueCard: { background: '#fff', borderRadius: '8px', padding: '12px', marginBottom: '10px', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none' },
                    issueCardDragging: { opacity: 0.5, transform: 'rotate(3deg)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
                    issueCardTransitioning: { opacity: 0.6, background: '#f0f9ff' },
                    issueKey: { fontSize: '12px', color: '#0052CC', marginBottom: '6px', fontWeight: '600' },
                    issueSummary: { fontSize: '14px', color: '#1e1e2d', marginBottom: '10px', lineHeight: '1.4', fontWeight: '500' },
                    issueFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                    issueType: { fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' },
                    priorityBadge: { width: '20px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', fontSize: '10px', fontWeight: '700' },
                    avatar: { width: '24px', height: '24px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', color: '#374151', overflow: 'hidden' },
                    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
                    listTable: { width: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
                    th: { textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
                    td: { padding: '12px 16px', fontSize: '14px', color: '#1e1e2d', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
                    statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' },
                    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
                    modalContent: { background: '#fff', borderRadius: '16px', padding: '30px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' },
                    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
                    modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1e1e2d' },
                    closeBtn: { background: '#f3f4f6', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px' },
                    textarea: { width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#1e1e2d', outline: 'none', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical' },
                    emptyState: { textAlign: 'center', color: '#6b7280', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' },
                    dragHint: { fontSize: '12px', color: '#6b7280', marginBottom: '10px', fontStyle: 'italic' },
                    detailModal: { width: '600px' },
                    detailHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
                    detailKey: { fontSize: '14px', color: '#0052CC', fontWeight: '600', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px' },
                    detailTitle: { fontSize: '22px', fontWeight: '700', color: '#1e1e2d', marginBottom: '20px', lineHeight: '1.3' },
                    detailSection: { marginBottom: '24px' },
                    detailSectionTitle: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
                    detailDescription: { fontSize: '14px', color: '#1e1e2d', lineHeight: '1.6', padding: '16px', background: '#f9fafb', borderRadius: '8px', minHeight: '60px' },
                    detailRow: { display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' },
                    detailLabel: { width: '100px', fontSize: '13px', color: '#6b7280', fontWeight: '500' },
                    detailValue: { flex: 1, fontSize: '14px', color: '#1e1e2d' },
                    editBtn: { padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
                    saveBtn: { padding: '8px 16px', background: '#22c55e', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginRight: '8px' },
                    cancelBtn: { padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '6px', color: '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
                    select: { padding: '8px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#1e1e2d', outline: 'none', cursor: 'pointer', width: '100%' },
          };

          useEffect(() => {
                    const loadConnection = async () => {
                              const userEmail = localStorage.getItem('userEmail');
                              if (!userEmail) return;
                              try {
                                        const docRef = doc(db, 'GCCJira', userEmail);
                                        const docSnap = await getDoc(docRef);
                                        if (docSnap.exists() && docSnap.data().connected) {
                                                  const data = docSnap.data();
                                                  jiraService.saveCredentials(data.jiraEmail, data.domain, data.apiToken);
                                                  setIsConnected(true);
                                                  setJiraUser({ displayName: data.displayName, emailAddress: data.jiraEmail });
                                                  loadProjects();
                                                  loadPriorities();
                                        }
                              } catch (err) { console.error('Error loading Jira connection:', err); }
                    };
                    loadConnection();
          }, []);

          const loadProjects = async () => {
                    try {
                              const result = await jiraService.getProjects();
                              if (result.success) setProjects(result.projects);
                    } catch (err) { console.error('Error loading projects:', err); }
          };

          const loadIssues = async (projectKey) => {
                    if (!projectKey) return;
                    setLoading(true);
                    try {
                              const result = await jiraService.getIssues(projectKey);
                              if (result.success) setIssues(result.issues);
                    } catch (err) { setError('Failed to load issues'); }
                    finally { setLoading(false); }
          };

          const loadStatuses = async (projectKey) => {
                    try {
                              const result = await jiraService.getStatuses(projectKey);
                              if (result.success) setStatuses(result.statuses);
                    } catch (err) { console.error('Error loading statuses:', err); }
          };

          const loadIssueTypes = async (projectKey) => {
                    try {
                              const result = await jiraService.getIssueTypes(projectKey);
                              if (result.success && result.issueTypes.length > 0) {
                                        setIssueTypes(result.issueTypes);
                                        setNewIssue(prev => ({ ...prev, issueType: result.issueTypes[0].name }));
                              }
                    } catch (err) { console.error('Error fetching issue types:', err); }
          };

          const loadUsers = async (projectKey) => {
                    try {
                              const result = await jiraService.getUsers(projectKey);
                              if (result.success) setAvailableUsers(result.users);
                    } catch (err) { console.error('Error loading users:', err); }
          };

          const loadPriorities = async () => {
                    try {
                              const result = await jiraService.getPriorities();
                              if (result.success) setAvailablePriorities(result.priorities);
                    } catch (err) { console.error('Error loading priorities:', err); }
          };

          const loadIssueDetail = async (issueKey) => {
                    setLoadingDetail(true);
                    try {
                              const [detailResult, transitionsResult] = await Promise.all([
                                        jiraService.getIssueDetail(issueKey),
                                        jiraService.getTransitions(issueKey)
                              ]);

                              if (detailResult.success) {
                                        setIssueDetail(detailResult.issue);
                                        // Find user's accountId for assignee
                                        const currentAssignee = availableUsers.find(u => u.displayName === detailResult.issue.assignee);
                                        const currentPriority = availablePriorities.find(p => p.name === detailResult.issue.priority);
                                        setEditForm({
                                                  summary: detailResult.issue.summary,
                                                  description: detailResult.issue.description || '',
                                                  dueDate: detailResult.issue.dueDate || '',
                                                  assignee: currentAssignee?.accountId || '',
                                                  priority: currentPriority?.id || ''
                                        });
                              }

                              if (transitionsResult.success) {
                                        setAvailableTransitions(transitionsResult.transitions || []);
                              }
                    } catch (err) { console.error('Error loading issue detail:', err); }
                    finally { setLoadingDetail(false); }
          };

          const handleConnect = async (e) => {
                    e.preventDefault();
                    setError(''); setLoading(true);
                    try {
                              const result = await jiraService.connectJira(credentials.email, credentials.domain, credentials.apiToken);
                              if (result.success) {
                                        setIsConnected(true);
                                        setJiraUser(result.user);
                                        const userEmail = localStorage.getItem('userEmail');
                                        if (userEmail) {
                                                  await setDoc(doc(db, 'GCCJira', userEmail), {
                                                            connected: true, jiraEmail: credentials.email, domain: credentials.domain,
                                                            apiToken: credentials.apiToken, displayName: result.user.displayName, connectedAt: new Date().toISOString(),
                                                  });
                                        }
                                        loadProjects();
                                        loadPriorities();
                              } else { setError(result.error || 'Failed to connect'); }
                    } catch (err) { setError('Connection failed. Check your credentials.'); }
                    finally { setLoading(false); }
          };

          const handleDisconnect = async () => {
                    jiraService.clearCredentials();
                    setIsConnected(false); setJiraUser(null); setProjects([]); setIssues([]); setSelectedProject(''); setStatuses([]);
                    const userEmail = localStorage.getItem('userEmail');
                    if (userEmail) await setDoc(doc(db, 'GCCJira', userEmail), { connected: false, disconnectedAt: new Date().toISOString() });
          };

          const handleProjectChange = async (e) => {
                    const projectKey = e.target.value;
                    setSelectedProject(projectKey);
                    if (projectKey) {
                              loadIssues(projectKey);
                              loadStatuses(projectKey);
                              loadIssueTypes(projectKey);
                              loadUsers(projectKey);
                    } else { setIssues([]); setStatuses([]); setIssueTypes([]); setAvailableUsers([]); }
          };

          const handleCreateIssue = async (e) => {
                    e.preventDefault();
                    if (!selectedProject || !newIssue.summary) return;
                    setLoading(true);
                    try {
                              const result = await jiraService.createIssue(selectedProject, newIssue.summary, newIssue.description, newIssue.issueType);
                              if (result.success) {
                                        setShowCreateModal(false);
                                        setNewIssue({ summary: '', description: '', issueType: issueTypes.length > 0 ? issueTypes[0].name : '' });
                                        loadIssues(selectedProject);
                              } else { setError('Failed to create issue: ' + (result.error || '')); }
                    } catch (err) { setError('Failed to create issue'); }
                    finally { setLoading(false); }
          };

          const handleIssueClick = (issue) => {
                    setSelectedIssue(issue);
                    setIsEditing(false);
                    loadIssueDetail(issue.key);
          };

          const handleCloseDetail = () => {
                    setSelectedIssue(null);
                    setIssueDetail(null);
                    setIsEditing(false);
                    setAvailableTransitions([]);
          };

          const handleSaveEdit = async () => {
                    if (!issueDetail) return;
                    setLoadingDetail(true);
                    try {
                              const updates = {
                                        summary: editForm.summary,
                                        description: editForm.description,
                                        duedate: editForm.dueDate || null
                              };

                              // Only include assignee if changed
                              if (editForm.assignee !== undefined) {
                                        updates.assignee = editForm.assignee || null;
                              }

                              // Only include priority if changed
                              if (editForm.priority) {
                                        updates.priority = editForm.priority;
                              }

                              const result = await jiraService.updateIssue(issueDetail.key, updates);
                              if (result.success) {
                                        setIsEditing(false);
                                        loadIssueDetail(issueDetail.key);
                                        loadIssues(selectedProject);
                              } else { setError('Failed to update: ' + (result.error || '')); }
                    } catch (err) { setError('Failed to update issue'); }
                    finally { setLoadingDetail(false); }
          };

          const handleStatusChange = async (transitionId) => {
                    if (!issueDetail || !transitionId) return;
                    setLoadingDetail(true);
                    try {
                              const result = await jiraService.transitionIssue(issueDetail.key, transitionId);
                              if (result.success) {
                                        loadIssueDetail(issueDetail.key);
                                        loadIssues(selectedProject);
                              } else { setError('Failed to change status'); }
                    } catch (err) { setError('Failed to change status'); }
                    finally { setLoadingDetail(false); }
          };

          // Drag and Drop handlers
          const handleDragStart = (e, issue) => {
                    setDraggedIssue(issue);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', issue.key);
          };

          const handleDragEnd = () => { setDraggedIssue(null); setDragOverColumn(null); };
          const handleDragOver = (e, statusName) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverColumn(statusName); };
          const handleDragLeave = () => { setDragOverColumn(null); };

          const handleDrop = async (e, targetStatusName) => {
                    e.preventDefault();
                    setDragOverColumn(null);
                    if (!draggedIssue || draggedIssue.status === targetStatusName) { setDraggedIssue(null); return; }
                    setTransitioning(draggedIssue.key);
                    try {
                              const transitionsResult = await jiraService.getTransitions(draggedIssue.key);
                              if (transitionsResult.success && transitionsResult.transitions) {
                                        const targetTransition = transitionsResult.transitions.find(t => t.name.toLowerCase() === targetStatusName.toLowerCase() || t.to?.toLowerCase() === targetStatusName.toLowerCase());
                                        if (targetTransition) {
                                                  const result = await jiraService.transitionIssue(draggedIssue.key, targetTransition.id);
                                                  if (result.success) {
                                                            setIssues(prevIssues => prevIssues.map(issue => issue.key === draggedIssue.key ? { ...issue, status: targetStatusName } : issue));
                                                            setTimeout(() => loadIssues(selectedProject), 500);
                                                  } else { setError(`Failed to transition: ${result.error || 'Unknown error'}`); }
                                        } else { setError(`Cannot transition to "${targetStatusName}".`); }
                              }
                    } catch (err) { setError('Failed to transition issue'); }
                    finally { setTransitioning(null); setDraggedIssue(null); }
          };

          const filteredIssues = issues.filter(issue => issue.key.toLowerCase().includes(searchQuery.toLowerCase()) || issue.summary.toLowerCase().includes(searchQuery.toLowerCase()));

          const getGroupedIssues = () => {
                    const groups = {};
                    const orderedStatuses = statuses.length > 0 ? statuses : [{ name: 'To Do', categoryKey: 'new' }, { name: 'In Progress', categoryKey: 'indeterminate' }, { name: 'Done', categoryKey: 'done' }];
                    orderedStatuses.forEach(s => { groups[s.name] = []; });
                    filteredIssues.forEach(issue => { const statusName = issue.status; if (groups[statusName]) groups[statusName].push(issue); else { if (!groups[statusName]) groups[statusName] = []; groups[statusName].push(issue); } });
                    return groups;
          };

          const getStatusBadgeStyle = (categoryKey) => { const colors = statusColors[categoryKey] || statusColors.new; return { ...styles.statusBadge, background: colors.bg, color: colors.text }; };
          const renderAvatar = (issue) => { if (issue.assigneeAvatar) return <img src={issue.assigneeAvatar} alt="" style={styles.avatarImg} />; if (issue.assignee && issue.assignee !== 'Unassigned') return issue.assignee.split(' ').map(n => n[0]).join('').substring(0, 2); return '?'; };
          const renderPriority = (priority) => { const config = priorityConfig[priority] || priorityConfig.Medium; return (<div style={{ ...styles.priorityBadge, background: config.bg, color: config.color }}>{config.icon}</div>); };

          if (!isConnected) {
                    return (
                              <div style={styles.container}>
                                        <div style={styles.connectionCard}>
                                                  <h2 style={styles.cardTitle}>Connect to Jira</h2>
                                                  <p style={styles.cardSubtitle}>Enter your Atlassian credentials to get started</p>
                                                  {error && <p style={styles.error}>{error}</p>}
                                                  <form onSubmit={handleConnect}>
                                                            <div style={styles.inputGroup}><label style={styles.label}>Jira Email</label><input type="email" style={styles.input} placeholder="your-email@company.com" value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} required /></div>
                                                            <div style={styles.inputGroup}><label style={styles.label}>Jira Domain</label><input type="text" style={styles.input} placeholder="yourcompany.atlassian.net" value={credentials.domain} onChange={(e) => setCredentials({ ...credentials, domain: e.target.value })} required /></div>
                                                            <div style={styles.inputGroup}><label style={styles.label}>API Token</label><input type="password" style={styles.input} placeholder="Your Jira API token" value={credentials.apiToken} onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })} required /><small style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px', display: 'block' }}>Get your token from: id.atlassian.com/manage/api-tokens</small></div>
                                                            <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>{loading ? 'Connecting...' : 'Connect to Jira'}</button>
                                                  </form>
                                        </div>
                              </div>
                    );
          }

          const groupedIssues = getGroupedIssues();

          return (
                    <div style={styles.container}>
                              <div style={styles.header}><h1 style={styles.title}>{t('Jira Board')}</h1></div>

                              <div style={styles.connectedHeader}>
                                        <div style={styles.userInfo}>{t('Connected as')}: <strong style={{ color: '#1e1e2d', marginLeft: '4px' }}>{jiraUser?.displayName}</strong></div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                  <select style={styles.projectSelect} value={selectedProject} onChange={handleProjectChange}>
                                                            <option value="">{t('Select Project')}</option>
                                                            {projects.map(p => (<option key={p.key} value={p.key}>{p.name} ({p.key})</option>))}
                                                  </select>
                                                  {selectedProject && <button style={styles.createBtn} onClick={() => setShowCreateModal(true)}>+ Create Issue</button>}
                                                  <button style={styles.disconnectBtn} onClick={handleDisconnect}>Disconnect</button>
                                        </div>
                              </div>

                              {error && <p style={{ ...styles.error, marginBottom: '15px' }}>{error} <button onClick={() => setError('')} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button></p>}

                              {selectedProject && (
                                        <div style={styles.toolbar}>
                                                  <div style={styles.searchBox}><span>🔍</span><input type="text" style={styles.searchInput} placeholder={t('Search issues...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                                                  <div style={styles.viewToggle}>
                                                            <button style={{ ...styles.viewBtn, ...(viewMode === 'board' ? styles.viewBtnActive : {}) }} onClick={() => setViewMode('board')}>Board</button>
                                                            <button style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }} onClick={() => setViewMode('list')}>List</button>
                                                  </div>
                                        </div>
                              )}

                              {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>{t('Loading')}...</div>}

                              {!loading && selectedProject && viewMode === 'board' && (
                                        <>
                                                  <p style={styles.dragHint}>💡 Drag and drop cards to change status • Click to view details</p>
                                                  <div style={styles.kanbanBoard}>
                                                            {Object.entries(groupedIssues).map(([statusName, statusIssues]) => (
                                                                      <div key={statusName} style={{ ...styles.column, ...(dragOverColumn === statusName ? styles.columnDragOver : {}) }} onDragOver={(e) => handleDragOver(e, statusName)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, statusName)}>
                                                                                <div style={styles.columnHeader}><span style={styles.columnTitle}>{statusName}</span><span style={styles.columnCount}>{statusIssues.length}</span></div>
                                                                                {statusIssues.map(issue => (
                                                                                          <div key={issue.key} style={{ ...styles.issueCard, ...(draggedIssue?.key === issue.key ? styles.issueCardDragging : {}), ...(transitioning === issue.key ? styles.issueCardTransitioning : {}) }} draggable onDragStart={(e) => handleDragStart(e, issue)} onDragEnd={handleDragEnd} onClick={() => handleIssueClick(issue)}>
                                                                                                    {transitioning === issue.key && <div style={{ fontSize: '11px', color: '#3b82f6', marginBottom: '6px' }}>⏳ Moving...</div>}
                                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}><span style={{ fontSize: '14px' }}>{issueTypeIcons[issue.issueType] || '📋'}</span><span style={styles.issueKey}>{issue.key}</span></div>
                                                                                                    <div style={styles.issueSummary}><DynamicText>{issue.summary}</DynamicText></div>
                                                                                                    <div style={styles.issueFooter}><div style={styles.issueType}>{issue.issueType}</div><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{issue.priority && renderPriority(issue.priority)}<div style={styles.avatar}>{renderAvatar(issue)}</div></div></div>
                                                                                          </div>
                                                                                ))}
                                                                      </div>
                                                            ))}
                                                  </div>
                                        </>
                              )}

                              {!loading && selectedProject && viewMode === 'list' && (
                                        <table style={styles.listTable}>
                                                  <thead><tr><th style={styles.th}>Type</th><th style={styles.th}>Key</th><th style={{ ...styles.th, width: '40%' }}>Summary</th><th style={styles.th}>Status</th><th style={styles.th}>Assignee</th><th style={styles.th}>Due Date</th><th style={styles.th}>Priority</th></tr></thead>
                                                  <tbody>
                                                            {filteredIssues.map(issue => (
                                                                      <tr key={issue.key} style={{ cursor: 'pointer' }} onClick={() => handleIssueClick(issue)}>
                                                                                <td style={styles.td}><span style={{ fontSize: '18px' }}>{issueTypeIcons[issue.issueType] || '📋'}</span></td>
                                                                                <td style={{ ...styles.td, color: '#0052CC', fontWeight: '600' }}>{issue.key}</td>
                                                                                <td style={styles.td}><DynamicText>{issue.summary}</DynamicText></td>
                                                                                <td style={styles.td}><span style={getStatusBadgeStyle(issue.statusCategory)}>{issue.status}</span></td>
                                                                                <td style={styles.td}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={styles.avatar}>{renderAvatar(issue)}</div><span style={{ fontSize: '13px' }}>{issue.assignee}</span></div></td>
                                                                                <td style={{ ...styles.td, color: '#6b7280', fontSize: '13px' }}>{issue.dueDate || '-'}</td>
                                                                                <td style={styles.td}>{issue.priority && renderPriority(issue.priority)}</td>
                                                                      </tr>
                                                            ))}
                                                  </tbody>
                                        </table>
                              )}

                              {!loading && !selectedProject && <div style={styles.emptyState}><p style={{ fontSize: '16px' }}>{t('Select a project to view issues')}</p></div>}

                              {/* Create Issue Modal */}
                              {showCreateModal && (
                                        <div style={styles.modal}>
                                                  <div style={styles.modalContent}>
                                                            <div style={styles.modalHeader}><h3 style={styles.modalTitle}>{t('Create Issue')}</h3><button style={styles.closeBtn} onClick={() => setShowCreateModal(false)}>×</button></div>
                                                            <form onSubmit={handleCreateIssue}>
                                                                      <div style={styles.inputGroup}><label style={styles.label}>{t('Issue Type')}</label><select style={styles.input} value={newIssue.issueType} onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}>{issueTypes.length > 0 ? issueTypes.map(type => (<option key={type.id} value={type.name}>{type.name}</option>)) : <option value="Task">{t('Task')}</option>}</select></div>
                                                                      <div style={styles.inputGroup}><label style={styles.label}>{t('Summary')}</label><input type="text" style={styles.input} placeholder={t('What needs to be done?')} value={newIssue.summary} onChange={(e) => setNewIssue({ ...newIssue, summary: e.target.value })} required /></div>
                                                                      <div style={styles.inputGroup}><label style={styles.label}>{t('Description')}</label><textarea style={styles.textarea} placeholder={t('Add more details...')} value={newIssue.description} onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })} /></div>
                                                                      <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>{loading ? t('Creating...') : t('Create Issue')}</button>
                                                            </form>
                                                  </div>
                                        </div>
                              )}

                              {/* Issue Detail Modal */}
                              {selectedIssue && (
                                        <div style={styles.modal} onClick={handleCloseDetail}>
                                                  <div style={{ ...styles.modalContent, ...styles.detailModal }} onClick={e => e.stopPropagation()}>
                                                            <div style={styles.modalHeader}>
                                                                      <div style={styles.detailHeader}><span style={{ fontSize: '20px' }}>{issueTypeIcons[selectedIssue.issueType] || '📋'}</span><span style={styles.detailKey}>{selectedIssue.key}</span></div>
                                                                      <button style={styles.closeBtn} onClick={handleCloseDetail}>×</button>
                                                            </div>

                                                            {loadingDetail ? <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div> : issueDetail && (
                                                                      <>
                                                                                {/* Summary */}
                                                                                <div style={styles.inputGroup}>
                                                                                          <label style={styles.label}>Summary</label>
                                                                                          {isEditing ? <input type="text" style={styles.input} value={editForm.summary} onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })} /> : <div style={styles.detailTitle}>{issueDetail.summary}</div>}
                                                                                </div>

                                                                                {/* Description */}
                                                                                <div style={styles.detailSection}>
                                                                                          <div style={styles.detailSectionTitle}>📝 Description</div>
                                                                                          {isEditing ? <textarea style={styles.textarea} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Add a description..." /> : <div style={styles.detailDescription}>{issueDetail.description || 'No description'}</div>}
                                                                                </div>

                                                                                {/* Details */}
                                                                                <div style={styles.detailSection}>
                                                                                          <div style={styles.detailSectionTitle}>📋 {t('Details')}</div>
                                                                                          <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px' }}>

                                                                                                    {/* Status */}
                                                                                                    <div style={styles.detailRow}>
                                                                                                              <div style={styles.detailLabel}>{t('Status')}</div>
                                                                                                              <div style={styles.detailValue}>
                                                                                                                        {isEditing && availableTransitions.length > 0 ? (
                                                                                                                                  <select style={styles.select} onChange={(e) => handleStatusChange(e.target.value)} defaultValue="">
                                                                                                                                            <option value="" disabled>{issueDetail.status}</option>
                                                                                                                                            {availableTransitions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                                                                                  </select>
                                                                                                                        ) : issueDetail.status}
                                                                                                              </div>
                                                                                                    </div>

                                                                                                    {/* Assignee */}
                                                                                                    <div style={styles.detailRow}>
                                                                                                              <div style={styles.detailLabel}>Assignee</div>
                                                                                                              <div style={styles.detailValue}>
                                                                                                                        {isEditing ? (
                                                                                                                                  <select style={styles.select} value={editForm.assignee} onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })}>
                                                                                                                                            <option value="">Unassigned</option>
                                                                                                                                            {availableUsers.map(u => <option key={u.accountId} value={u.accountId}>{u.displayName}</option>)}
                                                                                                                                  </select>
                                                                                                                        ) : (
                                                                                                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                                            {issueDetail.assigneeAvatar && <img src={issueDetail.assigneeAvatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                                                                                                                                            {issueDetail.assignee}
                                                                                                                                  </div>
                                                                                                                        )}
                                                                                                              </div>
                                                                                                    </div>

                                                                                                    {/* Priority */}
                                                                                                    <div style={styles.detailRow}>
                                                                                                              <div style={styles.detailLabel}>Priority</div>
                                                                                                              <div style={styles.detailValue}>
                                                                                                                        {isEditing ? (
                                                                                                                                  <select style={styles.select} value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                                                                                                                                            <option value="">Select Priority</option>
                                                                                                                                            {availablePriorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                                                                                                  </select>
                                                                                                                        ) : (
                                                                                                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                                            {issueDetail.priority && renderPriority(issueDetail.priority)}
                                                                                                                                            {issueDetail.priority || '-'}
                                                                                                                                  </div>
                                                                                                                        )}
                                                                                                              </div>
                                                                                                    </div>

                                                                                                    {/* Due Date */}
                                                                                                    <div style={styles.detailRow}>
                                                                                                              <div style={styles.detailLabel}>Due date</div>
                                                                                                              <div style={styles.detailValue}>
                                                                                                                        {isEditing ? <input type="date" style={{ ...styles.input, width: 'auto' }} value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} /> : (issueDetail.dueDate ? `📅 ${issueDetail.dueDate}` : 'None')}
                                                                                                              </div>
                                                                                                    </div>

                                                                                                    {/* Reporter */}
                                                                                                    <div style={{ ...styles.detailRow, borderBottom: 'none' }}>
                                                                                                              <div style={styles.detailLabel}>Reporter</div>
                                                                                                              <div style={{ ...styles.detailValue, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                                        {issueDetail.reporterAvatar && <img src={issueDetail.reporterAvatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
                                                                                                                        {issueDetail.reporter}
                                                                                                              </div>
                                                                                                    </div>
                                                                                          </div>
                                                                                </div>

                                                                                {/* Actions */}
                                                                                <div style={{ marginTop: '20px' }}>
                                                                                          {isEditing ? (
                                                                                                    <><button style={styles.saveBtn} onClick={handleSaveEdit} disabled={loadingDetail}>{loadingDetail ? 'Saving...' : 'Save Changes'}</button><button style={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button></>
                                                                                          ) : (
                                                                                                    <button style={styles.editBtn} onClick={() => setIsEditing(true)}>✏️ Edit Issue</button>
                                                                                          )}
                                                                                </div>
                                                                      </>
                                                            )}
                                                  </div>
                                        </div>
                              )}
                    </div>
          );
}

export default JiraPage;
