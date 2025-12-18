import React, { useState } from 'react';

function Mail() {
          const [selectedFolder, setSelectedFolder] = useState('inbox');

          const styles = {
                    container: {
                              padding: '10px',
                    },
                    header: {
                              marginBottom: '30px',
                    },
                    title: {
                              fontSize: '28px',
                              fontWeight: '700',
                              color: '#1e1e2d',
                              marginBottom: '5px',
                    },
                    subtitle: {
                              fontSize: '14px',
                              color: '#6b7280',
                    },
                    layout: {
                              display: 'grid',
                              gridTemplateColumns: '250px 1fr',
                              gap: '20px',
                    },
                    sidebar: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '20px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                    },
                    composeBtn: {
                              width: '100%',
                              padding: '14px',
                              background: '#22c55e',
                              border: 'none',
                              borderRadius: '10px',
                              color: '#fff',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              marginBottom: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                    },
                    folderList: {
                              listStyle: 'none',
                              padding: 0,
                              margin: 0,
                    },
                    folderItem: {
                              padding: '12px 16px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '4px',
                              transition: 'all 0.2s',
                              fontSize: '14px',
                              color: '#374151',
                    },
                    folderItemActive: {
                              background: '#f0fdf4',
                              color: '#16a34a',
                              fontWeight: '600',
                    },
                    badge: {
                              background: '#22c55e',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '600',
                    },
                    mailList: {
                              background: '#ffffff',
                              borderRadius: '16px',
                              padding: '20px',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                              border: '1px solid #e5e7eb',
                    },
                    mailItem: {
                              padding: '16px',
                              borderBottom: '1px solid #f3f4f6',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              display: 'flex',
                              gap: '16px',
                              alignItems: 'flex-start',
                    },
                    avatar: {
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: '#22c55e',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: '600',
                              fontSize: '14px',
                              flexShrink: 0,
                    },
                    mailContent: {
                              flex: 1,
                              minWidth: 0,
                    },
                    mailHeader: {
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '4px',
                    },
                    sender: {
                              fontWeight: '600',
                              color: '#1e1e2d',
                              fontSize: '14px',
                    },
                    time: {
                              fontSize: '12px',
                              color: '#6b7280',
                    },
                    subject: {
                              fontWeight: '500',
                              color: '#374151',
                              marginBottom: '4px',
                              fontSize: '14px',
                    },
                    preview: {
                              color: '#6b7280',
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                    },
                    emptyState: {
                              textAlign: 'center',
                              padding: '60px',
                              color: '#6b7280',
                    },
          };

          const folders = [
                    { id: 'inbox', name: 'Inbox', count: 12, icon: '📥' },
                    { id: 'sent', name: 'Sent', count: 0, icon: '📤' },
                    { id: 'drafts', name: 'Drafts', count: 3, icon: '📝' },
                    { id: 'starred', name: 'Starred', count: 5, icon: '⭐' },
                    { id: 'trash', name: 'Trash', count: 0, icon: '🗑️' },
          ];

          const emails = [
                    { id: 1, sender: 'Team Jira', email: 'noreply@atlassian.com', subject: 'New issue assigned to you', preview: 'KAN-3 has been assigned to you. Please review the requirements...', time: '10:30 AM', unread: true },
                    { id: 2, sender: 'GitHub', email: 'notifications@github.com', subject: 'Pull request merged', preview: 'Your pull request #42 has been merged into main branch...', time: '9:15 AM', unread: true },
                    { id: 3, sender: 'Slack', email: 'notification@slack.com', subject: 'New message in #general', preview: 'John mentioned you in a message: Hey, can you check...', time: 'Yesterday', unread: false },
                    { id: 4, sender: 'Firebase', email: 'noreply@firebase.google.com', subject: 'Your usage report', preview: 'Your monthly Firebase usage report is ready to view...', time: 'Yesterday', unread: false },
          ];

          return (
                    <div style={styles.container}>
                              <div style={styles.header}>
                                        <h1 style={styles.title}>Mail</h1>
                                        <p style={styles.subtitle}>Manage your emails and communications</p>
                              </div>

                              <div style={styles.layout}>
                                        <div style={styles.sidebar}>
                                                  <button style={styles.composeBtn}>
                                                            <span>✏️</span> Compose
                                                  </button>
                                                  <ul style={styles.folderList}>
                                                            {folders.map(folder => (
                                                                      <li
                                                                                key={folder.id}
                                                                                style={{
                                                                                          ...styles.folderItem,
                                                                                          ...(selectedFolder === folder.id ? styles.folderItemActive : {}),
                                                                                }}
                                                                                onClick={() => setSelectedFolder(folder.id)}
                                                                      >
                                                                                <span>{folder.icon} {folder.name}</span>
                                                                                {folder.count > 0 && <span style={styles.badge}>{folder.count}</span>}
                                                                      </li>
                                                            ))}
                                                  </ul>
                                        </div>

                                        <div style={styles.mailList}>
                                                  {emails.map(email => (
                                                            <div key={email.id} style={{ ...styles.mailItem, background: email.unread ? '#f0fdf4' : 'transparent' }}>
                                                                      <div style={styles.avatar}>{email.sender[0]}</div>
                                                                      <div style={styles.mailContent}>
                                                                                <div style={styles.mailHeader}>
                                                                                          <span style={styles.sender}>{email.sender}</span>
                                                                                          <span style={styles.time}>{email.time}</span>
                                                                                </div>
                                                                                <div style={styles.subject}>{email.subject}</div>
                                                                                <div style={styles.preview}>{email.preview}</div>
                                                                      </div>
                                                            </div>
                                                  ))}
                                        </div>
                              </div>
                    </div>
          );
}

export default Mail;
