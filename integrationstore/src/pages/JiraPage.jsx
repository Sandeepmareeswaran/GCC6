import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import * as jiraService from '../services/jiraService';

function JiraPage() {
          const [isConnected, setIsConnected] = useState(false);
          const [loading, setLoading] = useState(false);
          const [error, setError] = useState('');
          const [jiraUser, setJiraUser] = useState(null);

          const [credentials, setCredentials] = useState({
                    email: '',
                    domain: '',
                    apiToken: ''
          });

          const [projects, setProjects] = useState([]);
          const [selectedProject, setSelectedProject] = useState('');
          const [issues, setIssues] = useState([]);

          const [showCreateModal, setShowCreateModal] = useState(false);
          const [newIssue, setNewIssue] = useState({ summary: '', description: '', issueType: 'Task' });

          const styles = {
                    container: {
                              padding: '10px',
                    },
                    header: {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '30px',
                    },
                    title: {
                              fontSize: '28px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                    },
                    connectionCard: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '40px',
                              maxWidth: '450px',
                              margin: '50px auto',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              border: '1px solid #e5e7eb',
                    },
                    cardTitle: {
                              fontSize: '24px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                              marginBottom: '8px',
                              textAlign: 'center',
                    },
                    cardSubtitle: {
                              color: '#6b7280',
                              textAlign: 'center',
                              marginBottom: '30px',
                              fontSize: '14px',
                    },
                    inputGroup: {
                              marginBottom: '20px',
                    },
                    label: {
                              display: 'block',
                              color: '#374151',
                              fontSize: '14px',
                              fontWeight: '500',
                              marginBottom: '8px',
                    },
                    input: {
                              width: '100%',
                              padding: '12px 16px',
                              background: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '10px',
                              color: '#1e1e2d',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                              transition: 'border-color 0.2s',
                    },
                    button: {
                              width: '100%',
                              padding: '14px',
                              background: '#22c55e',
                              border: 'none',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '16px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginTop: '10px',
                              transition: 'background 0.2s',
                    },
                    error: {
                              color: '#ef4444',
                              textAlign: 'center',
                              marginBottom: '15px',
                              fontSize: '14px',
                              background: '#fef2f2',
                              padding: '10px',
                              borderRadius: '8px',
                    },
                    connectedHeader: {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '20px',
                              flexWrap: 'wrap',
                              gap: '15px',
                    },
                    userInfo: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              color: '#6b7280',
                              fontSize: '14px',
                    },
                    projectSelect: {
                              padding: '10px 20px',
                              background: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              color: '#1e1e2d',
                              fontSize: '14px',
                              outline: 'none',
                              cursor: 'pointer',
                    },
                    createBtn: {
                              padding: '10px 24px',
                              background: '#22c55e',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                    },
                    disconnectBtn: {
                              padding: '10px 20px',
                              background: 'transparent',
                              border: '1px solid #ef4444',
                              borderRadius: '8px',
                              color: '#ef4444',
                              fontSize: '14px',
                              cursor: 'pointer',
                    },
                    kanbanBoard: {
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)',
                              gap: '20px',
                              marginTop: '20px',
                    },
                    column: {
                              background: '#ffffff',
                              borderRadius: '12px',
                              padding: '16px',
                              minHeight: '400px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                    },
                    columnHeader: {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '16px',
                              paddingBottom: '12px',
                              borderBottom: '2px solid #e5e7eb',
                    },
                    columnTitle: {
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1e1e2d',
                    },
                    columnCount: {
                              background: '#f3f4f6',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: '#6b7280',
                              fontWeight: '500',
                    },
                    issueCard: {
                              background: '#f9fafb',
                              borderRadius: '10px',
                              padding: '16px',
                              marginBottom: '12px',
                              border: '1px solid #e5e7eb',
                              cursor: 'pointer',
                              transition: 'box-shadow 0.2s, transform 0.2s',
                    },
                    issueKey: {
                              fontSize: '12px',
                              color: '#0052CC',
                              marginBottom: '8px',
                              fontWeight: '600',
                    },
                    issueSummary: {
                              fontSize: '14px',
                              color: '#1e1e2d',
                              marginBottom: '12px',
                              lineHeight: '1.5',
                              fontWeight: '500',
                    },
                    issueFooter: {
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                    },
                    issueType: {
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              fontWeight: '500',
                    },
                    assignee: {
                              fontSize: '11px',
                              color: '#6b7280',
                    },
                    modal: {
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 2000,
                    },
                    modalContent: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '30px',
                              width: '500px',
                              maxWidth: '90%',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    },
                    modalHeader: {
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '24px',
                    },
                    modalTitle: {
                              fontSize: '20px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                    },
                    closeBtn: {
                              background: '#f3f4f6',
                              border: 'none',
                              color: '#6b7280',
                              fontSize: '20px',
                              cursor: 'pointer',
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                    },
                    textarea: {
                              width: '100%',
                              padding: '12px 16px',
                              background: '#f9fafb',
                              border: '1px solid #e5e7eb',
                              borderRadius: '10px',
                              color: '#1e1e2d',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                              minHeight: '100px',
                              resize: 'vertical',
                    },
                    emptyState: {
                              textAlign: 'center',
                              color: '#6b7280',
                              padding: '60px 20px',
                              background: '#ffffff',
                              borderRadius: '16px',
                              border: '1px solid #e5e7eb',
                    },
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
                                        }
                              } catch (err) {
                                        console.error('Error loading Jira connection:', err);
                              }
                    };
                    loadConnection();
          }, []);

          const loadProjects = async () => {
                    try {
                              const result = await jiraService.getProjects();
                              if (result.success) setProjects(result.projects);
                    } catch (err) {
                              console.error('Error loading projects:', err);
                    }
          };

          const loadIssues = async (projectKey) => {
                    if (!projectKey) return;
                    setLoading(true);
                    try {
                              const result = await jiraService.getIssues(projectKey);
                              if (result.success) setIssues(result.issues);
                    } catch (err) {
                              setError('Failed to load issues');
                    } finally {
                              setLoading(false);
                    }
          };

          const handleConnect = async (e) => {
                    e.preventDefault();
                    setError('');
                    setLoading(true);
                    try {
                              const result = await jiraService.connectJira(credentials.email, credentials.domain, credentials.apiToken);
                              if (result.success) {
                                        setIsConnected(true);
                                        setJiraUser(result.user);
                                        const userEmail = localStorage.getItem('userEmail');
                                        if (userEmail) {
                                                  await setDoc(doc(db, 'GCCJira', userEmail), {
                                                            connected: true,
                                                            jiraEmail: credentials.email,
                                                            domain: credentials.domain,
                                                            apiToken: credentials.apiToken,
                                                            displayName: result.user.displayName,
                                                            connectedAt: new Date().toISOString(),
                                                  });
                                        }
                                        loadProjects();
                              } else {
                                        setError(result.error || 'Failed to connect');
                              }
                    } catch (err) {
                              setError('Connection failed. Check your credentials.');
                    } finally {
                              setLoading(false);
                    }
          };

          const handleDisconnect = async () => {
                    jiraService.clearCredentials();
                    setIsConnected(false);
                    setJiraUser(null);
                    setProjects([]);
                    setIssues([]);
                    setSelectedProject('');
                    const userEmail = localStorage.getItem('userEmail');
                    if (userEmail) {
                              await setDoc(doc(db, 'GCCJira', userEmail), { connected: false, disconnectedAt: new Date().toISOString() });
                    }
          };

          const handleProjectChange = (e) => {
                    const projectKey = e.target.value;
                    setSelectedProject(projectKey);
                    if (projectKey) loadIssues(projectKey);
                    else setIssues([]);
          };

          const handleCreateIssue = async (e) => {
                    e.preventDefault();
                    if (!selectedProject || !newIssue.summary) return;
                    setLoading(true);
                    try {
                              const result = await jiraService.createIssue(selectedProject, newIssue.summary, newIssue.description, newIssue.issueType);
                              if (result.success) {
                                        setShowCreateModal(false);
                                        setNewIssue({ summary: '', description: '', issueType: 'Task' });
                                        loadIssues(selectedProject);
                              } else {
                                        setError('Failed to create issue');
                              }
                    } catch (err) {
                              setError('Failed to create issue');
                    } finally {
                              setLoading(false);
                    }
          };

          const groupedIssues = {
                    todo: issues.filter(i => i.statusCategory === 'new' || i.status === 'To Do'),
                    inProgress: issues.filter(i => i.statusCategory === 'indeterminate' || i.status === 'In Progress'),
                    done: issues.filter(i => i.statusCategory === 'done' || i.status === 'Done'),
          };

          if (!isConnected) {
                    return (
                              <div style={styles.container}>
                                        <div style={styles.connectionCard}>
                                                  <h2 style={styles.cardTitle}>Connect to Jira</h2>
                                                  <p style={styles.cardSubtitle}>Enter your Atlassian credentials to get started</p>
                                                  {error && <p style={styles.error}>{error}</p>}
                                                  <form onSubmit={handleConnect}>
                                                            <div style={styles.inputGroup}>
                                                                      <label style={styles.label}>Jira Email</label>
                                                                      <input type="email" style={styles.input} placeholder="your-email@company.com" value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} required />
                                                            </div>
                                                            <div style={styles.inputGroup}>
                                                                      <label style={styles.label}>Jira Domain</label>
                                                                      <input type="text" style={styles.input} placeholder="yourcompany.atlassian.net" value={credentials.domain} onChange={(e) => setCredentials({ ...credentials, domain: e.target.value })} required />
                                                            </div>
                                                            <div style={styles.inputGroup}>
                                                                      <label style={styles.label}>API Token</label>
                                                                      <input type="password" style={styles.input} placeholder="Your Jira API token" value={credentials.apiToken} onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })} required />
                                                                      <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px', display: 'block' }}>Get your token from: id.atlassian.com/manage/api-tokens</small>
                                                            </div>
                                                            <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>{loading ? 'Connecting...' : 'Connect to Jira'}</button>
                                                  </form>
                                        </div>
                              </div>
                    );
          }

          return (
                    <div style={styles.container}>
                              <div style={styles.header}>
                                        <h1 style={styles.title}>Jira Board</h1>
                              </div>
                              <div style={styles.connectedHeader}>
                                        <div style={styles.userInfo}>Connected as: <strong style={{ color: '#1e1e2d', marginLeft: '4px' }}>{jiraUser?.displayName}</strong></div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                  <select style={styles.projectSelect} value={selectedProject} onChange={handleProjectChange}>
                                                            <option value="">Select Project</option>
                                                            {projects.map(p => (<option key={p.key} value={p.key}>{p.name} ({p.key})</option>))}
                                                  </select>
                                                  {selectedProject && <button style={styles.createBtn} onClick={() => setShowCreateModal(true)}>+ Create Issue</button>}
                                                  <button style={styles.disconnectBtn} onClick={handleDisconnect}>Disconnect</button>
                                        </div>
                              </div>

                              {selectedProject ? (
                                        <div style={styles.kanbanBoard}>
                                                  <div style={styles.column}>
                                                            <div style={styles.columnHeader}><span style={styles.columnTitle}>To Do</span><span style={styles.columnCount}>{groupedIssues.todo.length}</span></div>
                                                            {groupedIssues.todo.map(issue => (
                                                                      <div key={issue.key} style={styles.issueCard}>
                                                                                <div style={styles.issueKey}>{issue.key}</div>
                                                                                <div style={styles.issueSummary}>{issue.summary}</div>
                                                                                <div style={styles.issueFooter}><span style={styles.issueType}>{issue.issueType}</span><span style={styles.assignee}>{issue.assignee}</span></div>
                                                                      </div>
                                                            ))}
                                                  </div>
                                                  <div style={styles.column}>
                                                            <div style={styles.columnHeader}><span style={styles.columnTitle}>In Progress</span><span style={styles.columnCount}>{groupedIssues.inProgress.length}</span></div>
                                                            {groupedIssues.inProgress.map(issue => (
                                                                      <div key={issue.key} style={styles.issueCard}>
                                                                                <div style={styles.issueKey}>{issue.key}</div>
                                                                                <div style={styles.issueSummary}>{issue.summary}</div>
                                                                                <div style={styles.issueFooter}><span style={styles.issueType}>{issue.issueType}</span><span style={styles.assignee}>{issue.assignee}</span></div>
                                                                      </div>
                                                            ))}
                                                  </div>
                                                  <div style={styles.column}>
                                                            <div style={styles.columnHeader}><span style={styles.columnTitle}>Done</span><span style={styles.columnCount}>{groupedIssues.done.length}</span></div>
                                                            {groupedIssues.done.map(issue => (
                                                                      <div key={issue.key} style={styles.issueCard}>
                                                                                <div style={styles.issueKey}>{issue.key}</div>
                                                                                <div style={styles.issueSummary}>{issue.summary}</div>
                                                                                <div style={styles.issueFooter}><span style={styles.issueType}>{issue.issueType}</span><span style={styles.assignee}>{issue.assignee}</span></div>
                                                                      </div>
                                                            ))}
                                                  </div>
                                        </div>
                              ) : (
                                        <div style={styles.emptyState}><p style={{ fontSize: '16px' }}>Select a project to view issues</p></div>
                              )}

                              {showCreateModal && (
                                        <div style={styles.modal}>
                                                  <div style={styles.modalContent}>
                                                            <div style={styles.modalHeader}><h3 style={styles.modalTitle}>Create Issue</h3><button style={styles.closeBtn} onClick={() => setShowCreateModal(false)}>×</button></div>
                                                            <form onSubmit={handleCreateIssue}>
                                                                      <div style={styles.inputGroup}>
                                                                                <label style={styles.label}>Issue Type</label>
                                                                                <select style={styles.input} value={newIssue.issueType} onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}>
                                                                                          <option value="Task">Task</option><option value="Bug">Bug</option><option value="Story">Story</option>
                                                                                </select>
                                                                      </div>
                                                                      <div style={styles.inputGroup}>
                                                                                <label style={styles.label}>Summary</label>
                                                                                <input type="text" style={styles.input} placeholder="What needs to be done?" value={newIssue.summary} onChange={(e) => setNewIssue({ ...newIssue, summary: e.target.value })} required />
                                                                      </div>
                                                                      <div style={styles.inputGroup}>
                                                                                <label style={styles.label}>Description</label>
                                                                                <textarea style={styles.textarea} placeholder="Add more details..." value={newIssue.description} onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })} />
                                                                      </div>
                                                                      <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>{loading ? 'Creating...' : 'Create Issue'}</button>
                                                            </form>
                                                  </div>
                                        </div>
                              )}
                    </div>
          );
}

export default JiraPage;
