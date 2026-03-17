# Telemetry

The Radicalbit AI Gateway exports invocation telemetry using the **OpenTelemetry (OTEL)** protocol through the [OpenLLMetry](https://github.com/traceloop/openllmetry) library.

The gateway distinguishes between two types of trace destinations:

- **Internal collector** (`COLLECTOR_BASE_URL`) — the gateway's own built-in OTel Collector, used to store traces in ClickHouse for internal analytics and monitoring.
- **Extra custom exporters** (`OTLP_EXPORTERS`) — additional OTLP destinations you bring yourself (e.g. Jaeger, Grafana Tempo, external platforms).

Both can be used together. Traces are fanned out to all configured destinations simultaneously.

---

## Internal Collector

Set **`COLLECTOR_BASE_URL`** to point the gateway at its built-in OTel Collector. This collector writes traces to ClickHouse and powers the gateway's internal observability features.

```yaml
environment:
  COLLECTOR_BASE_URL: http://otel-collector:4318/v1/traces
```

When using the provided `docker-compose.yaml`, the `otel-collector` service is started automatically alongside the gateway and ClickHouse — no extra steps are needed.

:::tip
`COLLECTOR_BASE_URL` must include the full path (e.g. `/v1/traces`). Unlike `OTLP_EXPORTERS`, no path is appended automatically.
:::

---

## Extra Custom Exporters

**`OTLP_EXPORTERS`** accepts a JSON array of additional OTLP destinations. Each object defines one exporter:

```yaml
environment:
  OTLP_EXPORTERS: '[{"url": "http://jaeger:4318/v1/traces"}]'
```

### Exporter fields

| Field | Required | Description |
|---|---|---|
| **`url`** | Yes | OTLP-compatible endpoint (e.g. `http://localhost:4318`). If no path is provided, `/v1/traces` is appended automatically. |
| **`api_key`** | No | API key sent as `Authorization: Bearer <key>`. |
| **`headers`** | No | Additional HTTP headers as a JSON object, e.g. `{"X-Custom-Header": "value"}`. |

---

## Multiple Extra Exporters

You can send traces to more than one custom backend simultaneously by listing multiple exporter objects:

```yaml
environment:
  OTLP_EXPORTERS: '[{"url": "http://jaeger:4318/v1/traces"}, {"url": "http://my-platform:4318"}]'
```

This is useful for mirroring traces to a local collector and a remote platform at the same time.

---

## Authentication

If your telemetry destination requires authentication, use the `api_key` field (sent as `Authorization: Bearer`) or the `headers` field for custom auth schemes:

```yaml
environment:
  OTLP_EXPORTERS: '[{"url": "http://my-platform:4318/v1/traces", "api_key": "sk-my-key"}]'
```

Or with custom headers:

```yaml
environment:
  OTLP_EXPORTERS: '[{"url": "http://my-platform:4318/v1/traces", "headers": {"Authorization": "Basic sk-key"}}]'
```

---

## Radicalbit AI Monitoring Platform

One possible telemetry destination is the [Radicalbit AI Monitoring Platform](https://github.com/radicalbit/radicalbit-ai-monitoring).

After obtaining an API key, configure `OTLP_EXPORTERS` as follows:

```yaml
environment:
  COLLECTOR_BASE_URL: http://otel-collector:4318/v1/traces
  OTLP_EXPORTERS: '[{"url": "http://localhost:9000/api/otel", "api_key": "<YOUR_API_KEY>"}]'
```

That's it — your telemetry will now be exported to both the internal collector and the Radicalbit AI Monitoring Platform.

---

## Next Steps

- **[Monitoring](./monitoring.md)** — Configure Prometheus metrics and dashboards
- **[Deployment](../deployment/production.md)** — Production deployment reference
