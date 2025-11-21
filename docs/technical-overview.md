# Technical Overview

The Radicalbit AI Gateway combines  **several integrated components that work together to manage, secure, and monitor AI applications.** Each component has a specific role, and together they form a flexible and observable architecture designed for management and control.


### The config.yaml file

To configure the Gateway, you need to create a single YAML configuration file. While you can choose any name, we refer to it as `config.yaml` throughout this documentation.
This file controls the entire behavior of the Gateway, defining all routes, models, and the features applied to them.


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

At the route level, you must define the route name (e.g., ‘customer-service’ in the above example).This name is important because you will  refer to it in your model client during application development and it also appears in the UI. Always choose a clear and  descriptive name.

Each key listed under ‘routes’ defines a separate API endpoint with its own configuration.

Within each route, you can define two primary model types:
* *chat_models*
* *embedding_models*

Both types are fully compliant with the **OpenAI standard**. Their detailed configuration will be explained later.

At the same level, you can configure the following features:
* *balancing*
* *fallback*
* *guardrails*
* *rate_limiting*
* *token_limiting*
* *caching*

Since *guardrails* and **caching** are used across multiple routes, they can be defined globally at the root level and subsequently referenced within specific routes.


### UI

The Gateway’s UI provides **a set of administrative and monitoring features** covering several aspects of your system:

* **Group and Key Management:** Create groups and API keys associating  them with routes.
* **Route Information:** View detailed information for each route.
* **Event Tracking:** Track events that occurred on a specific route and when they happened
* **Filtering:** Apply time filters to focus on specific time windows.
* **Cost Analysis:** Analyze cost trends across routes

The Routes section displays one row for each route defined in your `config.yaml` file. For each route, the UI indicates  which features such as caching, fallback, guardrails, and limiters are configured.

These features are represented by icons, each with a specific color and meaning:

* **Gray icon:** The feature is not configured.
* **White icon with blue outline:** The feature is configured, but no related events occurred during the selected time window.
* **Solid blue icon:** The feature is configured, and events have occurred within the selected time window

Clicking on a route row opens a detail panel, which includes the following sections:

* **Configuration:** Shows the YAML configuration for the selected route.
* **Curl:** Provides a ready-to-use Curl command to test the route.
* **Associations:** Lists the groups and API keys linked to the route.
* **Alerts:** Displays a summary of the last 10 events relating  to a specific feature.


### Authentication, Groups and Keys

The Gateway provides **route-level authentication** to ensure the security of your AI applications. Accessing a Gateway-managed application requires the client to present an **API Key** that has been generated via the UI.


```python
openai_client = openai.OpenAI(
    base_url="http://localhost:9000/v1",
    api_key="sk-rb-*******************"  # get the API KEY from the UI
)
```

Every API Key must be associated with a Group linked to one or more routes.This setup lets you track usage by **groups and keys** for any specific application.

The Gateway can integrate with your **Identity Provider (IDP)** to import existing users and groups managed within your organization.

The following operations are available, even without and IDP integration

* **Create an API Key:** For use as the client key for your model in your application.
* **Create a Group:** To be associated with one or more API Keys and routes.

### Routes

A Route defines the **set of models, logic, and controls managed by the Gateway** for your application. A route can include all the models (chat and embedding) used in your application, or be segmented based on your specific requirements.

It is important to understand that each route appears as a separate entry in the “Routes” section of the UI.

You configure a Route by defining it in the `config.yaml` file. The configuration allows you to specify:

* **Route name**
* **Model to use and its parameters**
* **Guardrails to apply**
* **Caching policies (semantic or exact)**
* **Rate limits and token limits**
* **Fallback logic for error handling or model unavailability**
* **Routing strategies across models or endpoints**

Once defined, the Route is visible and traceable from the UI, enabling direct monitoring and managing.


### Costs Management

The Gateway offers **tools to monitor and control the costs** across **your models and applications.**

You can apply the following cost-management strategies to help keep expenses under control:

* **Rate limiting:** Restricts the number of requests allowed per time interval.
* **Token limits:** Caps the number of tokens a model can process.
* **Caching:** Reduces redundant model calls using either semantic or exact cache.

A dedicated section in the UI facilitates cost monitoring, allowing you to track consumption metrics and identify potential optimization areas.
optimization areas.

### Logs and Metrics

**All events managed by the Gateway generate logs and metrics**, which can be accessed and analyzed in multiple ways.

**Logs** can be captured and aggregated by external Log Management systems such as Loki or Splunk, allowing you to centralize, search, and correlate the Gateway activity with other system components.

**Metrics**, on the other hand, are used to provide both real-time insights in the UI and in-depth analysis through Prometheus.The Prometheus integration enables you to query key performance indicators such as request rates, latency, cache hit ratio, and token consumption and to build detailed dashboards in tools like Grafana for advanced observability.

To sum it up :
* **Logs focus on event-level details** (requests, errors, and operational traces).
* **Metrics focus on quantitative monitoring** (performance, usage, and cost trends).

This dual approach provides comprehensive visibility of your Gateway’s behavior, **simplifying troubleshooting, performance tuning, and cost optimization.**