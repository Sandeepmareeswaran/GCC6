import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import * as slackService from '../services/slackService';
import { useLanguage } from '../context/LanguageContext';
import { DynamicText } from '../components/TranslatedText';
import './Slackpage.css';

const EMOJIS = ['👍', '👎', '😀', '🎉', '❤️', '👀', '🚀', '🙏'];
const EMOJI_NAMES = { '👍': 'thumbsup', '👎': 'thumbsdown', '😀': 'grinning', '🎉': 'tada', '❤️': 'heart', '👀': 'eyes', '🚀': 'rocket', '🙏': 'pray' };

function Slackpage() {
          const [isConnected, setIsConnected] = useState(false);
          const [loading, setLoading] = useState(false);
          const [initialLoading, setInitialLoading] = useState(true);
          const [error, setError] = useState('');
          const [botToken, setBotToken] = useState('');
          const [workspaceInfo, setWorkspaceInfo] = useState(null);
          const [currentView, setCurrentView] = useState('chat');
          const [activeTab, setActiveTab] = useState('channels');
          const [channels, setChannels] = useState([]);
          const [dms, setDms] = useState([]);
          const [selectedChannel, setSelectedChannel] = useState(null);
          const [messages, setMessages] = useState([]);
          const [users, setUsers] = useState({});
          const [newMessage, setNewMessage] = useState('');
          const [sending, setSending] = useState(false);
          const [files, setFiles] = useState([]);
          const [filesLoading, setFilesLoading] = useState(false);
          const [reminders, setReminders] = useState([]);
          const [reminderText, setReminderText] = useState('');
          const [reminderTime, setReminderTime] = useState('');
          const [expandedThreads, setExpandedThreads] = useState({});
          const [threadReplies, setThreadReplies] = useState({});
          const [replyInputs, setReplyInputs] = useState({});
          const [showEmojiPicker, setShowEmojiPicker] = useState(null);
          const { t } = useLanguage();

          useEffect(() => {
                    const loadConnection = async () => {
                              const userEmail = localStorage.getItem('userEmail');
                              if (!userEmail) { setInitialLoading(false); return; }
                              try {
                                        const docRef = doc(db, 'GCCslack', userEmail);
                                        const docSnap = await getDoc(docRef);
                                        if (docSnap.exists() && docSnap.data().connected) {
                                                  const data = docSnap.data();
                                                  slackService.saveCredentials(data.botToken);
                                                  setIsConnected(true);
                                                  setWorkspaceInfo({ team: data.team, user: data.user });
                                                  loadChannels(); loadUsers(); loadDMs(); loadReminders();
                                        }
                              } catch (err) { console.error('Error:', err); }
                              setInitialLoading(false);
                    };
                    loadConnection();
          }, []);

          const loadChannels = async () => {
                    try {
                              const result = await slackService.getChannels();
                              if (result.success) setChannels(result.channels || []);
                    } catch (err) { console.error('Error:', err); }
          };

          const loadDMs = async () => {
                    try {
                              const result = await slackService.getDMs();
                              if (result.success) setDms(result.dms || []);
                    } catch (err) { console.error('Error:', err); }
          };

          const loadUsers = async () => {
                    try {
                              const result = await slackService.getUsers();
                              if (result.success && result.users) {
                                        const userMap = {};
                                        result.users.forEach(u => { userMap[u.id] = u; });
                                        setUsers(userMap);
                              }
                    } catch (err) { console.error('Error:', err); }
          };

          const loadFiles = async () => {
                    setFilesLoading(true);
                    try {
                              const result = await slackService.getFiles();
                              if (result.success) setFiles(result.files || []);
                    } catch (err) { console.error('Error:', err); }
                    setFilesLoading(false);
          };

          const loadReminders = async () => {
                    try {
                              const result = await slackService.listReminders();
                              if (result.success) setReminders(result.reminders || []);
                    } catch (err) { console.error('Error:', err); }
          };

          const loadMessages = async (channelId) => {
                    setLoading(true);
                    setMessages([]);
                    try {
                              const result = await slackService.getMessages(channelId, 50);
                              if (result.success && result.messages) {
                                        const msgs = result.messages.reverse();
                                        setMessages(msgs);
                                        msgs.forEach(msg => {
                                                  if (msg.thread_ts && msg.reply_count > 0) {
                                                            loadThreadReplies(channelId, msg.ts);
                                                  }
                                        });
                              }
                    } catch (err) { console.error('Error:', err); }
                    setLoading(false);
          };

          const loadThreadReplies = async (channelId, threadTs) => {
                    try {
                              const result = await slackService.getReplies(channelId, threadTs);
                              if (result.success && result.messages) {
                                        setThreadReplies(prev => ({ ...prev, [threadTs]: result.messages.slice(1) }));
                              }
                    } catch (err) { console.error('Error:', err); }
          };

          const handleConnect = async (e) => {
                    e.preventDefault();
                    setError('');
                    setLoading(true);
                    try {
                              const result = await slackService.connectSlack(botToken);
                              if (result.success) {
                                        slackService.saveCredentials(botToken);
                                        setIsConnected(true);
                                        setWorkspaceInfo({ team: result.team, user: result.user });
                                        const userEmail = localStorage.getItem('userEmail');
                                        if (userEmail) {
                                                  await setDoc(doc(db, 'GCCslack', userEmail), {
                                                            connected: true, botToken, team: result.team, user: result.user, teamId: result.teamId, connectedAt: new Date().toISOString()
                                                  });
                                        }
                                        loadChannels(); loadUsers(); loadDMs(); loadReminders();
                              } else {
                                        setError(result.error || 'Failed to connect');
                              }
                    } catch (err) { setError('Connection failed'); }
                    setLoading(false);
          };

          const handleDisconnect = async () => {
                    slackService.clearCredentials();
                    setIsConnected(false);
                    setWorkspaceInfo(null);
                    setChannels([]); setSelectedChannel(null); setMessages([]);
                    const userEmail = localStorage.getItem('userEmail');
                    if (userEmail) await setDoc(doc(db, 'GCCslack', userEmail), { connected: false });
          };

          const handleChannelSelect = (channel) => {
                    setSelectedChannel(channel);
                    setCurrentView('chat');
                    loadMessages(channel.id);
          };

          const handleDMSelect = async (dm) => {
                    setSelectedChannel({ id: dm.id, name: users[dm.userId]?.realName || users[dm.userId]?.name || 'Direct Message', isDM: true });
                    setCurrentView('chat');
                    loadMessages(dm.id);
          };

          const handleSendMessage = async () => {
                    if (!newMessage.trim() || !selectedChannel) return;
                    setSending(true);
                    try {
                              const result = await slackService.sendMessage(selectedChannel.id, newMessage);
                              if (result.success) { setNewMessage(''); loadMessages(selectedChannel.id); }
                    } catch (err) { console.error('Error:', err); }
                    setSending(false);
          };

          const handleAddReaction = async (msg, emoji) => {
                    const emojiName = EMOJI_NAMES[emoji] || emoji.replace(/:/g, '');
                    try {
                              const result = await slackService.addReaction(selectedChannel.id, msg.ts, emojiName);
                              if (result.success) loadMessages(selectedChannel.id);
                    } catch (err) { console.error('Error:', err); }
                    setShowEmojiPicker(null);
          };

          const toggleThread = (msgTs) => {
                    setExpandedThreads(prev => ({ ...prev, [msgTs]: !prev[msgTs] }));
                    if (!threadReplies[msgTs] && selectedChannel) {
                              loadThreadReplies(selectedChannel.id, msgTs);
                    }
          };

          const handleSendReply = async (threadTs) => {
                    const replyText = replyInputs[threadTs];
                    if (!replyText?.trim() || !selectedChannel) return;
                    try {
                              await slackService.sendReply(selectedChannel.id, threadTs, replyText);
                              setReplyInputs(prev => ({ ...prev, [threadTs]: '' }));
                              loadThreadReplies(selectedChannel.id, threadTs);
                              loadMessages(selectedChannel.id);
                    } catch (err) { console.error('Error:', err); }
          };

          const handleAddReminder = async () => {
                    if (!reminderText.trim() || !reminderTime) return;
                    try {
                              const unixTime = Math.floor(new Date(reminderTime).getTime() / 1000);
                              await slackService.addReminder(reminderText, unixTime);
                              setReminderText(''); setReminderTime('');
                              loadReminders();
                    } catch (err) { console.error('Error:', err); }
          };

          const openFilesView = () => {
                    setCurrentView('files');
                    loadFiles();
          };

          const formatTime = (ts) => {
                    if (!ts) return '';
                    const date = typeof ts === 'number' ? new Date(ts * 1000) : new Date(parseFloat(ts) * 1000);
                    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          };

          const formatDate = (ts) => {
                    if (!ts) return '';
                    const date = new Date(ts * 1000);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          };

          const getUserName = (userId) => users[userId]?.realName || users[userId]?.displayName || users[userId]?.name || 'Unknown';
          const getUserInitials = (userId) => getUserName(userId).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          const getFileIcon = (mimetype) => {
                    if (mimetype?.includes('image')) return '🖼️';
                    if (mimetype?.includes('pdf')) return '📄';
                    if (mimetype?.includes('video')) return '🎬';
                    return '📁';
          };
          const formatFileSize = (bytes) => {
                    if (!bytes) return '';
                    if (bytes < 1024) return bytes + ' B';
                    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
          };

          if (initialLoading) return <div className="slack-loading">Loading...</div>;

          if (!isConnected) {
                    return (
                              <div className="slack-container">
                                        <h1 className="slack-title">Slack</h1>
                                        <div className="slack-connection-card">
                                                  <div className="slack-card-icon">💬</div>
                                                  <h2 className="slack-card-title">Connect Your Slack</h2>
                                                  <p className="slack-card-subtitle">Enter your Bot Token to connect</p>
                                                  {error && <p className="slack-error">{error}</p>}
                                                  <form onSubmit={handleConnect}>
                                                            <div className="slack-input-group">
                                                                      <label className="slack-label">Bot User OAuth Token</label>
                                                                      <input type="password" className="slack-input" placeholder="xoxb-your-token" value={botToken} onChange={(e) => setBotToken(e.target.value)} required />
                                                            </div>
                                                            <button type="submit" className="slack-btn-primary" disabled={loading}>
                                                                      {loading ? 'Connecting...' : 'Connect to Slack'}
                                                            </button>
                                                  </form>
                                        </div>
                              </div>
                    );
          }

          // FILES VIEW
          if (currentView === 'files') {
                    return (
                              <div className="slack-container">
                                        <div className="slack-header">
                                                  <h1 className="slack-title">Slack</h1>
                                                  <div className="slack-user-info">
                                                            <span className="slack-workspace-badge">{workspaceInfo?.team}</span>
                                                            <button className="slack-btn-disconnect" onClick={handleDisconnect}>Disconnect</button>
                                                  </div>
                                        </div>
                                        <div className="slack-main-layout">
                                                  <div className="slack-sidebar">
                                                            <div className="slack-tab-bar">
                                                                      <div className={`slack-tab ${activeTab === 'channels' ? 'active' : ''}`} onClick={() => { setActiveTab('channels'); setCurrentView('chat'); }}>Channels</div>
                                                                      <div className={`slack-tab ${activeTab === 'dms' ? 'active' : ''}`} onClick={() => { setActiveTab('dms'); setCurrentView('chat'); }}>DMs</div>
                                                                      <div className="slack-tab active" onClick={openFilesView}>Files</div>
                                                            </div>
                                                  </div>
                                                  <div className="slack-files-view">
                                                            <div className="slack-files-header">
                                                                      <h2 className="slack-files-title">📁 Files</h2>
                                                                      <button onClick={() => setCurrentView('chat')} className="slack-btn-secondary">← Back to Chat</button>
                                                            </div>
                                                            <div className="slack-files-grid">
                                                                      {filesLoading && <p className="slack-empty-text">Loading files...</p>}
                                                                      {!filesLoading && files.length === 0 && <p className="slack-empty-text">No files found in workspace</p>}
                                                                      {files.map(file => (
                                                                                <div key={file.id} className="slack-file-card" onClick={() => file.url && window.open(file.url, '_blank')}>
                                                                                          <div className="slack-file-preview">
                                                                                                    {file.thumb ? <img src={file.thumb} alt={file.name} /> : getFileIcon(file.mimetype)}
                                                                                          </div>
                                                                                          <div className="slack-file-info">{file.name || file.title || 'Untitled'}</div>
                                                                                          <div className="slack-file-meta">{formatFileSize(file.size)} • {formatDate(file.created)}</div>
                                                                                </div>
                                                                      ))}
                                                            </div>
                                                  </div>
                                        </div>
                              </div>
                    );
          }

          // CHAT VIEW
          return (
                    <div className="slack-container">
                              <div className="slack-header">
                                        <h1 className="slack-title">Slack</h1>
                                        <div className="slack-user-info">
                                                  <span className="slack-workspace-badge">{workspaceInfo?.team}</span>
                                                  <button className="slack-btn-disconnect" onClick={handleDisconnect}>Disconnect</button>
                                        </div>
                              </div>
                              <div className="slack-main-layout">
                                        <div className="slack-sidebar">
                                                  <div className="slack-tab-bar">
                                                            <div className={`slack-tab ${activeTab === 'channels' ? 'active' : ''}`} onClick={() => setActiveTab('channels')}>Channels</div>
                                                            <div className={`slack-tab ${activeTab === 'dms' ? 'active' : ''}`} onClick={() => setActiveTab('dms')}>DMs</div>
                                                            <div className="slack-tab" onClick={openFilesView}>Files</div>
                                                  </div>
                                                  <div className="slack-sidebar-content">
                                                            {activeTab === 'channels' && channels.map(channel => (
                                                                      <div key={channel.id} onClick={() => handleChannelSelect(channel)} className={`slack-channel-item ${selectedChannel?.id === channel.id ? 'active' : ''}`}>
                                                                                <span>{channel.isPrivate ? '🔒' : '#'}</span> {channel.name}
                                                                      </div>
                                                            ))}
                                                            {activeTab === 'dms' && dms.map(dm => (
                                                                      <div key={dm.id} onClick={() => handleDMSelect(dm)} className={`slack-dm-item ${selectedChannel?.id === dm.id ? 'active' : ''}`}>
                                                                                <div className="slack-dm-avatar">{getUserInitials(dm.userId)}</div>
                                                                                <span>{getUserName(dm.userId)}</span>
                                                                      </div>
                                                            ))}
                                                  </div>
                                        </div>

                                        <div className="slack-chat-area">
                                                  {selectedChannel ? (
                                                            <>
                                                                      <div className="slack-chat-header">
                                                                                <div className="slack-channel-name">
                                                                                          <span>{selectedChannel.isDM ? '👤' : (selectedChannel.isPrivate ? '🔒' : '#')}</span>
                                                                                          {selectedChannel.name}
                                                                                </div>
                                                                      </div>
                                                                      <div className="slack-messages-area">
                                                                                {loading && <p className="slack-empty-text">Loading...</p>}
                                                                                {!loading && messages.length === 0 && <p className="slack-empty-text">No messages yet. Start a conversation!</p>}
                                                                                {!loading && messages.map((msg, idx) => (
                                                                                          <div key={idx}>
                                                                                                    <div className="slack-message-item">
                                                                                                              <div className="slack-message-avatar">{getUserInitials(msg.user)}</div>
                                                                                                              <div className="slack-message-content">
                                                                                                                        <div className="slack-message-user">{getUserName(msg.user)}<span className="slack-message-time">{formatTime(msg.ts)}</span></div>
                                                                                                                        <div className="slack-message-text"><DynamicText>{msg.text || '[No text content]'}</DynamicText></div>
                                                                                                                        {msg.reactions && msg.reactions.length > 0 && (
                                                                                                                                  <div className="slack-reactions">
                                                                                                                                            {msg.reactions.map((r, i) => (
                                                                                                                                                      <span key={i} className="slack-reaction">
                                                                                                                                                                {r.name === 'thumbsup' ? '👍' : r.name === 'heart' ? '❤️' : r.name === 'tada' ? '🎉' : r.name === 'eyes' ? '👀' : `:${r.name}:`} {r.count}
                                                                                                                                                      </span>
                                                                                                                                            ))}
                                                                                                                                  </div>
                                                                                                                        )}
                                                                                                                        <div className="slack-message-actions">
                                                                                                                                  <div className="slack-emoji-picker-wrapper">
                                                                                                                                            <button className="slack-action-btn" onClick={() => setShowEmojiPicker(showEmojiPicker === msg.ts ? null : msg.ts)}>😀 {t('React')}</button>
                                                                                                                                            {showEmojiPicker === msg.ts && (
                                                                                                                                                      <div className="slack-emoji-picker">
                                                                                                                                                                {EMOJIS.map(e => (<span key={e} onClick={() => handleAddReaction(msg, e)}>{e}</span>))}
                                                                                                                                                      </div>
                                                                                                                                            )}
                                                                                                                                  </div>
                                                                                                                                  <button className="slack-action-btn" onClick={() => toggleThread(msg.ts)}>💬 {threadReplies[msg.ts]?.length || 0} {t('replies')}</button>
                                                                                                                        </div>
                                                                                                              </div>
                                                                                                    </div>
                                                                                                    {expandedThreads[msg.ts] && (
                                                                                                              <div className="slack-thread-replies">
                                                                                                                        {threadReplies[msg.ts]?.map((reply, rIdx) => (
                                                                                                                                  <div key={rIdx} className="slack-thread-reply">
                                                                                                                                            <div className="slack-thread-reply-avatar">{getUserInitials(reply.user)}</div>
                                                                                                                                            <div>
                                                                                                                                                      <div className="slack-thread-reply-user">{getUserName(reply.user)} <span>{formatTime(reply.ts)}</span></div>
                                                                                                                                                      <div className="slack-thread-reply-text"><DynamicText>{reply.text}</DynamicText></div>
                                                                                                                                            </div>
                                                                                                                                  </div>
                                                                                                                        ))}
                                                                                                                        <div className="slack-thread-reply-input">
                                                                                                                                  <input className="slack-input" placeholder="Reply in thread..." value={replyInputs[msg.ts] || ''} onChange={(e) => setReplyInputs(prev => ({ ...prev, [msg.ts]: e.target.value }))} onKeyPress={(e) => e.key === 'Enter' && handleSendReply(msg.ts)} />
                                                                                                                                  <button className="slack-btn-primary slack-btn-sm" onClick={() => handleSendReply(msg.ts)}>Reply</button>
                                                                                                                        </div>
                                                                                                              </div>
                                                                                                    )}
                                                                                          </div>
                                                                                ))}
                                                                      </div>
                                                                      <div className="slack-compose-area">
                                                                                <input className="slack-compose-input" placeholder={`Message ${selectedChannel.name}`} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
                                                                                <button className="slack-btn-primary" onClick={handleSendMessage} disabled={sending}>{sending ? '...' : t('Send')}</button>
                                                                      </div>
                                                            </>
                                                  ) : (
                                                            <div className="slack-empty-state">
                                                                      <div className="slack-empty-icon">💬</div>
                                                                      <p>{t('Select a channel or DM to start messaging')}</p>
                                                            </div>
                                                  )}
                                        </div>

                                        <div className="slack-right-panel">
                                                  <div className="slack-panel-header">⏰ Reminders</div>
                                                  <div className="slack-panel-content">
                                                            {reminders.length === 0 && <p className="slack-empty-text">No reminders set</p>}
                                                            {reminders.map(r => (
                                                                      <div key={r.id} className="slack-reminder-item">
                                                                                <div className="slack-reminder-text">{r.text}</div>
                                                                                <div className="slack-reminder-time">{r.time ? new Date(r.time * 1000).toLocaleString() : ''}</div>
                                                                      </div>
                                                            ))}
                                                            <div className="slack-reminder-form">
                                                                      <div className="slack-reminder-form-title">Add Reminder</div>
                                                                      <input className="slack-input" placeholder="What to remember?" value={reminderText} onChange={(e) => setReminderText(e.target.value)} />
                                                                      <input type="datetime-local" className="slack-input" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
                                                                      <button onClick={handleAddReminder} className="slack-btn-primary">Add</button>
                                                            </div>
                                                  </div>
                                        </div>
                              </div>
                    </div>
          );
}

export default Slackpage;