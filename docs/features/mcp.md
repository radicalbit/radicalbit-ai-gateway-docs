# MCP Proxy

:::info
*This feature is under development.*
:::

We are building **Model Context Protocol (MCP)** support into the Radicalbit AI Gateway, so that the Gateway can act as an MCP server for your agents and proxy the MCP servers you approve.

| Capability | Description |
|------------|-------------|
| MCP proxy | Expose upstream MCP servers on a route behind a single gateway endpoint |
| Transports | Streamable HTTP and stdio upstreams, mixed on the same route |
| Tool namespacing | Tools, prompts, and resources merged across servers and prefixed with `{alias}__` |
| Credential isolation | Static upstream headers from `!secret`, plus a per-server allowlist for client-supplied headers |
| Rate limiting | The route's `rate_limiting` applies to MCP calls: one JSON-RPC POST counts as one request |

## Configuration

Declare the upstream servers once, then reference them from the routes that may use them.

```yaml
mcp_servers:
  - alias: github
    transport: streamable_http
    url: https://api.githubcopilot.com/mcp/
    timeout: 30
    headers:
      Authorization: !secret GITHUB_MCP_TOKEN
```

The route then speaks MCP at `POST /{project}/{route}/mcp`, with the same API key as the chat endpoints:

```bash
curl http://localhost:9000/project-name/route-name/mcp \
  -H "Authorization: Bearer key" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```
