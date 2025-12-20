// Notion Service - API calls for Notion integration

const API_BASE = 'http://localhost:5009/api/notion';

let credentials = {
          apiToken: null,
};

export const saveCredentials = (apiToken) => {
          credentials.apiToken = apiToken;
          localStorage.setItem('notionToken', apiToken);
};

export const loadCredentials = () => {
          if (!credentials.apiToken) {
                    credentials.apiToken = localStorage.getItem('notionToken');
          }
          return credentials;
};

export const clearCredentials = () => {
          credentials.apiToken = null;
          localStorage.removeItem('notionToken');
};

export const getToken = () => {
          loadCredentials();
          return credentials.apiToken;
};

// Connect to Notion
export const connect = async (apiToken) => {
          try {
                    const response = await fetch(`${API_BASE}/connect`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ api_token: apiToken }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Connect error:', error);
                    return { success: false, error: error.message };
          }
};

// Search for databases
export const searchDatabases = async () => {
          try {
                    const response = await fetch(`${API_BASE}/databases`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ api_token: getToken() }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Search databases error:', error);
                    return { success: false, error: error.message };
          }
};

// Search for pages
export const searchPages = async () => {
          try {
                    const response = await fetch(`${API_BASE}/pages`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ api_token: getToken() }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Search pages error:', error);
                    return { success: false, error: error.message };
          }
};

// Query a database
export const queryDatabase = async (databaseId) => {
          try {
                    const response = await fetch(`${API_BASE}/database/${databaseId}/query`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ api_token: getToken() }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Query database error:', error);
                    return { success: false, error: error.message };
          }
};

// Get a page
export const getPage = async (pageId) => {
          try {
                    const response = await fetch(`${API_BASE}/page/${pageId}`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ api_token: getToken() }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Get page error:', error);
                    return { success: false, error: error.message };
          }
};

// Create a page in a database
export const createPage = async (databaseId, properties) => {
          try {
                    const response = await fetch(`${API_BASE}/page/create`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                        api_token: getToken(),
                                        database_id: databaseId,
                                        properties
                              }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Create page error:', error);
                    return { success: false, error: error.message };
          }
};

// Get block children (page content)
export const getBlockChildren = async (blockId) => {
          try {
                    const response = await fetch(`${API_BASE}/blocks/${blockId}/children`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ api_token: getToken() }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Get block children error:', error);
                    return { success: false, error: error.message };
          }
};

// Create a new block
export const createBlock = async (parentId, blockType, content, afterBlock = null) => {
          try {
                    const response = await fetch(`${API_BASE}/blocks/create`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                        api_token: getToken(),
                                        parent_id: parentId,
                                        block_type: blockType,
                                        content: content,
                                        after: afterBlock
                              }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Create block error:', error);
                    return { success: false, error: error.message };
          }
};

// Update a block's content
export const updateBlock = async (blockId, blockType, content) => {
          try {
                    const response = await fetch(`${API_BASE}/blocks/${blockId}/update`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                        api_token: getToken(),
                                        block_type: blockType,
                                        content: content
                              }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Update block error:', error);
                    return { success: false, error: error.message };
          }
};

// Delete a block
export const deleteBlock = async (blockId) => {
          try {
                    const response = await fetch(`${API_BASE}/blocks/${blockId}/delete`, {
                              method: 'DELETE',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ api_token: getToken() }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Delete block error:', error);
                    return { success: false, error: error.message };
          }
};

// Toggle a todo's checked state
export const toggleTodo = async (blockId, checked) => {
          try {
                    const response = await fetch(`${API_BASE}/blocks/${blockId}/toggle-todo`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                        api_token: getToken(),
                                        checked: checked
                              }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Toggle todo error:', error);
                    return { success: false, error: error.message };
          }
};

// Get database schema (properties and options)
export const getDatabaseSchema = async (databaseId) => {
          try {
                    const response = await fetch(`${API_BASE}/database/${databaseId}/schema`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ api_token: getToken() }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Get database schema error:', error);
                    return { success: false, error: error.message };
          }
};

// Create a new database item
export const createDatabaseItem = async (databaseId, properties) => {
          try {
                    const response = await fetch(`${API_BASE}/database/${databaseId}/items/create`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                        api_token: getToken(),
                                        properties: properties
                              }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Create database item error:', error);
                    return { success: false, error: error.message };
          }
};

// Update page properties (for database items)
export const updatePageProperties = async (pageId, properties) => {
          try {
                    const response = await fetch(`${API_BASE}/pages/${pageId}/update`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                        api_token: getToken(),
                                        properties: properties
                              }),
                    });
                    return await response.json();
          } catch (error) {
                    console.error('Update page properties error:', error);
                    return { success: false, error: error.message };
          }
};
