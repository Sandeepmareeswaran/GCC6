from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import os
import json
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()

app = Flask(__name__)
CORS(app)

# ================= FIREBASE ADMIN SDK =================
# Initialize Firebase Admin for backend data access
FIREBASE_CRED_PATH = os.path.join(os.path.dirname(__file__), 'aram-eyecare-firebase-adminsdk-pec1o-db6527f7eb.json')
if os.path.exists(FIREBASE_CRED_PATH) and not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred)
    db_admin = firestore.client()
    print("✅ Firebase Admin SDK initialized successfully")
else:
    db_admin = None
    print("⚠️ Firebase Admin SDK not initialized - credentials file not found")

# ================= GROQ AI CONFIG =================
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "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")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


# Jira API base URL format
JIRA_API_BASE = "https://{domain}/rest/api/3"

def get_auth_header(email, api_token):
    """Create Basic Auth header for Jira API"""
    credentials = f"{email}:{api_token}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

def clean_domain(domain):
    """Clean domain by removing https://, http://, and trailing slashes"""
    domain = domain.strip()
    if domain.startswith('https://'):
        domain = domain[8:]
    if domain.startswith('http://'):
        domain = domain[7:]
    return domain.rstrip('/')

@app.route('/api/jira/connect', methods=['POST'])
def connect_jira():
    """Test Jira connection with provided credentials"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    
    if not all([email, api_token, domain]):
        return jsonify({"error": "Missing credentials"}), 400
    
    # Clean the domain
    domain = clean_domain(domain)
    
    try:
        url = f"https://{domain}/rest/api/3/myself"
        headers = get_auth_header(email, api_token)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            user_data = response.json()
            return jsonify({
                "success": True,
                "user": {
                    "displayName": user_data.get("displayName"),
                    "emailAddress": user_data.get("emailAddress"),
                    "accountId": user_data.get("accountId")
                }
            })
        else:
            return jsonify({"error": "Invalid credentials or domain"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/projects', methods=['POST'])
def get_projects():
    """Get all Jira projects"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    
    # Clean the domain
    domain = clean_domain(domain)
    
    try:
        url = f"https://{domain}/rest/api/3/project"
        headers = get_auth_header(email, api_token)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            projects = response.json()
            return jsonify({
                "success": True,
                "projects": [{
                    "id": p.get("id"),
                    "key": p.get("key"),
                    "name": p.get("name"),
                    "projectTypeKey": p.get("projectTypeKey")
                } for p in projects]
            })
        else:
            return jsonify({"error": "Failed to fetch projects"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/issues', methods=['POST'])
def get_issues():
    """Get issues for a project using the new Jira API"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    project_key = data.get('projectKey')
    
    # Clean the domain
    domain = clean_domain(domain)
    
    if not project_key:
        return jsonify({"error": "Project key is required"}), 400
    
    try:
        # Use the new /search/jql endpoint (the old /search is deprecated)
        url = f"https://{domain}/rest/api/3/search/jql"
        headers = get_auth_header(email, api_token)
        
        # Fetch additional fields for enhanced display
        payload = {
            "jql": f"project={project_key} ORDER BY created DESC",
            "maxResults": 100,
            "fields": ["summary", "status", "priority", "assignee", "issuetype", "created", "duedate"]
        }
        
        print(f"Fetching issues for project: {project_key}")
        print(f"URL: {url}")
        
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Response status: {response.status_code}")
        
        # Handle different response codes
        if response.status_code == 200:
            result = response.json()
            issues = []
            for issue in result.get("issues", []):
                fields = issue.get("fields", {})
                status_obj = fields.get("status") or {}
                status_category = status_obj.get("statusCategory") or {}
                priority_obj = fields.get("priority") or {}
                assignee_obj = fields.get("assignee") or {}
                issuetype_obj = fields.get("issuetype") or {}
                
                # Get avatar URL if available
                avatar_url = None
                if assignee_obj:
                    avatar_urls = assignee_obj.get("avatarUrls", {})
                    avatar_url = avatar_urls.get("24x24") or avatar_urls.get("48x48")
                
                issues.append({
                    "key": issue.get("key"),
                    "summary": fields.get("summary"),
                    "status": status_obj.get("name", "Unknown"),
                    "statusId": status_obj.get("id"),
                    "statusCategory": status_category.get("key", "new"),
                    "statusCategoryName": status_category.get("name", "To Do"),
                    "priority": priority_obj.get("name") if priority_obj else None,
                    "priorityId": priority_obj.get("id") if priority_obj else None,
                    "assignee": assignee_obj.get("displayName") if assignee_obj else "Unassigned",
                    "assigneeAvatar": avatar_url,
                    "issueType": issuetype_obj.get("name") if issuetype_obj else "Task",
                    "issueTypeIcon": issuetype_obj.get("iconUrl") if issuetype_obj else None,
                    "created": fields.get("created"),
                    "dueDate": fields.get("duedate")
                })
            print(f"Found {len(issues)} issues")
            return jsonify({"success": True, "issues": issues, "total": result.get("total", 0)})
        elif response.status_code == 400:
            error_msg = response.json().get("errorMessages", ["Invalid project key"])[0] if response.text else "Invalid request"
            return jsonify({"success": True, "issues": [], "error": error_msg, "total": 0})
        else:
            print(f"Error response: {response.text}")
            return jsonify({"error": f"Failed to fetch issues (Status: {response.status_code})", "details": response.text}), response.status_code
    except Exception as e:
        print(f"Exception: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/issue/<issue_key>', methods=['POST'])
def get_issue_detail(issue_key):
    """Get full details of a single issue"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    
    domain = clean_domain(domain)
    
    try:
        url = f"https://{domain}/rest/api/3/issue/{issue_key}"
        headers = get_auth_header(email, api_token)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            issue = response.json()
            fields = issue.get("fields", {})
            
            # Parse description from Atlassian Document Format
            description = ""
            desc_field = fields.get("description")
            if desc_field and isinstance(desc_field, dict):
                content = desc_field.get("content", [])
                for block in content:
                    if block.get("type") == "paragraph":
                        for text_node in block.get("content", []):
                            if text_node.get("type") == "text":
                                description += text_node.get("text", "")
                        description += "\n"
            
            status_obj = fields.get("status") or {}
            priority_obj = fields.get("priority") or {}
            assignee_obj = fields.get("assignee") or {}
            reporter_obj = fields.get("reporter") or {}
            issuetype_obj = fields.get("issuetype") or {}
            
            return jsonify({
                "success": True,
                "issue": {
                    "key": issue.get("key"),
                    "id": issue.get("id"),
                    "summary": fields.get("summary"),
                    "description": description.strip(),
                    "status": status_obj.get("name", "Unknown"),
                    "statusId": status_obj.get("id"),
                    "priority": priority_obj.get("name") if priority_obj else None,
                    "assignee": assignee_obj.get("displayName") if assignee_obj else "Unassigned",
                    "assigneeEmail": assignee_obj.get("emailAddress") if assignee_obj else None,
                    "assigneeAvatar": assignee_obj.get("avatarUrls", {}).get("48x48") if assignee_obj else None,
                    "reporter": reporter_obj.get("displayName") if reporter_obj else "Unknown",
                    "reporterAvatar": reporter_obj.get("avatarUrls", {}).get("48x48") if reporter_obj else None,
                    "issueType": issuetype_obj.get("name") if issuetype_obj else "Task",
                    "created": fields.get("created"),
                    "updated": fields.get("updated"),
                    "dueDate": fields.get("duedate"),
                    "labels": fields.get("labels", []),
                }
            })
        else:
            return jsonify({"error": "Failed to fetch issue"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/issue/<issue_key>/update', methods=['POST'])
def update_issue(issue_key):
    """Update issue fields"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    updates = data.get('updates', {})
    
    domain = clean_domain(domain)
    
    try:
        url = f"https://{domain}/rest/api/3/issue/{issue_key}"
        headers = get_auth_header(email, api_token)
        
        # Build update payload
        fields = {}
        if 'summary' in updates:
            fields['summary'] = updates['summary']
        if 'description' in updates:
            fields['description'] = {
                "type": "doc",
                "version": 1,
                "content": [{
                    "type": "paragraph",
                    "content": [{"type": "text", "text": updates['description'] or "No description"}]
                }]
            }
        if 'duedate' in updates:
            fields['duedate'] = updates['duedate'] if updates['duedate'] else None
        if 'assignee' in updates:
            if updates['assignee']:
                fields['assignee'] = {"accountId": updates['assignee']}
            else:
                fields['assignee'] = None
        if 'priority' in updates:
            fields['priority'] = {"id": updates['priority']}
            
        payload = {"fields": fields}
        
        response = requests.put(url, headers=headers, json=payload)
        
        if response.status_code == 204:
            return jsonify({"success": True})
        else:
            error_data = response.json() if response.text else {}
            return jsonify({"error": error_data.get("errorMessages", ["Update failed"])[0] if error_data.get("errorMessages") else "Update failed", "details": response.text}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/users', methods=['POST'])
def get_users():
    """Get assignable users for a project"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    project_key = data.get('projectKey')
    
    domain = clean_domain(domain)
    
    try:
        url = f"https://{domain}/rest/api/3/user/assignable/search?project={project_key}"
        headers = get_auth_header(email, api_token)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            users = response.json()
            return jsonify({
                "success": True,
                "users": [{
                    "accountId": u.get("accountId"),
                    "displayName": u.get("displayName"),
                    "emailAddress": u.get("emailAddress"),
                    "avatarUrl": u.get("avatarUrls", {}).get("24x24")
                } for u in users]
            })
        else:
            return jsonify({"error": "Failed to fetch users"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/priorities', methods=['POST'])
def get_priorities():
    """Get available priorities"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    
    domain = clean_domain(domain)
    
    try:
        url = f"https://{domain}/rest/api/3/priority"
        headers = get_auth_header(email, api_token)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            priorities = response.json()
            return jsonify({
                "success": True,
                "priorities": [{
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "iconUrl": p.get("iconUrl")
                } for p in priorities]
            })
        else:
            return jsonify({"error": "Failed to fetch priorities"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/issues/create', methods=['POST'])
def create_issue():
    """Create a new Jira issue"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    project_key = data.get('projectKey')
    summary = data.get('summary')
    description = data.get('description', '')
    issue_type = data.get('issueType', 'Task')
    
    # Clean the domain
    domain = clean_domain(domain)
    
    print(f"Creating issue - Project: {project_key}, Type: {issue_type}, Summary: {summary}")
    
    try:
        url = f"https://{domain}/rest/api/3/issue"
        headers = get_auth_header(email, api_token)
        
        # Build payload - handle empty description
        desc_content = description if description else "No description"
        payload = {
            "fields": {
                "project": {"key": project_key},
                "summary": summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [{
                        "type": "paragraph",
                        "content": [{"type": "text", "text": desc_content}]
                    }]
                },
                "issuetype": {"name": issue_type}
            }
        }
        
        print(f"Payload: {payload}")
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Create issue response status: {response.status_code}")
        print(f"Create issue response: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            return jsonify({
                "success": True,
                "issue": {
                    "key": result.get("key"),
                    "id": result.get("id")
                }
            })
        else:
            # Return the actual Jira error message
            error_data = response.json() if response.text else {}
            error_messages = error_data.get("errorMessages", [])
            errors = error_data.get("errors", {})
            return jsonify({
                "error": error_messages[0] if error_messages else "Failed to create issue",
                "errors": errors,
                "details": response.text
            }), response.status_code
    except Exception as e:
        print(f"Exception: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/issuetypes', methods=['POST'])
def get_issue_types():
    """Get available issue types for a project"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    project_key = data.get('projectKey')
    
    # Clean the domain
    domain = clean_domain(domain)
    
    try:
        # Get project details which includes issue types
        url = f"https://{domain}/rest/api/3/project/{project_key}"
        headers = get_auth_header(email, api_token)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            project = response.json()
            issue_types = project.get("issueTypes", [])
            return jsonify({
                "success": True,
                "issueTypes": [{
                    "id": it.get("id"),
                    "name": it.get("name"),
                    "description": it.get("description", ""),
                    "subtask": it.get("subtask", False)
                } for it in issue_types if not it.get("subtask", False)]
            })
        else:
            return jsonify({"error": "Failed to fetch issue types"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/statuses', methods=['POST'])
def get_statuses():
    """Get available statuses for a project"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    project_key = data.get('projectKey')
    
    # Clean the domain
    domain = clean_domain(domain)
    
    try:
        # Get project statuses
        url = f"https://{domain}/rest/api/3/project/{project_key}/statuses"
        headers = get_auth_header(email, api_token)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            # Collect unique statuses from all issue types
            statuses = []
            seen_ids = set()
            for issuetype in result:
                for status in issuetype.get("statuses", []):
                    if status.get("id") not in seen_ids:
                        seen_ids.add(status.get("id"))
                        category = status.get("statusCategory", {})
                        statuses.append({
                            "id": status.get("id"),
                            "name": status.get("name"),
                            "categoryKey": category.get("key"),
                            "categoryName": category.get("name"),
                            "categoryColor": category.get("colorName")
                        })
            return jsonify({"success": True, "statuses": statuses})
        else:
            return jsonify({"error": "Failed to fetch statuses"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/issues/transition', methods=['POST'])
def transition_issue():
    """Update issue status/transition"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    issue_key = data.get('issueKey')
    transition_id = data.get('transitionId')
    
    # Clean the domain
    domain = clean_domain(domain)
    
    try:
        url = f"https://{domain}/rest/api/3/issue/{issue_key}/transitions"
        headers = get_auth_header(email, api_token)
        payload = {"transition": {"id": transition_id}}
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 204:
            return jsonify({"success": True})
        else:
            return jsonify({"error": response.text}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jira/transitions/<issue_key>', methods=['POST'])
def get_transitions(issue_key):
    """Get available transitions for an issue"""
    data = request.json
    email = data.get('email')
    api_token = data.get('apiToken')
    domain = data.get('domain')
    
    # Clean the domain
    domain = clean_domain(domain)
    
    try:
        url = f"https://{domain}/rest/api/3/issue/{issue_key}/transitions"
        headers = get_auth_header(email, api_token)
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            transitions = [{
                "id": t.get("id"),
                "name": t.get("name"),
                "to": t.get("to", {}).get("name")
            } for t in result.get("transitions", [])]
            return jsonify({"success": True, "transitions": transitions})
        else:
            return jsonify({"error": response.text}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ================= SLACK INTEGRATION =================

SLACK_API_BASE = "https://slack.com/api"

def get_slack_headers(bot_token):
    """Create authorization header for Slack API"""
    return {
        "Authorization": f"Bearer {bot_token}",
        "Content-Type": "application/json"
    }

@app.route('/api/slack/connect', methods=['POST'])
def slack_connect():
    """Test Slack connection with bot token"""
    data = request.json
    bot_token = data.get('botToken')
    
    if not bot_token or not bot_token.startswith('xoxb-'):
        return jsonify({"error": "Invalid bot token. Must start with xoxb-"}), 400
    
    try:
        # Test connection by getting bot info
        url = f"{SLACK_API_BASE}/auth.test"
        headers = get_slack_headers(bot_token)
        response = requests.post(url, headers=headers)
        result = response.json()
        
        if result.get("ok"):
            return jsonify({
                "success": True,
                "team": result.get("team"),
                "user": result.get("user"),
                "teamId": result.get("team_id"),
                "userId": result.get("user_id")
            })
        else:
            return jsonify({"error": result.get("error", "Connection failed")}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/channels', methods=['POST'])
def slack_get_channels():
    """Get list of Slack channels"""
    data = request.json or {}
    bot_token = data.get('botToken')
    
    if not bot_token:
        return jsonify({"error": "No bot token provided"}), 400
    
    try:
        url = f"{SLACK_API_BASE}/conversations.list"
        headers = get_slack_headers(bot_token)
        params = {
            "exclude_archived": True,
            "types": "public_channel,private_channel",
            "limit": 100
        }
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        if result.get("ok"):
            channels = [{
                "id": ch.get("id"),
                "name": ch.get("name"),
                "isPrivate": ch.get("is_private", False),
                "isMember": ch.get("is_member", False),
                "memberCount": ch.get("num_members", 0),
                "topic": ch.get("topic", {}).get("value", ""),
                "purpose": ch.get("purpose", {}).get("value", "")
            } for ch in result.get("channels", [])]
            return jsonify({"success": True, "channels": channels})
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        print(f"Channels error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/messages', methods=['POST'])
def slack_get_messages():
    """Get messages from a channel or DM"""
    data = request.json or {}
    bot_token = data.get('botToken')
    channel_id = data.get('channelId')
    limit = data.get('limit', 50)
    
    print(f"DEBUG: Getting messages for channel: {channel_id}")
    print(f"DEBUG: Token provided: {'Yes' if bot_token else 'No'}")
    
    if not bot_token:
        return jsonify({"error": "No bot token provided"}), 400
    
    if not channel_id:
        return jsonify({"error": "No channel ID provided"}), 400
    
    try:
        headers = get_slack_headers(bot_token)
        
        # Check if this is a DM (starts with D) or channel (starts with C or G)
        # For DMs, we don't need to join - bot already has access via im:history
        is_dm = channel_id.startswith('D')
        
        if not is_dm:
            # For channels, try to join first
            join_url = f"{SLACK_API_BASE}/conversations.join"
            join_response = requests.post(join_url, headers=headers, json={"channel": channel_id})
            join_result = join_response.json()
            print(f"DEBUG: Join result: {join_result}")
        else:
            print(f"DEBUG: Skipping join for DM channel")
        
        # Get the messages using conversations.history (works for both channels and DMs)
        url = f"{SLACK_API_BASE}/conversations.history"
        params = {"channel": channel_id, "limit": limit}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        print(f"DEBUG: History result ok: {result.get('ok')}, error: {result.get('error')}")
        
        if result.get("ok"):
            messages = [{
                "ts": msg.get("ts"),
                "text": msg.get("text"),
                "user": msg.get("user"),
                "type": msg.get("type"),
                "subtype": msg.get("subtype"),
                "reactions": msg.get("reactions", [])
            } for msg in result.get("messages", [])]
            return jsonify({"success": True, "messages": messages})
        else:
            error = result.get("error", "Unknown error")
            print(f"DEBUG: Slack error: {error}")
            return jsonify({"error": error, "details": f"Channel: {channel_id}, Is DM: {is_dm}"}), 400
    except Exception as e:
        print(f"DEBUG: Exception: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/send', methods=['POST'])
def slack_send_message():
    """Send a message to a Slack channel"""
    data = request.json
    bot_token = data.get('botToken')
    channel = data.get('channel')
    text = data.get('text')
    
    if not channel or not text:
        return jsonify({"error": "channel and text are required"}), 400
    
    try:
        url = f"{SLACK_API_BASE}/chat.postMessage"
        headers = get_slack_headers(bot_token)
        payload = {
            "channel": channel,
            "text": text,
            "unfurl_links": True,
            "unfurl_media": True
        }
        response = requests.post(url, headers=headers, json=payload)
        result = response.json()
        
        if result.get("ok"):
            return jsonify({
                "success": True,
                "messageTs": result.get("ts"),
                "channel": result.get("channel")
            })
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/users', methods=['POST'])
def slack_get_users():
    """Get list of workspace users"""
    data = request.json or {}
    bot_token = data.get('botToken')
    
    if not bot_token:
        return jsonify({"error": "No bot token provided"}), 400
    
    try:
        url = f"{SLACK_API_BASE}/users.list"
        headers = get_slack_headers(bot_token)
        response = requests.get(url, headers=headers)
        result = response.json()
        
        if result.get("ok"):
            users = [{
                "id": u.get("id"),
                "name": u.get("name"),
                "realName": u.get("real_name"),
                "displayName": u.get("profile", {}).get("display_name"),
                "avatar": u.get("profile", {}).get("image_72"),
                "isBot": u.get("is_bot", False)
            } for u in result.get("members", []) if not u.get("deleted")]
            return jsonify({"success": True, "users": users})
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/user/<user_id>', methods=['POST'])
def slack_get_user_info(user_id):
    """Get info for a specific user"""
    data = request.json
    bot_token = data.get('botToken')
    
    try:
        url = f"{SLACK_API_BASE}/users.info"
        headers = get_slack_headers(bot_token)
        params = {"user": user_id}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        if result.get("ok"):
            u = result.get("user", {})
            return jsonify({
                "success": True,
                "user": {
                    "id": u.get("id"),
                    "name": u.get("name"),
                    "realName": u.get("real_name"),
                    "displayName": u.get("profile", {}).get("display_name"),
                    "avatar": u.get("profile", {}).get("image_192"),
                    "email": u.get("profile", {}).get("email")
                }
            })
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== DIRECT MESSAGES (DMs) =====

@app.route('/api/slack/dms', methods=['POST'])
def slack_get_dms():
    """Get list of direct message conversations"""
    data = request.json or {}
    bot_token = data.get('botToken')
    
    if not bot_token:
        return jsonify({"error": "No bot token provided"}), 400
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/conversations.list"
        params = {"types": "im", "limit": 100}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        if result.get("ok"):
            dms = [{
                "id": dm.get("id"),
                "userId": dm.get("user"),
                "isOpen": dm.get("is_open", False)
            } for dm in result.get("channels", [])]
            return jsonify({"success": True, "dms": dms})
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/dm/open', methods=['POST'])
def slack_open_dm():
    """Open a DM conversation with a user"""
    data = request.json
    bot_token = data.get('botToken')
    user_id = data.get('userId')
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/conversations.open"
        response = requests.post(url, headers=headers, json={"users": user_id})
        result = response.json()
        
        if result.get("ok"):
            return jsonify({
                "success": True,
                "channelId": result.get("channel", {}).get("id")
            })
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== FILES =====

@app.route('/api/slack/files', methods=['POST'])
def slack_get_files():
    """Get list of files in workspace"""
    data = request.json or {}
    bot_token = data.get('botToken')
    
    if not bot_token:
        return jsonify({"success": True, "files": []})
    channel_id = data.get('channelId')
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/files.list"
        params = {"count": 50}
        if channel_id:
            params["channel"] = channel_id
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        if result.get("ok"):
            files = [{
                "id": f.get("id"),
                "name": f.get("name"),
                "title": f.get("title"),
                "mimetype": f.get("mimetype"),
                "size": f.get("size"),
                "url": f.get("url_private"),
                "thumb": f.get("thumb_360") or f.get("thumb_80"),
                "user": f.get("user"),
                "created": f.get("created")
            } for f in result.get("files", [])]
            return jsonify({"success": True, "files": files})
        else:
            print(f"Files error: {result.get('error')}")
            return jsonify({"success": True, "files": []})
    except Exception as e:
        print(f"Files exception: {str(e)}")
        return jsonify({"success": True, "files": []})

# ===== REACTIONS =====

@app.route('/api/slack/reactions/add', methods=['POST'])
def slack_add_reaction():
    """Add a reaction to a message"""
    data = request.json
    bot_token = data.get('botToken')
    channel = data.get('channel')
    timestamp = data.get('timestamp')
    emoji = data.get('emoji')  # Without colons, e.g. "thumbsup"
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/reactions.add"
        response = requests.post(url, headers=headers, json={
            "channel": channel,
            "timestamp": timestamp,
            "name": emoji
        })
        result = response.json()
        
        if result.get("ok"):
            return jsonify({"success": True})
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/reactions/get', methods=['POST'])
def slack_get_reactions():
    """Get reactions for a message"""
    data = request.json
    bot_token = data.get('botToken')
    channel = data.get('channel')
    timestamp = data.get('timestamp')
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/reactions.get"
        params = {"channel": channel, "timestamp": timestamp}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        if result.get("ok"):
            message = result.get("message", {})
            reactions = message.get("reactions", [])
            return jsonify({"success": True, "reactions": reactions})
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== REMINDERS =====

@app.route('/api/slack/reminders/add', methods=['POST'])
def slack_add_reminder():
    """Create a reminder"""
    data = request.json
    bot_token = data.get('botToken')
    text = data.get('text')
    time = data.get('time')  # Unix timestamp or natural language like "in 5 minutes"
    user = data.get('user')  # Optional: remind specific user
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/reminders.add"
        payload = {"text": text, "time": time}
        if user:
            payload["user"] = user
        response = requests.post(url, headers=headers, json=payload)
        result = response.json()
        
        if result.get("ok"):
            reminder = result.get("reminder", {})
            return jsonify({
                "success": True,
                "reminder": {
                    "id": reminder.get("id"),
                    "text": reminder.get("text"),
                    "time": reminder.get("time")
                }
            })
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/reminders/list', methods=['POST'])
def slack_list_reminders():
    """List all reminders"""
    data = request.json or {}
    bot_token = data.get('botToken')
    
    if not bot_token:
        return jsonify({"success": True, "reminders": [], "error": "No token"}), 200
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/reminders.list"
        response = requests.get(url, headers=headers)
        result = response.json()
        
        if result.get("ok"):
            reminders = [{
                "id": r.get("id"),
                "text": r.get("text"),
                "time": r.get("time"),
                "complete": r.get("complete_ts") is not None
            } for r in result.get("reminders", [])]
            return jsonify({"success": True, "reminders": reminders})
        else:
            # Return empty list instead of error - reminders:read scope might be missing
            print(f"Reminders error: {result.get('error')}")
            return jsonify({"success": True, "reminders": [], "note": "reminders:read scope may be needed"})
    except Exception as e:
        print(f"Reminders exception: {str(e)}")
        return jsonify({"success": True, "reminders": []})

# ===== THREAD REPLIES =====

@app.route('/api/slack/replies', methods=['POST'])
def slack_get_replies():
    """Get replies in a thread"""
    data = request.json
    bot_token = data.get('botToken')
    channel = data.get('channel')
    thread_ts = data.get('threadTs')
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/conversations.replies"
        params = {"channel": channel, "ts": thread_ts}
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        if result.get("ok"):
            messages = [{
                "ts": msg.get("ts"),
                "text": msg.get("text"),
                "user": msg.get("user"),
                "threadTs": msg.get("thread_ts")
            } for msg in result.get("messages", [])]
            return jsonify({"success": True, "messages": messages})
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/slack/reply', methods=['POST'])
def slack_send_reply():
    """Send a reply in a thread"""
    data = request.json
    bot_token = data.get('botToken')
    channel = data.get('channel')
    thread_ts = data.get('threadTs')
    text = data.get('text')
    
    try:
        headers = get_slack_headers(bot_token)
        url = f"{SLACK_API_BASE}/chat.postMessage"
        response = requests.post(url, headers=headers, json={
            "channel": channel,
            "text": text,
            "thread_ts": thread_ts
        })
        result = response.json()
        
        if result.get("ok"):
            return jsonify({
                "success": True,
                "ts": result.get("ts")
            })
        else:
            return jsonify({"error": result.get("error")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===============================
# NOTION API ENDPOINTS
# ===============================

NOTION_API_BASE = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"

def get_notion_headers(api_token):
    """Create headers for Notion API"""
    return {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION
    }

@app.route('/api/notion/connect', methods=['POST'])
def notion_connect():
    """Test connection to Notion and get user info"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        response = requests.get(f"{NOTION_API_BASE}/users/me", headers=headers)
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({
                "success": True,
                "botId": result.get("id"),
                "name": result.get("name"),
                "workspace": result.get("workspace_name") or {"name": "Notion Workspace"}
            })
        else:
            return jsonify({"success": False, "error": result.get("message", "Failed to connect")}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notion/databases', methods=['POST'])
def notion_search_databases():
    """Search for databases"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        response = requests.post(
            f"{NOTION_API_BASE}/search",
            headers=headers,
            json={"filter": {"property": "object", "value": "database"}}
        )
        result = response.json()
        
        if response.status_code == 200:
            databases = []
            for db in result.get("results", []):
                title = ""
                title_prop = db.get("title", [])
                if title_prop and len(title_prop) > 0:
                    title = title_prop[0].get("plain_text", "")
                databases.append({
                    "id": db.get("id"),
                    "title": title or "Untitled",
                    "icon": db.get("icon"),
                    "url": db.get("url")
                })
            return jsonify({"success": True, "databases": databases})
        else:
            return jsonify({"success": False, "databases": [], "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "databases": [], "error": str(e)}), 200

@app.route('/api/notion/pages', methods=['POST'])
def notion_search_pages():
    """Search for pages"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        response = requests.post(
            f"{NOTION_API_BASE}/search",
            headers=headers,
            json={"filter": {"property": "object", "value": "page"}}
        )
        result = response.json()
        
        if response.status_code == 200:
            pages = []
            for page in result.get("results", []):
                # Skip pages that are database items (parent is a database)
                parent = page.get("parent", {})
                parent_type = parent.get("type", "")
                if parent_type == "database_id":
                    # This is a database row/item, skip it
                    continue
                
                title = "Untitled"
                props = page.get("properties", {})
                for prop_name, prop_value in props.items():
                    if prop_value.get("type") == "title":
                        title_arr = prop_value.get("title", [])
                        if title_arr and len(title_arr) > 0:
                            title = title_arr[0].get("plain_text", "Untitled")
                        break
                pages.append({
                    "id": page.get("id"),
                    "title": title,
                    "icon": page.get("icon"),
                    "url": page.get("url"),
                    "parent_type": parent_type
                })
            return jsonify({"success": True, "pages": pages})
        else:
            return jsonify({"success": False, "pages": [], "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "pages": [], "error": str(e)}), 200


@app.route('/api/notion/database/<database_id>/query', methods=['POST'])
def notion_query_database(database_id):
    """Query a database for its items"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        response = requests.post(
            f"{NOTION_API_BASE}/databases/{database_id}/query",
            headers=headers,
            json={}
        )
        result = response.json()
        
        if response.status_code == 200:
            items = []
            for item in result.get("results", []):
                title = "Untitled"
                props = item.get("properties", {})
                properties_dict = {}
                
                for prop_name, prop_value in props.items():
                    prop_type = prop_value.get("type")
                    if prop_type == "title":
                        title_arr = prop_value.get("title", [])
                        if title_arr and len(title_arr) > 0:
                            title = title_arr[0].get("plain_text", "Untitled")
                    elif prop_type == "rich_text":
                        text_arr = prop_value.get("rich_text", [])
                        if text_arr and len(text_arr) > 0:
                            properties_dict[prop_name] = text_arr[0].get("plain_text", "")
                    elif prop_type == "select":
                        select_val = prop_value.get("select")
                        if select_val:
                            properties_dict[prop_name] = select_val.get("name", "")
                    elif prop_type == "status":
                        status_val = prop_value.get("status")
                        if status_val:
                            properties_dict[prop_name] = status_val.get("name", "")
                    elif prop_type == "multi_select":
                        multi_vals = prop_value.get("multi_select", [])
                        properties_dict[prop_name] = ", ".join([v.get("name", "") for v in multi_vals])
                    elif prop_type == "number":
                        properties_dict[prop_name] = str(prop_value.get("number", ""))
                    elif prop_type == "checkbox":
                        properties_dict[prop_name] = "Yes" if prop_value.get("checkbox") else "No"
                    elif prop_type == "date":
                        date_val = prop_value.get("date")
                        if date_val:
                            properties_dict[prop_name] = date_val.get("start", "")

                
                items.append({
                    "id": item.get("id"),
                    "title": title,
                    "url": item.get("url"),
                    "properties": properties_dict
                })
            return jsonify({"success": True, "results": items})
        else:
            return jsonify({"success": False, "results": [], "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "results": [], "error": str(e)}), 200


@app.route('/api/notion/database/<database_id>/schema', methods=['POST'])
def notion_get_database_schema(database_id):
    """Get database schema (properties/columns)"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        response = requests.get(f"{NOTION_API_BASE}/databases/{database_id}", headers=headers)
        result = response.json()
        
        if response.status_code == 200:
            props = result.get("properties", {})
            schema = {}
            for prop_name, prop_value in props.items():
                prop_type = prop_value.get("type")
                schema[prop_name] = {
                    "id": prop_value.get("id"),
                    "type": prop_type,
                    "name": prop_name
                }
                # Include options for select/multi_select
                if prop_type == "select":
                    schema[prop_name]["options"] = [
                        {"name": opt.get("name"), "color": opt.get("color")}
                        for opt in prop_value.get("select", {}).get("options", [])
                    ]
                elif prop_type == "multi_select":
                    schema[prop_name]["options"] = [
                        {"name": opt.get("name"), "color": opt.get("color")}
                        for opt in prop_value.get("multi_select", {}).get("options", [])
                    ]
                elif prop_type == "status":
                    schema[prop_name]["options"] = [
                        {"name": opt.get("name"), "color": opt.get("color")}
                        for opt in prop_value.get("status", {}).get("options", [])
                    ]
            
            return jsonify({
                "success": True,
                "title": result.get("title", [{}])[0].get("plain_text", "Untitled") if result.get("title") else "Untitled",
                "icon": result.get("icon"),
                "schema": schema
            })
        else:
            return jsonify({"success": False, "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


@app.route('/api/notion/database/<database_id>/items/create', methods=['POST'])
def notion_create_database_item(database_id):
    """Create a new item in a database"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        properties = data.get('properties', {})
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        
        payload = {
            "parent": {"database_id": database_id},
            "properties": properties
        }
        
        response = requests.post(f"{NOTION_API_BASE}/pages", headers=headers, json=payload)
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({"success": True, "page": result})
        else:
            return jsonify({"success": False, "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


@app.route('/api/notion/pages/<page_id>/update', methods=['PATCH'])
def notion_update_page_properties(page_id):
    """Update a page's properties (for database items)"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        properties = data.get('properties', {})
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        
        response = requests.patch(
            f"{NOTION_API_BASE}/pages/{page_id}",
            headers=headers,
            json={"properties": properties}
        )
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({"success": True, "page": result})
        else:
            return jsonify({"success": False, "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


@app.route('/api/notion/page/<page_id>', methods=['POST'])
def notion_get_page(page_id):
    """Get a specific page"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        response = requests.get(f"{NOTION_API_BASE}/pages/{page_id}", headers=headers)
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({"success": True, "page": result})
        else:
            return jsonify({"success": False, "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


@app.route('/api/notion/blocks/<block_id>/children', methods=['POST'])
def notion_get_block_children(block_id):
    """Get children blocks of a page or block"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        response = requests.get(
            f"{NOTION_API_BASE}/blocks/{block_id}/children",
            headers=headers
        )
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({
                "success": True,
                "blocks": result.get("results", []),
                "has_more": result.get("has_more", False)
            })
        else:
            return jsonify({"success": False, "blocks": [], "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "blocks": [], "error": str(e)}), 200


@app.route('/api/notion/blocks/create', methods=['POST'])
def notion_create_block():
    """Create a new block in a page"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        parent_id = data.get('parent_id')
        block_type = data.get('block_type', 'paragraph')
        content = data.get('content', '')
        after_block = data.get('after')  # Optional: insert after this block
        
        if not api_token or not parent_id:
            return jsonify({"error": "API token and parent_id required"}), 400
        
        headers = get_notion_headers(api_token)
        
        # Build block object based on type
        block_content = {"rich_text": [{"type": "text", "text": {"content": content}}]}
        
        if block_type == 'to_do':
            block_content["checked"] = False
        
        new_block = {
            "object": "block",
            "type": block_type,
            block_type: block_content
        }
        
        payload = {"children": [new_block]}
        if after_block:
            payload["after"] = after_block
        
        response = requests.patch(
            f"{NOTION_API_BASE}/blocks/{parent_id}/children",
            headers=headers,
            json=payload
        )
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({
                "success": True,
                "block": result.get("results", [{}])[0] if result.get("results") else {}
            })
        else:
            return jsonify({"success": False, "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


@app.route('/api/notion/blocks/<block_id>/update', methods=['PATCH'])
def notion_update_block(block_id):
    """Update a block's content"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        block_type = data.get('block_type', 'paragraph')
        content = data.get('content')
        checked = data.get('checked')  # For to_do blocks
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        
        # Build update payload
        update_data = {}
        
        if content is not None:
            update_data[block_type] = {
                "rich_text": [{"type": "text", "text": {"content": content}}]
            }
        
        if checked is not None and block_type == 'to_do':
            if block_type not in update_data:
                update_data[block_type] = {}
            update_data[block_type]["checked"] = checked
        
        response = requests.patch(
            f"{NOTION_API_BASE}/blocks/{block_id}",
            headers=headers,
            json=update_data
        )
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({"success": True, "block": result})
        else:
            return jsonify({"success": False, "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


@app.route('/api/notion/blocks/<block_id>/delete', methods=['DELETE'])
def notion_delete_block(block_id):
    """Delete a block"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        
        response = requests.delete(
            f"{NOTION_API_BASE}/blocks/{block_id}",
            headers=headers
        )
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


@app.route('/api/notion/blocks/<block_id>/toggle-todo', methods=['PATCH'])
def notion_toggle_todo(block_id):
    """Toggle a to_do block's checked state"""
    try:
        data = request.json or {}
        api_token = data.get('api_token')
        checked = data.get('checked', False)
        
        if not api_token:
            return jsonify({"error": "API token required"}), 400
        
        headers = get_notion_headers(api_token)
        
        response = requests.patch(
            f"{NOTION_API_BASE}/blocks/{block_id}",
            headers=headers,
            json={"to_do": {"checked": checked}}
        )
        result = response.json()
        
        if response.status_code == 200:
            return jsonify({"success": True, "checked": checked})
        else:
            return jsonify({"success": False, "error": result.get("message")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


# ==================== TRANSLATION API (GROQ) ====================

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """Translate text using Groq API with Llama 3 model"""
    try:
        data = request.json or {}
        text = data.get('text', '')
        target_language = data.get('targetLanguage', 'Hindi')
        
        if not text:
            return jsonify({"success": False, "error": "No text provided"}), 400
        
        if not GROQ_API_KEY:
            return jsonify({"success": False, "error": "Groq API key not configured"}), 500
        
        # Create prompt for translation
        prompt = f"""Translate the following English text to {target_language}. 
Only return the translated text, nothing else. Do not add any explanations or quotation marks.

Text to translate: {text}

Translation:"""
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system",
                    "content": f"You are a professional translator. Translate text from English to {target_language} accurately. Only output the translated text with no additional commentary."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 500
        }
        
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        result = response.json()
        
        if response.status_code == 200 and 'choices' in result:
            translated_text = result['choices'][0]['message']['content'].strip()
            # Clean up any quotation marks that might be added
            translated_text = translated_text.strip('"\'')
            return jsonify({
                "success": True,
                "translatedText": translated_text,
                "sourceText": text,
                "targetLanguage": target_language
            })
        else:
            error_msg = result.get('error', {}).get('message', 'Translation failed')
            return jsonify({"success": False, "error": error_msg}), 200
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


@app.route('/api/translate/batch', methods=['POST'])
def translate_batch():
    """Translate multiple texts at once using Groq API"""
    try:
        data = request.json or {}
        texts = data.get('texts', [])
        target_language = data.get('targetLanguage', 'Hindi')
        
        if not texts or not isinstance(texts, list):
            return jsonify({"success": False, "error": "No texts provided"}), 400
        
        if not GROQ_API_KEY:
            return jsonify({"success": False, "error": "Groq API key not configured"}), 500
        
        # Combine texts for batch translation
        combined_text = "\n---\n".join(texts)
        
        prompt = f"""Translate each of the following English texts to {target_language}.
The texts are separated by "---".
Return the translations in the same order, separated by "---".
Only return the translations, nothing else.

Texts to translate:
{combined_text}

Translations:"""
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system",
                    "content": f"You are a professional translator. Translate texts from English to {target_language} accurately. Maintain the separator '---' between translations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,
            "max_tokens": 2000
        }
        
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        result = response.json()
        
        if response.status_code == 200 and 'choices' in result:
            translated_combined = result['choices'][0]['message']['content'].strip()
            translations = [t.strip().strip('"\'') for t in translated_combined.split('---')]
            
            # Ensure we have the same number of translations
            while len(translations) < len(texts):
                translations.append(texts[len(translations)])
            
            return jsonify({
                "success": True,
                "translations": translations[:len(texts)],
                "targetLanguage": target_language
            })
        else:
            error_msg = result.get('error', {}).get('message', 'Translation failed')
            return jsonify({"success": False, "error": error_msg}), 200
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200


# ================= AI CHATBOT =================

CHATBOT_SYSTEM_PROMPT = """You are IntegrationStore Assistant, an AI helper for a unified workspace platform.

IMPORTANT: When I provide you with user data (ToDo tasks, Notes, Inventory, etc.) in the context, that data is ALREADY FETCHED. Do NOT say "please wait" or "let me fetch" - just summarize what you see immediately.

Your capabilities:
1. SEARCH: I will provide you with real data from the user's account
2. CREATE: Create new items (ToDo tasks, Notes) using [ACTION] tags
3. QUERY: Answer questions about the data I provide
4. HELP: Explain features and provide guidance

When responding:
- Be concise and direct
- If data is provided, summarize it immediately with nice formatting
- Use emojis for visual appeal
- Use bullet points or numbered lists for multiple items

To create items, include in your response:
[ACTION]{"type": "create_todo", "title": "Task title", "column": "today"}[/ACTION]
or
[ACTION]{"type": "create_note", "text": "Note content", "category": "Work", "priority": "High"}[/ACTION]

If no data is found, say so clearly. Respond in the user's language (English, Hindi, or Tamil)."""


def get_firebase_data(collection_name, user_email):
    """Fetch data from Firebase using Admin SDK"""
    if not db_admin:
        return []
    try:
        doc_ref = db_admin.collection(collection_name).document(user_email)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return {}
    except Exception as e:
        print(f"Firebase error: {e}")
        return {}

def search_todos(user_email, query=""):
    """Search ToDo tasks for user"""
    data = get_firebase_data("GCCToDo", user_email)  # Fixed collection name
    if not data:
        return []
    
    results = []
    # The data structure is { cols: [...], meta: {...} }
    columns = data.get('cols', [])  # Fixed: 'cols' not 'columns'
    if not columns:
        columns = data if isinstance(data, list) else []
    
    for col in columns:
        if isinstance(col, dict):
            for item in col.get('items', []):
                if query.lower() in str(item.get('title', '')).lower() or query == "":
                    results.append({
                        "type": "todo",
                        "title": item.get('title'),
                        "column": col.get('title', col.get('key')),
                        "status": item.get('status', 'Open'),
                        "date": item.get('date', ''),
                        "description": item.get('description', ''),
                        "owner": item.get('owner', '')
                    })
    return results


def search_notes(user_email, query=""):
    """Search Notes for user"""
    data = get_firebase_data("Gccusernotes", user_email)  # Fixed collection name
    if not data:
        return []
    
    results = []
    notes = data.get('notes', [])
    for note in notes:
        if query.lower() in str(note.get('text', '')).lower() or query == "":
            results.append({
                "type": "note",
                "text": note.get('text', '')[:100] + "..." if len(note.get('text', '')) > 100 else note.get('text', ''),
                "category": note.get('category', 'Personal'),
                "priority": note.get('priority', 'Medium'),
                "pinned": note.get('pinned', False)
            })
    return results


def search_inventory(query=""):
    """Search Inventory products"""
    print(f"🔍 search_inventory called with query: '{query}'")
    print(f"🔍 db_admin initialized: {db_admin is not None}")
    
    if not db_admin:
        print("❌ db_admin is None - Firebase Admin not initialized")
        return []
    
    results = []
    # Correct collection names from Inventory.jsx
    collections = [
        "DesignerMetal&MetalFrame",
        "FrameLess", 
        "FullFrame", 
        "HalfFrame", 
        "SafetyGlassess", 
        "Sunglassess"
    ]
    
    for coll_name in collections:
        try:
            print(f"📦 Trying collection: {coll_name}")
            docs = db_admin.collection(coll_name).limit(15).stream()
            count = 0
            for doc in docs:
                count += 1
                data = doc.to_dict()
                name = str(data.get('Name', '')).lower()
                brand = str(data.get('Brand', '')).lower()
                desc = str(data.get('Description', '')).lower()
                
                if query == "" or query.lower() in name or query.lower() in brand or query.lower() in desc:
                    results.append({
                        "type": "product",
                        "id": doc.id,
                        "name": data.get('Name', 'Unknown'),
                        "brand": data.get('Brand', ''),
                        "category": coll_name.replace("&", " & "),
                        "cost": data.get('Cost', ''),
                        "status": data.get('Status', 'Active'),
                        "material": data.get('Material', ''),
                        "frameColor": data.get('FrameColor', ''),
                        "shape": data.get('Shape', '')
                    })
            print(f"   ✅ Found {count} docs in {coll_name}")
        except Exception as e:
            print(f"   ❌ Error in {coll_name}: {e}")
    
    print(f"📦 Total results: {len(results)}")
    return results[:25]

def search_sales(query=""):
    """Search Sales/Orders data"""
    if not db_admin:
        return []
    
    results = []
    try:
        # Get orders from detailsorder collection
        docs = db_admin.collection("detailsorder").limit(50).stream()
        
        total_revenue = 0
        order_count = 0
        category_sales = {}
        
        for doc in docs:
            data = doc.to_dict()
            order_count += 1
            amount = float(data.get('totalAmount', 0) or 0)
            total_revenue += amount
            
            category = data.get('category', 'Unknown')
            if category not in category_sales:
                category_sales[category] = 0
            category_sales[category] += amount
            
            # Add individual order if matching query
            if query == "" or query.lower() in str(data.get('productId', '')).lower() or query.lower() in str(category).lower():
                results.append({
                    "type": "order",
                    "orderId": doc.id,
                    "productId": data.get('productId', ''),
                    "category": category,
                    "amount": amount,
                    "lensOption": data.get('lensOption', '')
                })
        
        # Add summary at the beginning
        summary = {
            "type": "sales_summary",
            "totalOrders": order_count,
            "totalRevenue": round(total_revenue, 2),
            "categoryBreakdown": category_sales
        }
        
        return [summary] + results[:20]
    except Exception as e:
        print(f"Sales search error: {e}")
        return []


def create_todo_task(user_email, title, column="today", description=""):
    """Create a new ToDo task"""
    if not db_admin:
        return {"success": False, "error": "Firebase not initialized"}
    
    import time
    try:
        doc_ref = db_admin.collection("GCCtodos").document(user_email)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            columns = data if isinstance(data, list) else list(data.values())[0] if data else []
        else:
            columns = [
                {"key": "delayed", "title": "Delayed", "items": []},
                {"key": "today", "title": "Today", "items": []},
                {"key": "week", "title": "This week", "items": []},
                {"key": "month", "title": "This month", "items": []},
                {"key": "upcoming", "title": "Upcoming", "items": []},
                {"key": "nodue", "title": "No due date", "items": []}
            ]
        
        new_task = {
            "id": f"t-{int(time.time() * 1000)}",
            "title": title,
            "description": description,
            "status": "Open",
            "owner": "",
            "date": ""
        }
        
        for col in columns:
            if col.get('key') == column or col.get('title', '').lower() == column.lower():
                col['items'] = [new_task] + col.get('items', [])
                break
        
        doc_ref.set(columns if isinstance(columns, dict) else {"columns": columns})
        return {"success": True, "task": new_task}
    except Exception as e:
        return {"success": False, "error": str(e)}

def create_note(user_email, text, category="Personal", priority="Medium"):
    """Create a new Note"""
    if not db_admin:
        return {"success": False, "error": "Firebase not initialized"}
    
    import time
    try:
        doc_ref = db_admin.collection("GCCnotes").document(user_email)
        doc = doc_ref.get()
        
        notes = []
        if doc.exists:
            data = doc.to_dict()
            notes = data.get('notes', [])
        
        new_note = {
            "id": int(time.time() * 1000),
            "text": text,
            "category": category,
            "priority": priority,
            "pinned": False,
            "timestamp": time.time() * 1000
        }
        
        notes.insert(0, new_note)
        doc_ref.set({"notes": notes})
        return {"success": True, "note": new_note}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.route('/api/chat/query', methods=['POST'])
def chat_query():
    """Main chatbot query endpoint"""
    data = request.json
    message = data.get('message', '')
    user_email = data.get('userEmail', 'guest')
    language = data.get('language', 'en')
    history = data.get('history', [])
    
    if not message:
        return jsonify({"success": False, "error": "No message provided"}), 400
    
    try:
        context_data = ""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['task', 'todo', 'tasks', 'कार्य', 'பணி', 'today', 'आज', 'show', 'दिखाओ']):
            todos = search_todos(user_email, "")
            if todos:
                context_data += f"\n\nUser's ToDo tasks ({len(todos)} found):\n"
                for t in todos[:10]:
                    context_data += f"- {t['title']} ({t['column']}, {t['status']})\n"
        
        if any(word in message_lower for word in ['note', 'notes', 'नोट', 'குறிப்பு']):
            notes = search_notes(user_email, "")
            if notes:
                context_data += f"\n\nUser's Notes ({len(notes)} found):\n"
                for n in notes[:10]:
                    context_data += f"- [{n['category']}] {n['text']}\n"
        
        if any(word in message_lower for word in ['product', 'inventory', 'stock', 'glasses', 'frame', 'उत्पाद', 'பொருள்', 'sunglasses']):
            search_term = message.lower().replace('product', '').replace('find', '').replace('search', '').replace('show', '').replace('inventory', '').strip()
            products = search_inventory(search_term if len(search_term) > 2 else "")
            if products:
                context_data += f"\n\nInventory products ({len(products)} found):\n"
                for p in products[:10]:
                    context_data += f"- {p['name']} ({p['brand']}, {p['category']}, ₹{p['cost']})\n"
        
        if any(word in message_lower for word in ['sale', 'sales', 'revenue', 'order', 'orders', 'income', 'बिक्री', 'விற்பனை', 'money', 'earning']):
            sales_data = search_sales("")
            if sales_data:
                summary = sales_data[0] if sales_data[0].get('type') == 'sales_summary' else None
                if summary:
                    context_data += f"\n\nSales Summary:\n"
                    context_data += f"- Total Orders: {summary['totalOrders']}\n"
                    context_data += f"- Total Revenue: ₹{summary['totalRevenue']}\n"
                    context_data += f"- Category Breakdown:\n"
                    for cat, amount in summary.get('categoryBreakdown', {}).items():
                        context_data += f"  • {cat}: ₹{round(amount, 2)}\n"
        
        messages = [{"role": "system", "content": CHATBOT_SYSTEM_PROMPT + context_data}]
        
        for h in history[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        
        messages.append({"role": "user", "content": message})
        
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        result = response.json()
        
        if response.status_code == 200 and 'choices' in result:
            bot_response = result['choices'][0]['message']['content']
            
            action_result = None
            if '[ACTION]' in bot_response and '[/ACTION]' in bot_response:
                try:
                    action_start = bot_response.index('[ACTION]') + 8
                    action_end = bot_response.index('[/ACTION]')
                    action_json = bot_response[action_start:action_end]
                    action = json.loads(action_json)
                    
                    if action.get('type') == 'create_todo':
                        action_result = create_todo_task(user_email, action.get('title', 'New Task'), action.get('column', 'today'), action.get('description', ''))
                    elif action.get('type') == 'create_note':
                        action_result = create_note(user_email, action.get('text', 'New Note'), action.get('category', 'Personal'), action.get('priority', 'Medium'))
                    
                    bot_response = bot_response.replace(f'[ACTION]{action_json}[/ACTION]', '').strip()
                except Exception as e:
                    print(f"Action parsing error: {e}")
            
            return jsonify({"success": True, "response": bot_response, "action": action_result})
        else:
            error_msg = result.get('error', {}).get('message', 'Chat request failed')
            return jsonify({"success": False, "error": error_msg}), 200
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 200

@app.route('/api/chat/search', methods=['POST'])
def chat_search():
    """Cross-platform search endpoint"""
    data = request.json
    query = data.get('query', '')
    user_email = data.get('userEmail', 'guest')
    platforms = data.get('platforms', ['todo', 'notes', 'inventory', 'sales'])
    
    results = {"todos": [], "notes": [], "products": [], "sales": []}
    
    if 'todo' in platforms:
        results["todos"] = search_todos(user_email, query)
    if 'notes' in platforms:
        results["notes"] = search_notes(user_email, query)
    if 'inventory' in platforms:
        results["products"] = search_inventory(query)
    if 'sales' in platforms:
        results["sales"] = search_sales(query)
    
    total = len(results["todos"]) + len(results["notes"]) + len(results["products"]) + len(results["sales"])
    return jsonify({"success": True, "query": query, "results": results, "total": total})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5009)

