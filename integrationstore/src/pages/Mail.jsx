import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

// Decode base64url body
function decodeBody(encoded) {
  if (!encoded) return '';
  try {
    return atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return encoded;
  }
}

// Extract email address from "Name <email>" format
function extractEmailAddress(headerValue) {
  if (!headerValue) return '';
  const match = headerValue.match(/<([^>]+)>/);
  return match ? match[1] : headerValue;
}

function Mail() {
  const [accessToken, setAccessToken] = useState(null);
  const [labels, setLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('INBOX');
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const login = useGoogleLogin({
  scope: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send', // add send
  ].join(' '),
  onSuccess: (tokenResponse) => {
    console.log('TOKEN RESPONSE', tokenResponse);
    setAccessToken(tokenResponse.access_token);
  },
  onError: () => {
    console.error('Login failed');
  },
});


  useEffect(() => {
    if (!accessToken) return;
    loadLabels();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    loadMessages();
  }, [accessToken, selectedLabel, filter]);

  const loadLabels = async () => {
    try {
      const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/labels',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();
      console.log('LABELS RESPONSE', data);
      if (!data.labels) {
        setLabels([]);
        return;
      }
      const wanted = data.labels.filter(
        (l) =>
          ['INBOX', 'SENT', 'DRAFT', 'SPAM', 'TRASH', 'STARRED', 'IMPORTANT'].includes(
            l.id
          ) || l.type === 'user'
      );
      setLabels(wanted);
    } catch (e) {
      console.error('Error loading labels', e);
    }
  };

  const buildListUrl = () => {
    const base =
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25';
    const params = [];

    if (selectedLabel) {
      params.push(`labelIds=${encodeURIComponent(selectedLabel)}`);
    }

    if (filter === 'unread') {
      params.push('q=' + encodeURIComponent('is:unread'));
    } else if (filter === 'spam') {
      params.push('q=' + encodeURIComponent('in:spam'));
    } else if (filter === 'starred') {
      params.push('q=' + encodeURIComponent('is:starred'));
    }

    if (!params.length) return base;
    return base + '&' + params.join('&');
  };

  const loadMessages = async () => {
    setLoading(true);
    setSelected(null);
    try {
      const url = buildListUrl();
      console.log('LIST URL', url);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      console.log('LIST RESPONSE', data);

      if (!data.messages || !data.messages.length) {
        setMessages([]);
        return;
      }

      const detailed = await Promise.all(
  data.messages.map(async (m) => {
    const r = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return r.json();
  })
);

      setMessages(detailed);
    } catch (e) {
      console.error('Error loading messages', e);
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
      const data = await res.json();
      console.log('MESSAGE DETAIL', data);
      setSelected(data);
    } catch (e) {
      console.error('Error loading message detail', e);
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div style={{ padding: '24px', color: '#fff' }}>
        <h1>Mail</h1>
        <h2>Connect your Gmail</h2>
        <p>Click below to sign in and load your inbox.</p>
        <button
          onClick={() => login()}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            background: '#4285f4',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const getHeader = (msg, name) =>
    msg.payload?.headers?.find((h) => h.name === name)?.value || '';

  return (
    <div style={{ display: 'flex', height: '100vh', color: '#fff' }}>
      {/* Left: labels + filters */}
      <div style={{ width: '220px', borderRight: '1px solid #333', padding: '16px' }}>
        <h2 style={{ marginBottom: '12px' }}>Folders</h2>
        {labels.map((label) => (
          <div
            key={label.id}
            onClick={() => setSelectedLabel(label.id)}
            style={{
              padding: '6px 8px',
              marginBottom: '4px',
              cursor: 'pointer',
              borderRadius: '6px',
              background:
                selectedLabel === label.id ? '#444' : 'transparent',
            }}
          >
            {label.name}
          </div>
        ))}

        <h3 style={{ marginTop: '20px' }}>Filter</h3>
        {['all', 'unread', 'starred', 'spam'].map((f) => (
          <div
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: '6px',
              background: filter === f ? '#555' : 'transparent',
              textTransform: 'capitalize',
              fontSize: '14px',
            }}
          >
            {f}
          </div>
        ))}
      </div>

      {/* Middle + right */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #333' }}>
          <h1>Mail</h1>
          <p>
            Label: {selectedLabel} | Filter: {filter}
          </p>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {/* Message list */}
          <div
            style={{
              flex: 1,
              maxWidth: '40%',
              borderRight: '1px solid #333',
              overflowY: 'auto',
            }}
          >
            {loading && <p style={{ padding: '12px' }}>Loading…</p>}
            {!loading && !messages.length && (
              <p style={{ padding: '12px' }}>No emails found.</p>
            )}

            {!loading &&
              messages.map((m) => {
                // Determine which email to display as the main line
                const getMetadataHeader = (headerName) => {
                  return m.payload?.headers?.find((h) => h.name === headerName)?.value || '';
                };

                let mainEmail = '';
                if (selectedLabel === 'SENT' || selectedLabel === 'DRAFT') {
                  mainEmail = extractEmailAddress(getMetadataHeader('To'));
                } else {
                  mainEmail = extractEmailAddress(getMetadataHeader('From'));
                }

                return (
                  <div
                    key={m.id}
                    onClick={() => loadMessageDetail(m.id)}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #333',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>
                      {mainEmail || '(No email)'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#bbb', marginTop: '4px' }}>
                      {m.payload?.headers?.find((h) => h.name === 'Subject')?.value || '(No subject)'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#777' }}>
                      {m.payload?.headers?.find((h) => h.name === 'Date')?.value || ''}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Message preview */}
          <div style={{ flex: 1.5, padding: '16px', overflowY: 'auto' }}>
            {selected ? (
              <SelectedView message={selected} />
            ) : (
              <p>Select an email to view.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedView({ message }) {
  const headers = message.payload?.headers || [];
  const findHeader = (name) =>
    headers.find((h) => h.name === name)?.value || '';
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

  return (
    <div>
      <h2>{subject}</h2>
      <div style={{ fontSize: '12px', color: '#aaa' }}>
        <div>From: {extractEmailAddress(from)}</div>
        <div>To: {extractEmailAddress(to)}</div>
        <div>Date: {date}</div>
      </div>
      <hr />
      {isHtml ? (
        <iframe
          title="email-body"
          style={{ width: '100%', height: '60vh', border: 'none' }}
          srcDoc={body}
        />
      ) : (
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            marginTop: '12px',
          }}
        >
          {body}
        </pre>
      )}
    </div>
  );
}


export default Mail;