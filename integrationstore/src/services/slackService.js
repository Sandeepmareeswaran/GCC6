const API_BASE = 'https://jira-api.outliersunited.com/api/slack';

// Get credentials from localStorage
const getCredentials = () => {
          const botToken = localStorage.getItem('slackBotToken');
          return botToken ? { botToken } : null;
};

// Save credentials
export const saveCredentials = (botToken) => {
          localStorage.setItem('slackBotToken', botToken);
};

// Clear credentials
export const clearCredentials = () => {
          localStorage.removeItem('slackBotToken');
};

// Check if connected
export const isConnected = () => {
          return !!localStorage.getItem('slackBotToken');
};

// Connect to Slack
export const connectSlack = async (botToken) => {
          const response = await fetch(`${API_BASE}/connect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ botToken })
          });
          return response.json();
};

// Get channels
export const getChannels = async () => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/channels`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(creds)
          });
          return response.json();
};

// Get messages from a channel
export const getMessages = async (channelId, limit = 50) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, channelId, limit })
          });
          return response.json();
};

// Send a message to a channel
export const sendMessage = async (channel, text) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, channel, text })
          });
          return response.json();
};

// Get workspace users
export const getUsers = async () => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(creds)
          });
          return response.json();
};

// Get user info
export const getUserInfo = async (userId) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/user/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(creds)
          });
          return response.json();
};

// ===== DIRECT MESSAGES =====

// Get list of DM conversations
export const getDMs = async () => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/dms`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(creds)
          });
          return response.json();
};

// Open a DM with a user
export const openDM = async (userId) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/dm/open`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, userId })
          });
          return response.json();
};

// ===== FILES =====

// Get files (optionally from a channel)
export const getFiles = async (channelId = null) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/files`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, channelId })
          });
          return response.json();
};

// ===== REACTIONS =====

// Add a reaction to a message
export const addReaction = async (channel, timestamp, emoji) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/reactions/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, channel, timestamp, emoji })
          });
          return response.json();
};

// Get reactions for a message
export const getReactions = async (channel, timestamp) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/reactions/get`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, channel, timestamp })
          });
          return response.json();
};

// ===== REMINDERS =====

// Add a reminder
export const addReminder = async (text, time, user = null) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/reminders/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, text, time, user })
          });
          return response.json();
};

// List all reminders
export const listReminders = async () => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/reminders/list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(creds)
          });
          return response.json();
};

// ===== THREAD REPLIES =====

// Get replies in a thread
export const getReplies = async (channel, threadTs) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/replies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, channel, threadTs })
          });
          return response.json();
};

// Send a reply in a thread
export const sendReply = async (channel, threadTs, text) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Slack');

          const response = await fetch(`${API_BASE}/reply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, channel, threadTs, text })
          });
          return response.json();
};
