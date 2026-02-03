# User Interface

The Radicalbit AI Gateway provides a web interface for monitoring and managing the gateway without modifying configuration files directly.

## Features

- **Dashboard**: Real-time overview of routes and metrics
- **Route Management**: View and manage configured routes
- **Group Management**: Create and manage API key groups
- **API Key Management**: Create, modify, and monitor API keys
- **Metrics**: Usage, cost, and performance analysis
- **Events**: View events and alerts

## Access

The UI is available at the same host as the gateway, typically:

```
http://localhost:8000
```

Authentication may be required depending on gateway configuration.

## Main Components

### Dashboard

Overview of all configured routes showing:
- Route status
- Aggregated metrics
- Visual feature indicators
- Time filters

See **[Dashboard](./dashboard.md)** for details.

### Groups

Organize API keys and manage route access:
- Create and modify groups
- Associate routes to groups
- Manage keys in groups

See **[Groups](./groups.md)** for details.

### API Keys

Authentication tokens for accessing routes:
- Create and generate keys
- Associate to groups
- Monitor usage

See **[API Keys](./keys.md)** for details.

## Visual Indicators

The UI uses colored icons to indicate feature status:
- **Gray**: Feature not configured
- **White with blue border**: Feature configured, no events in selected time window
- **Solid blue**: Feature configured with events in selected time window

## Time Filters

All UI sections support time filters for:
- Analyzing trends
- Comparing periods
- Monitoring costs per period

## Integration with Configuration

The UI complements YAML configuration:
- **YAML Configuration**: Defines routes, models, and features
- **UI**: Manages groups, keys, and monitoring

UI changes do not modify `config.yaml`. To modify routes and models, update the configuration file and restart the gateway.

## Next Steps

- **[Dashboard](./dashboard.md)** - Start with the main dashboard
- **[Groups](./groups.md)** - Learn to manage groups
- **[API Keys](./keys.md)** - Learn to manage API keys
