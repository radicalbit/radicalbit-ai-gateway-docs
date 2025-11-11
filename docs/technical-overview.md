

The Radicalbit AI Gateway is composed of several integrated components that work together to manage, secure, and monitor AI applications.
Each component has a specific role, and together they form a flexible and observable architecture designed for management and control.



### The config.yaml file

To configure the Gateway, you need to create a YAML configuration file (you can choose any name, but throughout this documentation we’ll refer to it as `config.yaml`).
This single file controls the entire behavior of the Gateway, defining all routes, models, and the features applied to them.

```yaml
# Definition of all routes
routes:
  # The name of your first route
  customer-service: 
    chat_models:
      - model_id: ...
        # chat model configuration...
      - model_id: ...
        # chat model configuration...
    embedding_models:
      - model_id: ...
        # embedding model configuration...
      - model_id: ...
        # embedding model configuration...
    balancing: { ... } # How to distribute requests among the models
    fallback: { ... } # What to do if a model fails
    guardrails: { ... } # Guardrails list for the route
    rate_limiting: { ... } # Limits on requests over time
    token_limiting: { ... } # Limits on tokens over time
    caching: { ... } # Caching rules for this specific route
  
  # The name of your second route
  another-route:
    # ... configuration for this route

guardrails: { ... } # Content safety and filtering rules

# Cache configuration
cache:
  redis_host: '...'
  redis_port: ...
```

At the route level, you must define the route name (e.g., `customer-service` in the example above).
This name is important because you’ll refer to it in your model client during application development — and it also appears in the UI.
Choose a clear, descriptive name.

Each key under `routes` defines a separate API endpoint with its own configuration.

Within each route, you can define two model types:

  * `chat_models`
  * `embedding_models`

Both are fully compliant with the OpenAI standard. Their detailed configuration will be explained later.

At the same level, you can configure the following features:

  * `balancing`
  * `fallback`
  * `guardrails`
  * `rate_limiting`
  * `token_limiting`
  * `caching`

Since `guardrails` and `caching` are used across multiple routes, they can also be defined globally at the root level, and then referenced in specific routes.

### UI

The Gateway’s UI provides a set of administrative and monitoring features covering several aspects of your system:

  * Create groups and API keys, and associate them with routes
  * View detailed information for each route
  * Track events that occurred on a specific route and when they happened
  * Apply time filters to focus on specific time windows
  * Analyze cost trends across routes

In the Routes section, you’ll find one row for each route defined in your `config.yaml` file.
For each route, the UI displays which features — such as `caching`, `fallback`, `guardrails`, and `limiters` — are configured.

These features are represented by icons, each with a specific color and meaning:

  * Gray icon → The feature is not configured
  * White icon with blue outline → The feature is configured, but no related events occurred during the selected time window
  * Solid blue icon → The feature is configured, and events have occurred within the selected time window

Clicking on a route row opens a detail panel, which provides the following sections:

  * **Configuration** — Displays the YAML configuration for the selected feature
  * **Curl** — Provides a ready-to-use Curl command to test the route
  * **Associations** — Lists the groups and API keys linked to the route
  * **Alerts** — Shows a summary of the last 10 events related to a specific feature

### Authentication, Groups and Keys

To ensure the security of your AI applications, the Gateway provides route-level authentication.
This means that in order to access an application managed by the Gateway, the client must include an API Key generated through the UI.

```python
openai_client = openai.OpenAI(
    base_url="http://localhost:9000/v1",
    api_key="sk-rb-*******************"  # get the API KEY from the UI
)
```

Each API Key must be associated with a Group, which in turn is linked to one or more routes.
This setup allows you to track which groups and keys are using a specific application.

The Gateway can also integrate with your Identity Provider (IDP), allowing it to import existing users and groups managed within your organization.

Regardless of whether an IDP is used, the following operations are available:

  * Create an API Key — to be used as the client key for your model within your application.
  * Create a Group — which can then be associated with one or more API Keys and routes.

### Routes

A Route represents the set of models used within your application, along with the logic and controls managed by the gateway.
A route can include all the models (both chat and embedding) used in your application, or it can be segmented according to your specific needs.

The key concept to understand is that each route is displayed as a separate entry in the “Routes” section of the UI.

To configure a Route, you must define it in the `config.yaml` file. Within this configuration, you can specify:

  * The Route name
  * The model to use and its parameters
  * Any guardrails to apply
  * Caching policies, either semantic or exact
  * Rate limits and token limits
  * Fallback logic for error handling or model unavailability
  * Load balancing strategies across models or endpoints

Once configured, the Route becomes visible and traceable from the UI, allowing you to monitor and manage it directly.

### Costs Management

The Gateway provides a set of tools to monitor and control the costs associated with your models and applications.

To help keep expenses under control, you can apply the following cost-management strategies:

  * Rate limiting — to restrict the number of requests per time interval
  * Token limits — to cap the number of tokens processed by a model
  * Caching — using either semantic or exact cache to reduce redundant model calls

Cost monitoring is available through a dedicated section in the UI, where you can track consumption metrics and identify potential optimization areas.

### Logs and Metrics

All events managed by the Gateway generate logs and metrics, which can be accessed and analyzed in multiple ways.

Logs can be captured and aggregated by external Log Management systems such as Loki or Splunk, allowing you to centralize, search, and correlate the Gateway activity with other system components.

Metrics, on the other hand, are used to provide both real-time insights in the UI and in-depth analysis through Prometheus.
Prometheus integration enables you to query key performance indicators — such as request rates, latency, cache hit ratio, and token consumption — and to build detailed dashboards in tools like Grafana for advanced observability.

In summary:

  * Logs focus on event-level details (requests, errors, and operational traces).
  * Metrics focus on quantitative monitoring (performance, usage, and cost trends).

This dual approach ensures full visibility into your Gateway’s behavior, simplifying troubleshooting, performance tuning, and cost optimization.