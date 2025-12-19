from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5009)


