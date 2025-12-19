import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import EmojiPicker from 'emoji-picker-react';

// Decode base64url body
function decodeBody(encoded) {
  if (!encoded) return '';
  try {
    return atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return encoded;
  }
}

// Encode to base64url for sending
function encodeBody(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Extract email address
function extractEmailAddress(headerValue) {
  if (!headerValue) return '';
  const match = headerValue.match(/<([^>]+)>/);
  return match ? match[1] : headerValue;
}

// Extract display name
function extractDisplayName(headerValue) {
  if (!headerValue) return '';
  const match = headerValue.match(/^([^<]+)</);
  return match ? match[1].trim().replace(/"/g, '') : extractEmailAddress(headerValue);
}

const styles = {
  container: { display: 'flex', height: '100vh', background: '#f5f5f5' },
  sidebar: { width: '240px', background: '#fff', borderRight: '1px solid #e5e7eb', padding: '20px', overflowY: 'auto' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: '#f9fafb' },
  header: { padding: '16px 24px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1e1e2d', margin: 0 },
  userEmail: { fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '10px' },

  composeBtn: {
    width: '100%', padding: '14px 20px', background: '#22c55e', border: 'none',
    borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px'
  },

  labelItem: {
    padding: '10px 14px', marginBottom: '4px', cursor: 'pointer', borderRadius: '8px',
    color: '#374151', fontSize: '14px', display: 'flex', alignItems: 'center',
    gap: '10px', transition: 'all 0.2s'
  },
  labelItemActive: { background: '#dcfce7', color: '#16a34a', fontWeight: '600' },
  filterSection: { marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' },
  filterTitle: {
    fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase',
    letterSpacing: '1px', marginBottom: '12px', paddingLeft: '14px', fontWeight: '600'
  },

  messageList: { width: '360px', background: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto' },
  messageItem: { padding: '16px 20px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'all 0.2s' },
  messageItemSelected: { background: '#f0fdf4', borderLeft: '3px solid #22c55e' },
  messageSender: { fontWeight: '600', fontSize: '14px', color: '#1e1e2d', marginBottom: '4px' },
  messageSubject: {
    fontSize: '13px', color: '#374151', marginBottom: '4px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
  },
  messageDate: { fontSize: '11px', color: '#9ca3af', marginTop: '6px' },

  messagePreview: {
    flex: 1, padding: '24px', overflowY: 'auto', background: '#fff',
    margin: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },

  emailHeader: { marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' },
  emailSubject: { fontSize: '22px', fontWeight: '700', color: '#1e1e2d', marginBottom: '16px' },
  emailMeta: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  avatar: {
    width: '44px', height: '44px', borderRadius: '50%', background: '#22c55e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: '600', fontSize: '16px'
  },
  emailFrom: { fontSize: '14px', fontWeight: '600', color: '#1e1e2d' },
  emailTo: { fontSize: '12px', color: '#6b7280' },
  emailDate: { fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' },
  emailBody: { lineHeight: '1.7', fontSize: '14px', color: '#374151' },

  // smaller centered modal
  modal: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000
  },
  modalContent: {
    background: '#fff', borderRadius: '16px', padding: '24px',
    width: '620px', maxWidth: '90%', maxHeight: '80vh',
    overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#1e1e2d' },
  closeBtn: {
    background: '#f3f4f6', border: 'none', color: '#6b7280',
    fontSize: '20px', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px'
  },

  input: {
    width: '100%', padding: '10px 14px', background: '#f9fafb',
    border: '1px solid #e5e7eb', borderRadius: '10px',
    color: '#1e1e2d', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', marginBottom: '10px'
  },
  textarea: {
    width: '100%', padding: '10px 14px', background: '#f9fafb',
    border: '1px solid #e5e7eb', borderRadius: '10px',
    color: '#1e1e2d', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', minHeight: '160px', resize: 'vertical'
  },
  sendBtn: {
    padding: '10px 24px', background: '#22c55e', border: 'none',
    borderRadius: '10px', color: '#fff', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', marginTop: '12px'
  },
  label: { display: 'block', color: '#6b7280', fontSize: '13px', marginBottom: '4px', fontWeight: '500' },

  connectionCard: {
    background: '#fff', borderRadius: '16px', padding: '40px',
    maxWidth: '500px', margin: '40px auto',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'
  },
  cardTitle: { fontSize: '24px', fontWeight: '700', color: '#1e1e2d', marginBottom: '8px', textAlign: 'center' },
  cardSubtitle: { color: '#6b7280', textAlign: 'center', marginBottom: '30px', fontSize: '14px' },
  googleBtn: {
    width: '100%', padding: '14px 24px', background: '#fff',
    border: '2px solid #e5e7eb', borderRadius: '10px',
    color: '#1e1e2d', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '12px', marginBottom: '24px'
  },
  disconnectBtn: {
    padding: '6px 12px', background: 'transparent',
    border: '1px solid #ef4444', borderRadius: '8px',
    color: '#ef4444', fontSize: '12px', cursor: 'pointer'
  },

  stepsCard: { background: '#f0fdf4', borderRadius: '12px', padding: '20px', marginTop: '20px', border: '1px solid #bbf7d0' },
  stepsTitle: { fontSize: '14px', fontWeight: '600', color: '#16a34a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  stepItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px', fontSize: '13px', color: '#374151' },
  stepNumber: {
    width: '22px', height: '22px', borderRadius: '50%', background: '#22c55e',
    color: '#fff', fontSize: '12px', fontWeight: '600',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },

  emptyState: { textAlign: 'center', marginTop: '80px', color: '#9ca3af' },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 },
};

const labelIcons = { INBOX: '📥', SENT: '📤', DRAFT: '📝', SPAM: '⚠️', TRASH: '🗑️', STARRED: '⭐', IMPORTANT: '🔔' };

function Mail() {
  const [accessToken, setAccessToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [labels, setLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('INBOX');
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ to: '', cc: '', bcc: '', subject: '', body: '' });
  const [attachments, setAttachments] = useState([]);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);

  // load saved connection
  useEffect(() => {
    const loadSavedConnection = async () => {
      const appUserEmail = localStorage.getItem('userEmail');
      if (!appUserEmail) { setInitialLoading(false); return; }
      try {
        const docRef = doc(db, 'GCCemail', appUserEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().connected) {
          const data = docSnap.data();
          try {
            const testRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
              headers: { Authorization: `Bearer ${data.accessToken}` }
            });
            if (testRes.ok) {
              setAccessToken(data.accessToken);
              setUserEmail(data.gmailEmail);
            }
          } catch {
            console.log('Token invalid');
          }
        }
      } catch (err) {
        console.error('Error loading:', err);
      }
      setInitialLoading(false);
    };
    loadSavedConnection();
  }, []);

  // google login
  const login = useGoogleLogin({
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token;
      setAccessToken(token);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUserEmail(data.email);
        const appUserEmail = localStorage.getItem('userEmail');
        if (appUserEmail) {
          await setDoc(doc(db, 'GCCemail', appUserEmail), {
            connected: true,
            gmailEmail: data.email,
            accessToken: token,
            connectedAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.error('Error:', e);
      }
    },
    onError: () => console.error('Login failed'),
  });

  const handleLogout = async () => {
    setAccessToken(null);
    setUserEmail('');
    setLabels([]);
    setMessages([]);
    setSelected(null);
    const appUserEmail = localStorage.getItem('userEmail');
    if (appUserEmail) {
      await setDoc(doc(db, 'GCCemail', appUserEmail), {
        connected: false,
        disconnectedAt: new Date().toISOString()
      });
    }
  };

  useEffect(() => { if (accessToken) loadLabels(); }, [accessToken]);
  useEffect(() => { if (accessToken) loadMessages(); }, [accessToken, selectedLabel, filter]);

  const loadLabels = async () => {
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      if (data.labels) {
        setLabels(
          data.labels.filter(
            l =>
              ['INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH', 'STARRED', 'IMPORTANT'].includes(l.id) ||
              l.type === 'user'
          )
        );
      }
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    setSelected(null);
    try {
      let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&labelIds=${selectedLabel}`;
      if (filter === 'unread') url += '&q=is:unread';
      else if (filter === 'starred') url += '&q=is:starred';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (data.messages?.length) {
        const detailed = await Promise.all(
          data.messages.map(async m => {
            const r = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            return r.json();
          })
        );
        setMessages(detailed);
      } else setMessages([]);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessageDetail = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSelected(await res.json());
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  // attachments
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // simple formatter (wraps html tags)
  const handleFormat = (command) => {
    const textarea = document.getElementById('email-body');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = compose.body.substring(start, end);
    let newText = selectedText;
    if (command === 'bold') newText = `<b>${selectedText}</b>`;
    if (command === 'italic') newText = `<i>${selectedText}</i>`;
    if (command === 'underline') newText = `<u>${selectedText}</u>`;
    setCompose({
      ...compose,
      body: compose.body.substring(0, start) + newText + compose.body.substring(end),
    });
  };

    const insertEmoji = (emojiData /* EmojiClickData */, event) => {
    const emojiChar = emojiData.emoji;
    setCompose(prev => ({ ...prev, body: prev.body + emojiChar }));
    setShowEmojiPicker(false); // close emoji popup
  };


  const handleSendEmail = async () => {
    if (!compose.to || !compose.subject) return;
    setSending(true);
    try {
      let raw;
      if (!attachments.length) {
        const email = [
          `To: ${compose.to}`,
          compose.cc && `Cc: ${compose.cc}`,
          compose.bcc && `Bcc: ${compose.bcc}`,
          `Subject: ${compose.subject}`,
          'Content-Type: text/html; charset=utf-8',
          '',
          compose.body,
        ].filter(Boolean).join('\r\n');
        raw = encodeBody(email);
      } else {
        const boundary = 'mixed_' + Date.now();
        const lines = [];
        lines.push(`To: ${compose.to}`);
        compose.cc && lines.push(`Cc: ${compose.cc}`);
        compose.bcc && lines.push(`Bcc: ${compose.bcc}`);
        lines.push(`Subject: ${compose.subject}`);
        lines.push('MIME-Version: 1.0');
        lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
        lines.push('');
        // text part
        lines.push(`--${boundary}`);
        lines.push('Content-Type: text/html; charset="UTF-8"');
        lines.push('Content-Transfer-Encoding: 7bit');
        lines.push('');
        lines.push(compose.body || '');
        lines.push('');
        // attachments
        for (const file of attachments) {
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64File = btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
          lines.push(`--${boundary}`);
          lines.push(`Content-Type: ${file.type || 'application/octet-stream'}; name="${file.name}"`);
          lines.push('Content-Transfer-Encoding: base64');
          lines.push(`Content-Disposition: attachment; filename="${file.name}"`);
          lines.push('');
          lines.push(base64File);
          lines.push('');
        }
        lines.push(`--${boundary}--`);
        const mime = lines.join('\r\n');
        raw = encodeBody(mime);
      }

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      });

      if (res.ok) {
        setShowCompose(false);
        setCompose({ to: '', cc: '', bcc: '', subject: '', body: '' });
        setAttachments([]);
        setShowEmojiPicker(false);
        if (selectedLabel === 'SENT') loadMessages();
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setSending(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div style={{ padding: '20px', background: '#f9fafb', minHeight: '100vh' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e1e2d', marginBottom: '20px' }}>Mail</h1>
        <div style={styles.connectionCard}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>📧</div>
          <h2 style={styles.cardTitle}>Connect Your Gmail</h2>
          <p style={styles.cardSubtitle}>Access and manage your emails directly from this dashboard</p>
          <button onClick={() => login()} style={styles.googleBtn}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', height: '20px' }} />
            Sign in with Google
          </button>
          <div style={styles.stepsCard}>
            <div style={styles.stepsTitle}>📋 Steps to Connect</div>
            <div style={styles.stepItem}><div style={styles.stepNumber}>1</div><div>Click "Sign in with Google"</div></div>
            <div style={styles.stepItem}><div style={styles.stepNumber}>2</div><div>Select your Gmail account</div></div>
            <div style={styles.stepItem}><div style={styles.stepNumber}>3</div><div>If warning, click Advanced → Go to app</div></div>
            <div style={styles.stepItem}><div style={styles.stepNumber}>4</div><div>Grant read and send permissions</div></div>
            <div style={styles.stepItem}><div style={styles.stepNumber}>5</div><div>Your inbox will load automatically</div></div>
          </div>
          <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '20px' }}>
            🔒 Your data is secure. We only access emails with your permission.
          </p>
        </div>
      </div>
    );
  }

  const getHeader = (msg, name) => msg.payload?.headers?.find(h => h.name === name)?.value || '';

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button
          style={styles.composeBtn}
          onClick={() => {
            setCompose({ to: '', cc: '', bcc: '', subject: '', body: '' });
            setAttachments([]);
            setShowEmojiPicker(false);
            setShowCompose(true);
          }}
        >
          ✏️ Compose
        </button>

        {labels
          .filter(l => ['INBOX', 'SENT', 'DRAFT', 'STARRED', 'SPAM', 'TRASH'].includes(l.id))
          .map(label => (
            <div
              key={label.id}
              onClick={() => setSelectedLabel(label.id)}
              style={{
                ...styles.labelItem,
                ...(selectedLabel === label.id ? styles.labelItemActive : {})
              }}
            >
              <span style={{ fontSize: '16px' }}>{labelIcons[label.id] || '📁'}</span>
              {label.name}
            </div>
          ))}

        <div style={styles.filterSection}>
          <div style={styles.filterTitle}>Quick Filters</div>
          {['all', 'unread', 'starred'].map(f => (
            <div
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.labelItem,
                ...(filter === f ? styles.labelItemActive : {})
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {f === 'all' ? '📋' : f === 'unread' ? '📬' : '⭐'}
              </span>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Mail</h1>
          <div style={styles.userEmail}>
            <span style={{
              width: '32px', height: '32px', borderRadius: '50%', background: '#22c55e',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '600', fontSize: '13px'
            }}>
              {userEmail.charAt(0).toUpperCase()}
            </span>
            {userEmail}
            <button style={styles.disconnectBtn} onClick={handleLogout}>Disconnect</button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Message List */}
          <div style={styles.messageList}>
            {loading && <p style={{ padding: '20px', color: '#9ca3af' }}>Loading...</p>}
            {!loading && !messages.length && (
              <p style={{ padding: '20px', color: '#9ca3af' }}>No emails found.</p>
            )}
            {!loading && messages.map(m => {
              const from = selectedLabel === 'SENT' ? getHeader(m, 'To') : getHeader(m, 'From');
              const isUnread = m.labelIds?.includes('UNREAD');
              return (
                <div
                  key={m.id}
                  onClick={() => loadMessageDetail(m.id)}
                  style={{
                    ...styles.messageItem,
                    ...(selected?.id === m.id ? styles.messageItemSelected : {})
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isUnread && <div style={styles.unreadDot} />}
                    <div style={{
                      ...styles.messageSender,
                      fontWeight: isUnread ? '700' : '600'
                    }}>
                      {extractDisplayName(from)}
                    </div>
                  </div>
                  <div style={styles.messageSubject}>
                    {getHeader(m, 'Subject') || '(No subject)'}
                  </div>
                  <div style={styles.messageDate}>
                    {new Date(getHeader(m, 'Date')).toLocaleDateString(
                      'en-US',
                      { month: 'short', day: 'numeric' }
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Preview */}
          <div style={styles.messagePreview}>
            {selected ? (
              <SelectedView
                message={selected}
                onReply={(to, subject) => {
                  setCompose({ to, cc: '', bcc: '', subject: `Re: ${subject}`, body: '' });
                  setAttachments([]);
                  setShowEmojiPicker(false);
                  setShowCompose(true);
                }}
              />
            ) : (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>📭</div>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>Select an email to view</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div style={styles.modal} onClick={() => { setShowCompose(false); setShowEmojiPicker(false); }}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New message</h3>
              <button
                style={styles.closeBtn}
                onClick={() => { setShowCompose(false); setShowEmojiPicker(false); }}
              >
                ×
              </button>
            </div>

            <div>
              <label style={styles.label}>To</label>
              <input
                type="email"
                style={styles.input}
                value={compose.to}
                onChange={e => setCompose({ ...compose, to: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Cc</label>
              <input
                type="email"
                style={styles.input}
                value={compose.cc}
                onChange={e => setCompose({ ...compose, cc: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Bcc</label>
              <input
                type="email"
                style={styles.input}
                value={compose.bcc}
                onChange={e => setCompose({ ...compose, bcc: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Subject</label>
              <input
                type="text"
                style={styles.input}
                value={compose.subject}
                onChange={e => setCompose({ ...compose, subject: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Message</label>
              <textarea
                id="email-body"
                style={styles.textarea}
                value={compose.body}
                onChange={e => setCompose({ ...compose, body: e.target.value })}
              />
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px', gap: '8px' }}>
              <button
                type="button"
                style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => handleFormat('bold')}
              >
                B
              </button>
              <button
                type="button"
                style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontStyle: 'italic' }}
                onClick={() => handleFormat('italic')}
              >
                I
              </button>
              <button
                type="button"
                style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#f3f4f6', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => handleFormat('underline')}
              >
                U
              </button>

              {/* Attach */}
              <button
                type="button"
                style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#f3f4f6', cursor: 'pointer' }}
                onClick={() => document.getElementById('attachment-input')?.click()}
              >
                📎
              </button>
              <input
                id="attachment-input"
                type="file"
                style={{ display: 'none' }}
                multiple
                onChange={handleAttachmentChange}
              />

              {/* Emoji */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: '#f3f4f6', cursor: 'pointer' }}
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                >
                  🙂
                </button>
                {showEmojiPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '40px',
                      left: 0,
                      zIndex: 3000
                    }}
                  >
                    <EmojiPicker onEmojiClick={insertEmoji} />
                  </div>
                )}
              </div>
            </div>

            {/* attachments chips */}
            {attachments.length > 0 && (
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '999px',
                      background: '#f3f4f6', fontSize: '12px'
                    }}
                  >
                    <span>📄 {file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                style={styles.sendBtn}
                onClick={handleSendEmail}
                disabled={sending}
              >
                {sending ? 'Sending...' : '📤 Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectedView({ message, onReply }) {
  const headers = message.payload?.headers || [];
  const findHeader = name => headers.find(h => h.name === name)?.value || '';
  const subject = findHeader('Subject') || '(No subject)';
  const from = findHeader('From');
  const to = findHeader('To');
  const date = findHeader('Date');

  let body = '';
  let isHtml = false;

  if (message.payload?.parts?.length) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        body = decodeBody(part.body.data);
        isHtml = true;
        break;
      }
      if (!body && part.mimeType === 'text/plain' && part.body?.data) {
        body = decodeBody(part.body.data);
      }
    }
  } else if (message.payload?.body?.data) {
    body = decodeBody(message.payload.body.data);
  }

  const initials = extractDisplayName(from).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div>
      <div style={styles.emailHeader}>
        <h2 style={styles.emailSubject}>{subject}</h2>
        <div style={styles.emailMeta}>
          <div style={styles.avatar}>{initials || '?'}</div>
          <div>
            <div style={styles.emailFrom}>{extractDisplayName(from)}</div>
            <div style={styles.emailTo}>to {extractEmailAddress(to)}</div>
          </div>
          <div style={styles.emailDate}>{new Date(date).toLocaleString()}</div>
        </div>
      </div>
      <button
        onClick={() => onReply(extractEmailAddress(from), subject)}
        style={{ ...styles.sendBtn, marginBottom: '16px', padding: '8px 18px', fontSize: '13px' }}
      >
        ↩️ Reply
      </button>
      <div style={styles.emailBody}>
        {isHtml ? (
          <iframe
            title="email-body"
            style={{
              width: '100%', height: '50vh',
              border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff'
            }}
            srcDoc={body}
          />
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{body}</pre>
        )}
      </div>
    </div>
  );
}

export default Mail;
