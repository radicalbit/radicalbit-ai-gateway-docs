# API Keys

API keys in the Radicalbit AI Gateway are authentication tokens used to access configured routes. Each API key belongs to one or more groups and can access routes associated with those groups.

## Overview

API keys provide:
- **Authentication**: Secure mechanism to authenticate requests
- **Traceability**: Usage tracking per key
- **Access Control**: Granular access management to routes
- **Cost Monitoring**: Cost analysis per key

## API Keys Interface

### Keys List

The keys page shows a table with all created API keys:
- **Key Name**: Identifying name
- **UUID**: Unique identifier
- **Groups**: Groups the key belongs to
- **Accessible Routes**: Number of routes accessible via this key
- **Creation Date**: When the key was created
- **Actions**: Buttons to view, modify, or delete

### Create a Key

To create a new API key:
1. Click **"Create Key"** button
2. Fill the form:
   - **Name**: Descriptive name (e.g., "Production App Key")
   - **Groups** (optional): Select one or more groups to associate
3. Click **"Create"**

After creation, the API key is generated and displayed. **Save the key immediately** because:
- It's shown only once
- It cannot be retrieved later
- It's required to authenticate requests

### Key Details

Clicking a key opens a detail panel showing:

#### General Information

- **Name**: Identifying name
- **UUID**: Unique identifier
- **API Key**: The key itself (masked for security, shown only at creation)
- **Creation Date**: Creation timestamp
- **State**: Active

#### Associated Groups

Shows all groups the key belongs to:
- **Group Name**: Group name
- **Group UUID**: Group identifier
- **Actions**: Remove key from group

To add the key to a group:
1. Click **"Add to Group"**
2. Select the group from the list
3. Confirm

**Note**: When adding a key to a group, the key automatically gains access to all routes associated with that group.

#### Accessible Routes

Shows all routes the key can access (via associated groups):
- **Route Name**: Route name
- **Group**: Group providing access

## Operations

### Modify a Key

To modify the key name:
1. Click **"Edit"** next to the key
2. Modify the name in the input field
3. Save changes

**Note**: 
- The API key value itself cannot be modified
- If the key is compromised, create a new key and delete the old one
- Changing the name does not affect existing associations

### Delete a Key

To permanently delete a key:
1. Click **"Delete"** button
2. Confirm deletion in the dialog

**Warning**: Deleting a key:
- Is irreversible
- Removes the key from all groups
- Immediately invalidates all future requests with that key
- Historical metrics remain available

### Regenerate a Key

If a key is compromised or lost:
1. Create a new key with the same name (or different)
2. Associate it to the same groups as the old key
3. Delete the old key
4. Update applications with the new key

## Using Keys

### Authentication in Requests

To use an API key in HTTP requests, include it in the `Authorization` header:

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "route-name",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Code Examples

**Python (OpenAI SDK)**
```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="http://localhost:8000/v1"
)

response = client.chat.completions.create(
    model="route-name",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**JavaScript/TypeScript**
```javascript
const response = await fetch('http://localhost:8000/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'route-name',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

## Security

### Best Practices

1. **Don't Share Keys**: Each key should be used by a single application or service
2. **Regular Rotation**: Rotate keys periodically (e.g., every 90 days)
3. **Secure Storage**: Store keys in environment variables or secret managers
4. **Never Commit**: Never include keys in source code or repositories
5. **Monitor Usage**: Regularly monitor usage to identify suspicious activity

### Access Management

1. **Least Privilege**: Assign only necessary routes
2. **Environment Separation**: Use different keys for production, staging, development
3. **Immediate Revocation**: Disable or delete compromised keys immediately

## Troubleshooting

### Key Not Working

If a key doesn't authenticate requests:
1. Verify the key is correct (fully copied)
2. Verify the key belongs to a group with access to the route
3. Check the Authorization header format: `Bearer {key}`
4. Check gateway logs for authentication errors

### Key Not Visible

1. Check applied filters
2. Check search bar
3. Verify user permissions

### Access Denied to Route

If you receive an access denied error:
1. Verify the key belongs to a group
2. Check the group is associated with the route
3. Verify the route exists in `config.yaml`
4. Check logs for specific details

## Next Steps

- **[Groups](./groups.md)** - How to create and manage groups
- **[Dashboard](./dashboard.md)** - Main dashboard overview
- **[Monitoring](./../monitoring.md)** - Advanced monitoring
