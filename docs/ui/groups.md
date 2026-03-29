# Groups

Groups in the Radicalbit AI Gateway allow organizing and managing route access centrally. A group can contain multiple API keys and can be associated with one or more routes.

## Overview

Groups provide an abstraction layer for access management:
- Group API keys logically (by team, project, or environment)
- Assign permissions at group level
- Monitor costs and aggregated usage per group
- Manage access to new routes by adding the group

## Groups Interface

### Groups List

The groups page shows a table with all created groups:
- **Group Name**: Identifying name
- **UUID**: Unique identifier
- **Number of Keys**: How many API keys belong to the group
- **Associated Routes**: Number of routes the group can access
- **Creation Date**: When the group was created
- **Actions**: Buttons to modify or delete

### Create a Group

To create a new group:
1. Click **"Create Group"** button
2. Enter the group name
3. Click **"Create"**

Group names must be unique within the gateway.

### Group Details

Clicking a group opens a detail panel showing:

#### General Information

- **Name**: Group name
- **UUID**: Unique identifier
- **Creation Date**: Creation timestamp

#### Associated API Keys

Shows all API keys belonging to the group:
- **Key Name**: Identifying name
- **Key UUID**: Unique identifier
- **Creation Date**: When the key was created
- **Actions**: Remove key from group

To add a key to the group:
1. Click **"Add Key"**
2. Select the key from the list (or enter UUID)
3. Confirm

#### Associated Routes

Shows all routes the group can access:
- **Route Name**: Route name
- **Association Date**: When the route was associated
- **Actions**: Remove route access

To associate a route to the group:
1. Click **"Add Route"**
2. Select the route from available routes
3. Confirm

**Note**: When associating a route to a group, all API keys in the group automatically gain access to that route.

## Operations

### Modify a Group

To modify the group name:
1. Click **"Edit"** next to the group
2. Modify the name in the input field
3. Save changes

**Note**: Changing the name does not affect existing associations (keys and routes).

### Delete a Group

To delete a group:
1. Click **"Delete"** button
2. Confirm deletion in the dialog

**Warning**: Deleting a group:
- Removes all route associations
- Does not delete API keys (they remain in the system without a group)
- Is irreversible

## Best Practices

### Organization

1. **Naming Convention**: Use consistent, descriptive names
   - Example: `{team}-{environment}` → `backend-production`

2. **Logical Structure**: Organize groups by:
   - Team or department
   - Environment (production, staging, development)
   - Project or application

3. **Separation**: Keep separate groups for:
   - Different environments
   - Different teams
   - Different projects

### Access Management

1. **Least Privilege**: Assign only necessary routes to each group
2. **Regular Review**: Periodically verify route-group associations
3. **Documentation**: Maintain clear documentation on group access

## Troubleshooting

### Group Not Visible

1. Check applied filters
2. Check search bar
3. Verify user permissions

### Keys Cannot Be Associated

1. Verify the key exists
2. Check permissions

### Routes Not Available

1. Verify the route is configured in `config.yaml`
2. Check the gateway was restarted
3. Check gateway logs

## Next Steps

- **[API Keys](./keys.md)** - How to create and manage API keys
- **[Dashboard](./dashboard.md)** - Main dashboard overview
- **[Monitoring](./../monitoring.md)** - Advanced monitoring
