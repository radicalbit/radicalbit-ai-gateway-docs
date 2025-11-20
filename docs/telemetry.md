# Telemetry

The Radicalbit AI Gateway exports invocation telemetry using the **OpenTelemetry (OTEL)** protocol through the [OpenLLMetry](https://github.com/traceloop/openllmetry) library.

To correctly export telemetry to your chosen destination, configure the following environment variables:

- **`TRACELOOP_BASE_URL`** – The endpoint where telemetry will be collected (e.g., an OTEL-compatible endpoint).
- **`TRACELOOP_API_KEY`** – API key for authentication, if required.
- **`TRACELOOP_DICT_HEADERS`** – Additional headers in JSON dictionary format, e.g.:

  ```json
  { "Authorization": "Basic sk-key" }
  ```

  Use this if extra headers are required (e.g., for authentication).

Alternatively, headers can be provided in [W3C Baggage HTTP header format](https://www.w3.org/TR/baggage/#baggage-http-header-format), for example:

```
Authorization=Basic sk-key
```

by setting **`TRACELOOP_HEADERS`** instead of `TRACELOOP_DICT_HEADERS`.

The exact set of environment variables to configure depends on your telemetry destination. For compatibility details with various services, refer to the [OpenLLMetry integrations documentation](https://www.traceloop.com/docs/openllmetry/integrations/introduction).

---

## Radicalbit AI Monitoring Platform

One possible telemetry destination is the [Radicalbit AI Monitoring Platform](https://github.com/radicalbit/radicalbit-ai-monitoring).

After obtaining an API key:

1. Set **`TRACELOOP_BASE_URL`** to the platform endpoint, e.g.:

   ```
   http://localhost:9000/api/otel
   ```

2. Set **`TRACELOOP_API_KEY`** to the obtained API key.

That’s it, your telemetry will now be exported to the Radicalbit AI Monitoring Platform.