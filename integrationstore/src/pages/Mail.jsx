import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

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
  composeBtn: { width: '100%', padding: '14px 20px', background: '#22c55e', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  labelItem: { padding: '10px 14px', marginBottom: '4px', cursor: 'pointer', borderRadius: '8px', color: '#374151', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s' },
  labelItemActive: { background: '#dcfce7', color: '#16a34a', fontWeight: '600' },
  filterSection: { marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' },
  filterTitle: { fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '14px', fontWeight: '600' },
  messageList: { width: '360px', background: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto' },
  messageItem: { padding: '16px 20px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'all 0.2s' },
  messageItemHover: { background: '#f9fafb' },
  messageItemSelected: { background: '#f0fdf4', borderLeft: '3px solid #22c55e' },
  messageSender: { fontWeight: '600', fontSize: '14px', color: '#1e1e2d', marginBottom: '4px' },
  messageSubject: { fontSize: '13px', color: '#374151', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  messageSnippet: { fontSize: '12px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  messageDate: { fontSize: '11px', color: '#9ca3af', marginTop: '6px' },
  messagePreview: { flex: 1, padding: '24px', overflowY: 'auto', background: '#fff', margin: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  emailHeader: { marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' },
  emailSubject: { fontSize: '22px', fontWeight: '700', color: '#1e1e2d', marginBottom: '16px' },
  emailMeta: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '16px' },
  emailFrom: { fontSize: '14px', fontWeight: '600', color: '#1e1e2d' },
  emailTo: { fontSize: '12px', color: '#6b7280' },
  emailDate: { fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' },
  emailBody: { lineHeight: '1.7', fontSize: '14px', color: '#374151' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modalContent: { background: '#fff', borderRadius: '16px', padding: '30px', width: '550px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#1e1e2d' },
  closeBtn: { background: '#f3f4f6', border: 'none', color: '#6b7280', fontSize: '20px', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '8px' },
  input: { width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', color: '#1e1e2d', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '16px' },
  textarea: { width: '100%', padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', color: '#1e1e2d', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '180px', resize: 'vertical' },
  sendBtn: { padding: '12px 32px', background: '#22c55e', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' },
  label: { display: 'block', color: '#6b7280', fontSize: '13px', marginBottom: '6px', fontWeight: '500' },
  connectionCard: { background: '#fff', borderRadius: '16px', padding: '40px', maxWidth: '500px', margin: '40px auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' },
  cardTitle: { fontSize: '24px', fontWeight: '700', color: '#1e1e2d', marginBottom: '8px', textAlign: 'center' },
  cardSubtitle: { color: '#6b7280', textAlign: 'center', marginBottom: '30px', fontSize: '14px' },
  googleBtn: { width: '100%', padding: '14px 24px', background: '#fff', border: '2px solid #e5e7eb', borderRadius: '10px', color: '#1e1e2d', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px', transition: 'all 0.2s' },
  disconnectBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '13px', cursor: 'pointer' },
  stepsCard: { background: '#f0fdf4', borderRadius: '12px', padding: '20px', marginTop: '20px', border: '1px solid #bbf7d0' },
  stepsTitle: { fontSize: '14px', fontWeight: '600', color: '#16a34a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  stepItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px', fontSize: '13px', color: '#374151' },
  stepNumber: { width: '22px', height: '22px', borderRadius: '50%', background: '#22c55e', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
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
  const [compose, setCompose] = useState({ to: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
            if (testRes.ok) { setAccessToken(data.accessToken); setUserEmail(data.gmailEmail); }
          } catch (e) { console.log('Token invalid'); }
        }
      } catch (err) { console.error('Error loading:', err); }
      setInitialLoading(false);
    };
    loadSavedConnection();
  }, []);

  const login = useGoogleLogin({
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email'].join(' '),
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token;
      setAccessToken(token);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setUserEmail(data.email);
        const appUserEmail = localStorage.getItem('userEmail');
        if (appUserEmail) {
          await setDoc(doc(db, 'GCCemail', appUserEmail), { connected: true, gmailEmail: data.email, accessToken: token, connectedAt: new Date().toISOString() });
        }
      } catch (e) { console.error('Error:', e); }
    },
    onError: () => console.error('Login failed'),
  });

  const handleLogout = async () => {
    setAccessToken(null); setUserEmail(''); setLabels([]); setMessages([]); setSelected(null);
    const appUserEmail = localStorage.getItem('userEmail');
    if (appUserEmail) { await setDoc(doc(db, 'GCCemail', appUserEmail), { connected: false, disconnectedAt: new Date().toISOString() }); }
  };

  useEffect(() => { if (accessToken) loadLabels(); }, [accessToken]);
  useEffect(() => { if (accessToken) loadMessages(); }, [accessToken, selectedLabel, filter]);

  const loadLabels = async () => {
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (data.labels) setLabels(data.labels.filter(l => ['INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH', 'STARRED', 'IMPORTANT'].includes(l.id) || l.type === 'user'));
    } catch (e) { console.error('Error:', e); }
  };

  const loadMessages = async () => {
    setLoading(true); setSelected(null);
    try {
      let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&labelIds=${selectedLabel}`;
      if (filter === 'unread') url += '&q=is:unread';
      else if (filter === 'starred') url += '&q=is:starred';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (data.messages?.length) {
        const detailed = await Promise.all(data.messages.map(async m => {
          const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, { headers: { Authorization: `Bearer ${accessToken}` } });
          return r.json();
        }));
        setMessages(detailed);
      } else setMessages([]);
    } catch (e) { console.error('Error:', e); }
    finally { setLoading(false); }
  };

  const loadMessageDetail = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, { headers: { Authorization: `Bearer ${accessToken}` } });
      setSelected(await res.json());
    } catch (e) { console.error('Error:', e); }
    finally { setLoading(false); }
  };

  const handleSendEmail = async () => {
    if (!compose.to || !compose.subject) return;
    setSending(true);
    try {
      const email = [`To: ${compose.to}`, `Subject: ${compose.subject}`, 'Content-Type: text/plain; charset=utf-8', '', compose.body].join('\r\n');
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: encodeBody(email) })
      });
      if (res.ok) { setShowCompose(false); setCompose({ to: '', subject: '', body: '' }); if (selectedLabel === 'SENT') loadMessages(); }
    } catch (e) { console.error('Error:', e); }
    finally { setSending(false); }
  };

  if (initialLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280' }}>Loading...</div>;

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
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <div>Click "Sign in with Google" button above</div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>2</div>
              <div>Select your Gmail account from the popup</div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>3</div>
              <div>If you see a warning screen, click "Advanced" → "Go to app"</div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>4</div>
              <div>Grant permission to read and send emails</div>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepNumber}>5</div>
              <div>Your inbox will load automatically</div>
            </div>
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
        <button style={styles.composeBtn} onClick={() => setShowCompose(true)}>✏️ Compose</button>

        {labels.filter(l => ['INBOX', 'SENT', 'DRAFT', 'STARRED', 'SPAM', 'TRASH'].includes(l.id)).map(label => (
          <div key={label.id} onClick={() => setSelectedLabel(label.id)} style={{ ...styles.labelItem, ...(selectedLabel === label.id ? styles.labelItemActive : {}) }}>
            <span style={{ fontSize: '16px' }}>{labelIcons[label.id] || '📁'}</span>
            {label.name}
          </div>
        ))}

        <div style={styles.filterSection}>
          <div style={styles.filterTitle}>Quick Filters</div>
          {['all', 'unread', 'starred'].map(f => (
            <div key={f} onClick={() => setFilter(f)} style={{ ...styles.labelItem, ...(filter === f ? styles.labelItemActive : {}) }}>
              <span style={{ fontSize: '16px' }}>{f === 'all' ? '📋' : f === 'unread' ? '📬' : '⭐'}</span>
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
            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '13px' }}>
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
            {!loading && !messages.length && <p style={{ padding: '20px', color: '#9ca3af' }}>No emails found.</p>}
            {!loading && messages.map(m => {
              const from = selectedLabel === 'SENT' ? getHeader(m, 'To') : getHeader(m, 'From');
              const isUnread = m.labelIds?.includes('UNREAD');
              return (
                <div key={m.id} onClick={() => loadMessageDetail(m.id)} style={{ ...styles.messageItem, ...(selected?.id === m.id ? styles.messageItemSelected : {}) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isUnread && <div style={styles.unreadDot}></div>}
                    <div style={{ ...styles.messageSender, fontWeight: isUnread ? '700' : '600' }}>{extractDisplayName(from)}</div>
                  </div>
                  <div style={styles.messageSubject}>{getHeader(m, 'Subject') || '(No subject)'}</div>
                  <div style={styles.messageDate}>{new Date(getHeader(m, 'Date')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
              );
            })}
          </div>

          {/* Preview */}
          <div style={styles.messagePreview}>
            {selected ? <SelectedView message={selected} onReply={(to, subject) => { setCompose({ to, subject: `Re: ${subject}`, body: '' }); setShowCompose(true); }} /> : (
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
        <div style={styles.modal} onClick={() => setShowCompose(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>New Message</h3>
              <button style={styles.closeBtn} onClick={() => setShowCompose(false)}>×</button>
            </div>
            <div><label style={styles.label}>To</label><input type="email" style={styles.input} placeholder="recipient@example.com" value={compose.to} onChange={e => setCompose({ ...compose, to: e.target.value })} /></div>
            <div><label style={styles.label}>Subject</label><input type="text" style={styles.input} placeholder="Email subject" value={compose.subject} onChange={e => setCompose({ ...compose, subject: e.target.value })} /></div>
            <div><label style={styles.label}>Message</label><textarea style={styles.textarea} placeholder="Write your message..." value={compose.body} onChange={e => setCompose({ ...compose, body: e.target.value })} /></div>
            <button style={styles.sendBtn} onClick={handleSendEmail} disabled={sending}>{sending ? 'Sending...' : '📤 Send Email'}</button>
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
      if (part.mimeType === 'text/html' && part.body?.data) { body = decodeBody(part.body.data); isHtml = true; break; }
      if (!body && part.mimeType === 'text/plain' && part.body?.data) body = decodeBody(part.body.data);
    }
  } else if (message.payload?.body?.data) body = decodeBody(message.payload.body.data);

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
      <button onClick={() => onReply(extractEmailAddress(from), subject)} style={{ ...styles.sendBtn, marginBottom: '20px', padding: '10px 20px', fontSize: '13px' }}>↩️ Reply</button>
      <div style={styles.emailBody}>
        {isHtml ? <iframe title="email-body" style={{ width: '100%', height: '50vh', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }} srcDoc={body} /> : <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{body}</pre>}
      </div>
    </div>
  );
}

export default Mail;