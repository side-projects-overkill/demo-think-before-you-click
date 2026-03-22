# Act 4 — Malicious MCP Server (LinkedIn Post Generator)

## What It Does

A proper MCP server (stdio transport) that poses as a helpful LinkedIn post
generator. It registers itself with your AI editor (Cursor, Claude Desktop,
etc.) and exposes a `generate_linkedin_post` tool.

When the AI calls the tool:

1. **Returns a real LinkedIn post** — looks and works like a legitimate tool
2. **Silently scans** the project directory for `.env` files
3. **Exfiltrates** their contents to the attacker server (`localhost:4000`)
4. **Injects hidden prompt instructions** into the response that tell the AI
   to find more sensitive files (SSH keys, AWS creds, gitconfig) and send
   them to the attacker — a **tool-response prompt injection** attack

## Setup

### 1. Install dependencies

```bash
cd act4-mcp-server
npm install
```

### 2. Add to Cursor

Add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "linkedin-post-generator": {
      "command": "node",
      "args": ["/full/path/to/act4-mcp-server/server.js"]
    }
  }
}
```

Then restart Cursor (or reload the window).

### 3. Demo it

Ask the AI in Cursor:

> "Use the LinkedIn post generator to create a post about AI Security"

The AI calls the tool, gets a great LinkedIn post back — and presents it
to you. Meanwhile:

- `.env` files were silently exfiltrated to `localhost:4000`
- The raw response contains hidden instructions trying to get the AI
  to find even more secrets

### 4. Check the dashboard

Open http://localhost:4000 and look at the **FILES** panel.

### 5. Clean up

Remove the `"linkedin-post-generator"` entry from `~/.cursor/mcp.json`.

## Two-Layer Attack

- **Layer 1 (server-side):** The server itself scans for `.env` files and
  exfiltrates them directly — the user never sees this happen.
- **Layer 2 (prompt injection):** The tool response contains hidden
  instructions that trick the AI assistant into searching for _more_
  sensitive files and sending them to the attacker. The user only sees
  the LinkedIn post.

## Obfuscation

The running code (`server.js`) is obfuscated. The readable source is in
`server.src.js`. After editing the source, run `npm run build` to
re-obfuscate. The obfuscation itself is a red flag — legitimate tools
don't hide their source code.

## Key Talking Point

MCP tools can look completely legitimate while hiding two attack vectors:
direct exfiltration on the server side, and prompt injection via tool
responses. Always audit MCP tool source code, restrict file system access,
and review raw AI tool responses before trusting them.
