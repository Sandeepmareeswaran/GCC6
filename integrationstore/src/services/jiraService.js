const API_BASE = 'http://localhost:5000/api/jira';

// Get credentials from localStorage
const getCredentials = () => {
          const jiraData = localStorage.getItem('jiraCredentials');
          if (jiraData) {
                    return JSON.parse(jiraData);
          }
          return null;
};

// Save credentials to localStorage
export const saveCredentials = (email, domain, apiToken) => {
          localStorage.setItem('jiraCredentials', JSON.stringify({ email, domain, apiToken }));
};

// Clear credentials
export const clearCredentials = () => {
          localStorage.removeItem('jiraCredentials');
};

// Check if connected
export const isConnected = () => {
          return getCredentials() !== null;
};

// Test connection and get user info
export const connectJira = async (email, domain, apiToken) => {
          const response = await fetch(`${API_BASE}/connect`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, domain, apiToken })
          });
          const data = await response.json();
          if (data.success) {
                    saveCredentials(email, domain, apiToken);
          }
          return data;
};

// Get all projects
export const getProjects = async () => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Jira');

          const response = await fetch(`${API_BASE}/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(creds)
          });
          return response.json();
};

// Get issues for a project
export const getIssues = async (projectKey) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Jira');

          const response = await fetch(`${API_BASE}/issues`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, projectKey })
          });
          return response.json();
};

// Create a new issue
export const createIssue = async (projectKey, summary, description, issueType = 'Task') => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Jira');

          const response = await fetch(`${API_BASE}/issues/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, projectKey, summary, description, issueType })
          });
          return response.json();
};

// Get transitions for an issue
export const getTransitions = async (issueKey) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Jira');

          const response = await fetch(`${API_BASE}/transitions/${issueKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(creds)
          });
          return response.json();
};

// Get available issue types for a project
export const getIssueTypes = async (projectKey) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Jira');

          const response = await fetch(`${API_BASE}/issuetypes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, projectKey })
          });
          return response.json();
};

// Transition an issue
export const transitionIssue = async (issueKey, transitionId) => {
          const creds = getCredentials();
          if (!creds) throw new Error('Not connected to Jira');

          const response = await fetch(`${API_BASE}/issues/transition`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...creds, issueKey, transitionId })
          });
          return response.json();
};
