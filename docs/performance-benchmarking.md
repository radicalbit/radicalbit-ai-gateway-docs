# Performance Benchmarking

The Radicalbit AI Gateway includes comprehensive benchmarking tools to measure performance, latency, and overhead compared to direct API calls.

## Benchmark Types

### 1. Real API Benchmark
Compares gateway performance against direct API calls to measure real-world overhead.

### 2. Mock Benchmark
Measures pure gateway overhead using mock models without external dependencies.

## Real API Benchmark

### Requirements
- Set `OPENAI_API_KEY` (used for both direct and gateway unless you override `GATEWAY_TOKEN`)
- Gateway running locally or reachable via `ENDPOINT_GATEWAY`
- Both direct and gateway must use the **same model** for accurate comparison

### Usage

**Non-stream benchmark:**
```bash
OPENAI_API_KEY=sk-... N=50 WARMUP=5 CONC=5 \
bash benchmarks/test_performance_nostream_v2.sh
```

**Stream benchmark:**
```bash
OPENAI_API_KEY=sk-... N=50 WARMUP=5 CONC=5 \
bash benchmarks/test_performance_stream_v2.sh
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `N` | 50 | Number of requests per target (direct + gateway) |
| `WARMUP` | 5 | Number of warm-up requests for gateway |
| `CONC` | 1 | Concurrency level (parallel requests) |
| `ENDPOINT_DIRECT` | `https://api.openai.com/v1/chat/completions` | Direct OpenAI endpoint |
| `ENDPOINT_GATEWAY` | `http://127.0.0.1:8000/v1/chat/completions` | Gateway endpoint |
| `MODEL_DIRECT` | `gpt-4o-mini` | Model for direct calls |
| `MODEL_GATEWAY` | `gpt-4o-mini` | Model for gateway calls (route name) |
| `GATEWAY_AUTH_HEADER` | `Authorization` | Auth header type (`Authorization` or `api-key`) |
| `GATEWAY_TOKEN` | `$OPENAI_API_KEY` | Token for gateway authentication |
| `MAX_TIME` | 30 | Request timeout in seconds |
| `CONNECT_TIMEOUT` | 5 | Connection timeout in seconds |
| `OUTDIR` | `results` | Output directory for summary files |

### Output

**Summary files** (saved in `OUTDIR`):
- `summary_nostream_v2_YYYYMMDD_HHMMSS.txt` - Non-stream results
- `summary_stream_v2_YYYYMMDD_HHMMSS.txt` - Stream results

**Summary includes:**
- Timestamp and git commit hash
- Configuration used
- Performance metrics: p50, p95, average for TTFB and total time
- Overhead calculations: gateway vs direct comparison
- Sample counts for each target

**Example output:**
```
# LLM Gateway Benchmark v2 (non-stream)
timestamp: 20250919_173601
git_commit: a1b2c3d4e5f6...
N: 30  warmup: 5  conc: 1
direct:  https://api.openai.com/v1/chat/completions  | model: gpt-4o-mini
gateway: http://127.0.0.1:8000/v1/chat/completions | model: gpt-4o-mini | auth header: Authorization

Direct   (n=30)
  TTFB  p50: 0.655s   p95: 1.056s   avg: 0.708s
  Total p50: 0.658s  p95: 1.056s  avg: 0.713s
Gateway  (n=35)
  TTFB  p50: 0.596s   p95: 1.610s   avg: 0.809s
  Total p50: 0.596s  p95: 1.610s  avg: 0.810s
Overhead p50 (total): -9.48% (gw 0.596s vs direct 0.658s)
Overhead p95 (total): 52.45% (gw 1.610s vs direct 1.056s)
Overhead avg (total): 13.56% (gw 0.810s vs direct 0.713s)
```

## Mock Benchmark (Pure Overhead Test)

### Purpose
- Measure intrinsic gateway processing overhead
- Test without API costs or network dependencies
- Run offline (no internet connection required)
- Eliminate external variables for accurate overhead measurement

### Usage

```bash
# Basic mock benchmark
bash benchmarks/test_performance_mock_v2.sh

# With custom parameters
N=200 WARMUP=20 CONC=5 bash benchmarks/test_performance_mock_v2.sh
```

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `N` | 100 | Number of requests to gateway |
| `WARMUP` | 10 | Warm-up requests |
| `CONC` | 1 | Concurrency level |
| `MODEL_GATEWAY` | `mock-benchmark` | Mock route name |
| `ENDPOINT_GATEWAY` | `http://127.0.0.1:8000/v1/chat/completions` | Gateway endpoint |
| `GATEWAY_AUTH_HEADER` | `Authorization` | Auth header type |
| `GATEWAY_TOKEN` | `test-token` | Token for authentication |

### Gateway Configuration Required

Add this route to your `config.yaml`:

```yaml
routes:
  mock-benchmark:
    risk: minimal
    chat_models:
      - model_id: mock-chat-bench
        model: mock/gateway
        params:
          latency_ms: 50
          response_text: "Mock response for benchmark testing"
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 1000
```

### Output

**Summary file**: `summary_mock_v2_YYYYMMDD_HHMMSS.txt`

**Example output:**
```
# LLM Gateway Mock Benchmark v2 (pure overhead test)
timestamp: 20250919_180000
git_commit: a1b2c3d4e5f6...
N: 100  warmup: 10  conc: 1
gateway: http://127.0.0.1:8000/v1/chat/completions | model: mock-benchmark | auth header: Authorization
purpose: Measure pure gateway overhead using mock models

Gateway Mock  (n=100)
  TTFB  p50: 0.012s   p95: 0.025s   avg: 0.015s
  Total p50: 0.013s  p95: 0.026s  avg: 0.016s

=== Analysis ===
This test measures pure gateway overhead using mock models.
No external API calls or network latency are involved.

Gateway p50 (total): 0.013s
Gateway p95 (total): 0.026s
Gateway avg (total): 0.016s

Expected overhead sources:
- Request parsing and validation
- Route resolution and model selection
- Response formatting and serialization
- Logging and metrics collection
- Any configured middleware (guardrails, rate limiting, etc.)
```

## Benchmarking Best Practices

### 1. Model Consistency
Ensure both `MODEL_DIRECT` and `MODEL_GATEWAY` use the same underlying model for accurate comparison.

### 2. Gateway Configuration
The gateway route name should be configured in your `config.yaml` to point to the same model as the direct calls.

### 3. Realistic Results
Expect the gateway to have some overhead (typically 10-30%) compared to direct calls.

### 4. Git Tracking
Each benchmark run includes the git commit hash for traceability.

### 5. Multiple Runs
Run benchmarks multiple times to get consistent results and identify performance regressions.

## Performance Analysis

### Overhead Sources

The gateway adds overhead from several sources:

1. **Request Processing**: Parsing, validation, and routing
2. **Model Selection**: Load balancing and fallback logic
3. **Guardrails**: Content filtering and safety checks
4. **Rate Limiting**: Request throttling and token counting
5. **Caching**: Cache lookup and storage operations
6. **Metrics Collection**: Performance monitoring and logging
7. **Response Formatting**: Serialization and error handling

### Optimization Strategies

1. **Minimize Guardrails**: Use only necessary guardrails for performance-critical routes
2. **Optimize Caching**: Configure appropriate TTL values for your use case
3. **Load Balancing**: Use efficient algorithms like round-robin for simple cases
4. **Connection Pooling**: Reuse connections to external APIs
5. **Async Processing**: Use asynchronous operations where possible

## Continuous Integration

### Automated Benchmarking

Integrate benchmarks into your CI/CD pipeline:

```yaml
# .github/workflows/benchmark.yml
name: Performance Benchmark
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Gateway
        run: |
          docker compose up -d
          sleep 30
      - name: Run Mock Benchmark
        run: |
          N=50 WARMUP=5 CONC=2 bash benchmarks/test_performance_mock_v2.sh
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: results/
```

### Performance Regression Detection

Set up alerts for performance regressions:

```bash
#!/bin/bash
# Check for performance regressions
CURRENT_OVERHEAD=$(grep "Overhead avg" results/summary_mock_v2_*.txt | tail -1 | awk '{print $4}' | sed 's/%//')
THRESHOLD=20

if (( $(echo "$CURRENT_OVERHEAD > $THRESHOLD" | bc -l) )); then
  echo "Performance regression detected: $CURRENT_OVERHEAD% overhead exceeds threshold of $THRESHOLD%"
  exit 1
fi
```

## Next Steps

- **[Monitoring](./monitoring.md)** - Set up observability and metrics
- **[Configuration Guide](./configuration/advanced-configuration.md)** - Optimize your configuration
