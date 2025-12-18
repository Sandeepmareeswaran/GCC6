import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import * as jiraService from '../services/jiraService';

function JiraPage() {
          const [isConnected, setIsConnected] = useState(false);
          const [loading, setLoading] = useState(false);
          const [error, setError] = useState('');
          const [jiraUser, setJiraUser] = useState(null);

          // Connection form
          const [credentials, setCredentials] = useState({
                    email: '',
                    domain: '',
                    apiToken: ''
          });

          // Projects and Issues
          const [projects, setProjects] = useState([]);
          const [selectedProject, setSelectedProject] = useState('');
          const [issues, setIssues] = useState([]);

          // Create issue modal
          const [showCreateModal, setShowCreateModal] = useState(false);
          const [newIssue, setNewIssue] = useState({ summary: '', description: '', issueType: 'Task' });

          const styles = {
                    container: {
                              padding: '20px',
                              maxWidth: '1400px',
                              margin: '0 auto',
                    },
                    header: {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '30px',
                    },
                    title: {
                              fontSize: '32px',
                              fontWeight: '700',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                    },
                    jiraLogo: {
                              width: '40px',
                              height: '40px',
                              fill: '#0052CC',
                    },
                    connectionCard: {
                              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                              borderRadius: '16px',
                              padding: '40px',
                              maxWidth: '500px',
                              margin: '50px auto',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    cardTitle: {
                              fontSize: '24px',
                              fontWeight: '600',
                              color: '#fff',
                              marginBottom: '10px',
                              textAlign: 'center',
                    },
                    cardSubtitle: {
                              color: '#8b8b9e',
                              textAlign: 'center',
                              marginBottom: '30px',
                    },
                    inputGroup: {
                              marginBottom: '20px',
                    },
                    label: {
                              display: 'block',
                              color: '#8b8b9e',
                              fontSize: '14px',
                              marginBottom: '8px',
                    },
                    input: {
                              width: '100%',
                              padding: '14px 16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '16px',
                              outline: 'none',
                              boxSizing: 'border-box',
                    },
                    button: {
                              width: '100%',
                              padding: '14px',
                              background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
                              border: 'none',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '16px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginTop: '10px',
                    },
                    error: {
                              color: '#ff6b6b',
                              textAlign: 'center',
                              marginBottom: '15px',
                              fontSize: '14px',
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
                              color: '#8b8b9e',
                    },
                    projectSelect: {
                              padding: '10px 20px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '14px',
                              outline: 'none',
                              cursor: 'pointer',
                    },
                    createBtn: {
                              padding: '10px 24px',
                              background: 'linear-gradient(135deg, #0052CC 0%, #0065FF 100%)',
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
                              border: '1px solid #ff6b6b',
                              borderRadius: '8px',
                              color: '#ff6b6b',
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
                              background: 'rgba(255, 255, 255, 0.03)',
                              borderRadius: '12px',
                              padding: '15px',
                              minHeight: '400px',
                    },
                    columnHeader: {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '15px',
                              paddingBottom: '10px',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    columnTitle: {
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#fff',
                    },
                    columnCount: {
                              background: 'rgba(255, 255, 255, 0.1)',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              color: '#8b8b9e',
                    },
                    issueCard: {
                              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                              borderRadius: '8px',
                              padding: '15px',
                              marginBottom: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease',
                    },
                    issueKey: {
                              fontSize: '12px',
                              color: '#0052CC',
                              marginBottom: '8px',
                              fontWeight: '600',
                    },
                    issueSummary: {
                              fontSize: '14px',
                              color: '#fff',
                              marginBottom: '10px',
                              lineHeight: '1.4',
                    },
                    issueFooter: {
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                    },
                    issueType: {
                              fontSize: '11px',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: 'rgba(0, 82, 204, 0.2)',
                              color: '#4fc3f7',
                    },
                    assignee: {
                              fontSize: '11px',
                              color: '#8b8b9e',
                    },
                    modal: {
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 2000,
                    },
                    modalContent: {
                              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                              borderRadius: '16px',
                              padding: '30px',
                              width: '500px',
                              maxWidth: '90%',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    modalHeader: {
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '20px',
                    },
                    modalTitle: {
                              fontSize: '20px',
                              fontWeight: '600',
                              color: '#fff',
                    },
                    closeBtn: {
                              background: 'none',
                              border: 'none',
                              color: '#8b8b9e',
                              fontSize: '24px',
                              cursor: 'pointer',
                    },
                    textarea: {
                              width: '100%',
                              padding: '14px 16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box',
                              minHeight: '100px',
                              resize: 'vertical',
                    },
                    emptyState: {
                              textAlign: 'center',
                              color: '#8b8b9e',
                              padding: '40px',
                    },
          };

          // Load saved connection from Firebase on mount
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
                              if (result.success) {
                                        setProjects(result.projects);
                              }
                    } catch (err) {
                              console.error('Error loading projects:', err);
                    }
          };

          const loadIssues = async (projectKey) => {
                    if (!projectKey) return;
                    setLoading(true);
                    try {
                              const result = await jiraService.getIssues(projectKey);
                              if (result.success) {
                                        setIssues(result.issues);
                              }
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
                              const result = await jiraService.connectJira(
                                        credentials.email,
                                        credentials.domain,
                                        credentials.apiToken
                              );

                              if (result.success) {
                                        setIsConnected(true);
                                        setJiraUser(result.user);

                                        // Save to Firebase
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
                              await setDoc(doc(db, 'GCCJira', userEmail), {
                                        connected: false,
                                        disconnectedAt: new Date().toISOString(),
                              });
                    }
          };

          const handleProjectChange = (e) => {
                    const projectKey = e.target.value;
                    setSelectedProject(projectKey);
                    if (projectKey) {
                              loadIssues(projectKey);
                    } else {
                              setIssues([]);
                    }
          };

          const handleCreateIssue = async (e) => {
                    e.preventDefault();
                    if (!selectedProject || !newIssue.summary) return;

                    setLoading(true);
                    try {
                              const result = await jiraService.createIssue(
                                        selectedProject,
                                        newIssue.summary,
                                        newIssue.description,
                                        newIssue.issueType
                              );

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

          // Group issues by status category
          const groupedIssues = {
                    todo: issues.filter(i => i.statusCategory === 'new' || i.status === 'To Do'),
                    inProgress: issues.filter(i => i.statusCategory === 'indeterminate' || i.status === 'In Progress'),
                    done: issues.filter(i => i.statusCategory === 'done' || i.status === 'Done'),
          };

          // Not connected - show connection form
          if (!isConnected) {
                    return (
                              <div style={styles.container}>
                                        <div style={styles.connectionCard}>
                                                  <svg style={styles.jiraLogo} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84h-9.63z" fill="#2684FF" />
                                                            <path d="M6.77 6.8a4.36 4.36 0 0 0 4.34 4.37h1.8v1.7a4.36 4.36 0 0 0 4.34 4.35V7.63a.84.84 0 0 0-.83-.83H6.77z" fill="#2684FF" />
                                                            <path d="M2 11.6c0 2.4 1.95 4.35 4.35 4.37h1.78v1.7c.01 2.39 1.95 4.33 4.35 4.33v-9.57a.84.84 0 0 0-.84-.84H2v.01z" fill="#2684FF" />
                                                  </svg>
                                                  <h2 style={styles.cardTitle}>Connect to Jira</h2>
                                                  <p style={styles.cardSubtitle}>Enter your Atlassian credentials to get started</p>

                                                  {error && <p style={styles.error}>{error}</p>}

                                                  <form onSubmit={handleConnect}>
                                                            <div style={styles.inputGroup}>
                                                                      <label style={styles.label}>Jira Email</label>
                                                                      <input
                                                                                type="email"
                                                                                style={styles.input}
                                                                                placeholder="your-email@company.com"
                                                                                value={credentials.email}
                                                                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                                                                required
                                                                      />
                                                            </div>

                                                            <div style={styles.inputGroup}>
                                                                      <label style={styles.label}>Jira Domain</label>
                                                                      <input
                                                                                type="text"
                                                                                style={styles.input}
                                                                                placeholder="yourcompany.atlassian.net"
                                                                                value={credentials.domain}
                                                                                onChange={(e) => setCredentials({ ...credentials, domain: e.target.value })}
                                                                                required
                                                                      />
                                                            </div>

                                                            <div style={styles.inputGroup}>
                                                                      <label style={styles.label}>API Token</label>
                                                                      <input
                                                                                type="password"
                                                                                style={styles.input}
                                                                                placeholder="Your Jira API token"
                                                                                value={credentials.apiToken}
                                                                                onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })}
                                                                                required
                                                                      />
                                                                      <small style={{ color: '#8b8b9e', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                                                                Get your token from: id.atlassian.com/manage/api-tokens
                                                                      </small>
                                                            </div>

                                                            <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                                                      {loading ? 'Connecting...' : 'Connect to Jira'}
                                                            </button>
                                                  </form>
                                        </div>
                              </div>
                    );
          }

          // Connected - show Kanban board
          return (
                    <div style={styles.container}>
                              <div style={styles.header}>
                                        <h1 style={styles.title}>
                                                  <svg style={{ width: '36px', height: '36px' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84h-9.63z" fill="#2684FF" />
                                                            <path d="M6.77 6.8a4.36 4.36 0 0 0 4.34 4.37h1.8v1.7a4.36 4.36 0 0 0 4.34 4.35V7.63a.84.84 0 0 0-.83-.83H6.77z" fill="#2684FF" />
                                                            <path d="M2 11.6c0 2.4 1.95 4.35 4.35 4.37h1.78v1.7c.01 2.39 1.95 4.33 4.35 4.33v-9.57a.84.84 0 0 0-.84-.84H2v.01z" fill="#2684FF" />
                                                  </svg>
                                                  Jira Board
                                        </h1>
                              </div>

                              <div style={styles.connectedHeader}>
                                        <div style={styles.userInfo}>
                                                  <span>Connected as: <strong style={{ color: '#fff' }}>{jiraUser?.displayName}</strong></span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                  <select style={styles.projectSelect} value={selectedProject} onChange={handleProjectChange}>
                                                            <option value="">Select Project</option>
                                                            {projects.map(p => (
                                                                      <option key={p.key} value={p.key}>{p.name} ({p.key})</option>
                                                            ))}
                                                  </select>

                                                  {selectedProject && (
                                                            <button style={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                                                                      + Create Issue
                                                            </button>
                                                  )}

                                                  <button style={styles.disconnectBtn} onClick={handleDisconnect}>
                                                            Disconnect
                                                  </button>
                                        </div>
                              </div>

                              {selectedProject ? (
                                        <div style={styles.kanbanBoard}>
                                                  {/* To Do Column */}
                                                  <div style={styles.column}>
                                                            <div style={styles.columnHeader}>
                                                                      <span style={styles.columnTitle}>To Do</span>
                                                                      <span style={styles.columnCount}>{groupedIssues.todo.length}</span>
                                                            </div>
                                                            {groupedIssues.todo.map(issue => (
                                                                      <div key={issue.key} style={styles.issueCard}>
                                                                                <div style={styles.issueKey}>{issue.key}</div>
                                                                                <div style={styles.issueSummary}>{issue.summary}</div>
                                                                                <div style={styles.issueFooter}>
                                                                                          <span style={styles.issueType}>{issue.issueType}</span>
                                                                                          <span style={styles.assignee}>{issue.assignee}</span>
                                                                                </div>
                                                                      </div>
                                                            ))}
                                                  </div>

                                                  {/* In Progress Column */}
                                                  <div style={styles.column}>
                                                            <div style={styles.columnHeader}>
                                                                      <span style={styles.columnTitle}>In Progress</span>
                                                                      <span style={styles.columnCount}>{groupedIssues.inProgress.length}</span>
                                                            </div>
                                                            {groupedIssues.inProgress.map(issue => (
                                                                      <div key={issue.key} style={styles.issueCard}>
                                                                                <div style={styles.issueKey}>{issue.key}</div>
                                                                                <div style={styles.issueSummary}>{issue.summary}</div>
                                                                                <div style={styles.issueFooter}>
                                                                                          <span style={styles.issueType}>{issue.issueType}</span>
                                                                                          <span style={styles.assignee}>{issue.assignee}</span>
                                                                                </div>
                                                                      </div>
                                                            ))}
                                                  </div>

                                                  {/* Done Column */}
                                                  <div style={styles.column}>
                                                            <div style={styles.columnHeader}>
                                                                      <span style={styles.columnTitle}>Done</span>
                                                                      <span style={styles.columnCount}>{groupedIssues.done.length}</span>
                                                            </div>
                                                            {groupedIssues.done.map(issue => (
                                                                      <div key={issue.key} style={styles.issueCard}>
                                                                                <div style={styles.issueKey}>{issue.key}</div>
                                                                                <div style={styles.issueSummary}>{issue.summary}</div>
                                                                                <div style={styles.issueFooter}>
                                                                                          <span style={styles.issueType}>{issue.issueType}</span>
                                                                                          <span style={styles.assignee}>{issue.assignee}</span>
                                                                                </div>
                                                                      </div>
                                                            ))}
                                                  </div>
                                        </div>
                              ) : (
                                        <div style={styles.emptyState}>
                                                  <p>Select a project to view issues</p>
                                        </div>
                              )}

                              {/* Create Issue Modal */}
                              {showCreateModal && (
                                        <div style={styles.modal}>
                                                  <div style={styles.modalContent}>
                                                            <div style={styles.modalHeader}>
                                                                      <h3 style={styles.modalTitle}>Create Issue</h3>
                                                                      <button style={styles.closeBtn} onClick={() => setShowCreateModal(false)}>×</button>
                                                            </div>

                                                            <form onSubmit={handleCreateIssue}>
                                                                      <div style={styles.inputGroup}>
                                                                                <label style={styles.label}>Issue Type</label>
                                                                                <select
                                                                                          style={styles.input}
                                                                                          value={newIssue.issueType}
                                                                                          onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value })}
                                                                                >
                                                                                          <option value="Task">Task</option>
                                                                                          <option value="Bug">Bug</option>
                                                                                          <option value="Story">Story</option>
                                                                                </select>
                                                                      </div>

                                                                      <div style={styles.inputGroup}>
                                                                                <label style={styles.label}>Summary</label>
                                                                                <input
                                                                                          type="text"
                                                                                          style={styles.input}
                                                                                          placeholder="What needs to be done?"
                                                                                          value={newIssue.summary}
                                                                                          onChange={(e) => setNewIssue({ ...newIssue, summary: e.target.value })}
                                                                                          required
                                                                                />
                                                                      </div>

                                                                      <div style={styles.inputGroup}>
                                                                                <label style={styles.label}>Description</label>
                                                                                <textarea
                                                                                          style={styles.textarea}
                                                                                          placeholder="Add more details..."
                                                                                          value={newIssue.description}
                                                                                          onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                                                                />
                                                                      </div>

                                                                      <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                                                                                {loading ? 'Creating...' : 'Create Issue'}
                                                                      </button>
                                                            </form>
                                                  </div>
                                        </div>
                              )}
                    </div>
          );
}

export default JiraPage;
