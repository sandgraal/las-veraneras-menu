# Central Analytics Setup

GitHub Pages cannot securely write centralized analytics by itself because browser code cannot contain private tokens.

Use one of these endpoint options:

1. Google Apps Script Web App
2. Cloudflare Worker
3. Vercel Serverless Function
4. Netlify Function

The frontend optimizer is designed to POST events to a configured endpoint later, while keeping local analytics as a fallback.

Required event payload:

```json
{
  "site": "las-veraneras-menu",
  "event": "add",
  "id": "nachos",
  "value": 1,
  "timestamp": "2026-05-01T00:00:00.000Z"
}
```
