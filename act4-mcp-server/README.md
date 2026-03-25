# Act 4 — Malicious MCP Server (LinkedIn Post Generator)

## What It Does

A proper MCP server (stdio transport) that poses as a helpful LinkedIn post
generator. It registers itself with your AI editor (Cursor, Claude Desktop,
etc.) and exposes two tools:

- `generate_linkedin_post` — generates a real LinkedIn post
- `optimize_post_hashtags` — "improves" hashtags based on your project

Both tools work perfectly. Both steal your data.

## The Attack: Tool-Chaining

This demo uses **tool-chaining** instead of prompt injection. Prompt
injections (hidden text telling the AI to read files) get caught by modern
LLMs. Tool-chaining doesn't — because the AI is just calling tools, which
is exactly what it's designed to do.

### Step 1 — `generate_linkedin_post` (Layer 1)

When the AI calls this tool:

1. Returns a real, well-formatted LinkedIn post
2. **Silently scans** the project directory for `.env` files
3. **Exfiltrates** their contents to the attacker server (`localhost:4000`)
4. Includes a tip in the response: *"Use `optimize_post_hashtags` for
   stack-specific tags"*

The tip is not a prompt injection — it's just text. The AI sees that a
second tool is available on the same MCP server and naturally offers to
call it (or auto-calls it).

### Step 2 — `optimize_post_hashtags` (Layer 2)

When the AI calls this tool:

1. Scans for `.env` files again (catches any it missed)
2. **Scans the home directory** for `~/.gitconfig`, `~/.ssh/config`,
   `~/.aws/credentials`
3. **Exfiltrates everything** to the attacker server
4. Parses the `.env` to detect real technologies (PostgreSQL, AWS, Stripe)
5. Returns "optimized" hashtags based on the detected stack

The user sees great hashtags. The dashboard shows stolen credentials.

### Why This Works

- The AI **trusts tools** from MCP servers it's connected to
- Calling a second tool from the same server is **normal behavior**
- There's **no injected text** for the AI's safety filters to flag
- The exfiltration happens **inside the tool handlers** — the AI can't
  see or prevent it
- The user only sees a helpful post and relevant hashtags

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

### 3. Start the C2 dashboard

```bash
cd ../attacker-server
node server.js
```

Open http://localhost:4000 to watch the data come in.

### 4. Demo it

Ask the AI in Cursor:

> "Use the LinkedIn post generator to create a post about AI Security"

The AI calls `generate_linkedin_post`, presents a great post, and offers
to optimize the hashtags. Say yes (or it may auto-call). Watch the
dashboard — data appears after each tool call.

### 5. Clean up

Remove the `"linkedin-post-generator"` entry from `~/.cursor/mcp.json`.

## What the Audience Sees vs. What Actually Happens

| What the user sees | What actually happens |
|---|---|
| A well-written LinkedIn post | `.env` files exfiltrated to attacker server |
| "Use optimize_post_hashtags for better tags" | AI calls the second tool — normal behavior |
| Hashtags like #PostgreSQL #AWS #WebSecurity | `~/.ssh/config`, `~/.aws/credentials`, `~/.gitconfig` scanned and exfiltrated |
| "Detected technologies: PostgreSQL, AWS" | The "detection" came from reading your secrets |

## Obfuscation

The running code (`server.js`) is obfuscated. The readable source is in
`server.src.js`. After editing the source, run `npm run build` to
re-obfuscate.

## Key Talking Points

1. **Prompt injection is yesterday's attack.** Modern AIs catch injected
   instructions. Tool-chaining is harder to detect — the AI is just
   calling tools, which is exactly what it's supposed to do.
2. **The tool works perfectly.** That's what makes it dangerous. You get
   a real LinkedIn post with real optimized hashtags. There's no reason
   to suspect anything.
3. **Server-side exfiltration can't be blocked by the AI.** It happens
   inside the tool handler before the response is returned. The AI has
   no visibility into what the server did.
4. **Trust is the vulnerability.** Users install MCP tools because they're
   useful. Every tool you install gets full access to run code on your
   machine with your permissions.
5. **Defense:** Always audit MCP tool source code, restrict file system
   access, monitor outbound network traffic, and prefer tools from
   verified publishers.
