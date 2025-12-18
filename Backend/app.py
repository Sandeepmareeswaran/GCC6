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
        
        # New API uses POST with JSON body
        payload = {
            "jql": f"project={project_key} ORDER BY created DESC",
            "maxResults": 50,
            "fields": ["summary", "status", "priority", "assignee", "issuetype", "created"]
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
                issues.append({
                    "key": issue.get("key"),
                    "summary": fields.get("summary"),
                    "status": status_obj.get("name", "Unknown"),
                    "statusCategory": status_category.get("key", "new"),
                    "priority": fields.get("priority", {}).get("name") if fields.get("priority") else None,
                    "assignee": fields.get("assignee", {}).get("displayName") if fields.get("assignee") else "Unassigned",
                    "issueType": fields.get("issuetype", {}).get("name") if fields.get("issuetype") else "Task",
                    "created": fields.get("created")
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
