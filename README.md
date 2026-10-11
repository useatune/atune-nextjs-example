# Atune Next.js example

A small multi-tenant B2B app (people join teams, teams create projects) wired to
[Atune](https://useatune.com), the customer-understanding layer for software
builders. Use it to see how Atune fits into a real Next.js app, or copy the
pieces you need into your own.

Stack: Next.js 16 (App Router, `proxy.ts`), TypeScript, Clerk with
Organizations, and the [`atune`](https://www.npmjs.com/package/atune) SDK.

## What it shows

| What | Where | Docs |
|------|-------|------|
| Capture every signed-in request, chained after Clerk | [`proxy.ts`](proxy.ts) | [createAtuneMiddleware()](https://useatune.com/docs/sdk/middleware) |
| Resolve the account: the team (Clerk Organization), not the user | [`proxy.ts`](proxy.ts), [`lib/account.ts`](lib/account.ts) | [Next.js guide](https://useatune.com/docs/guides/nextjs) |
| Named event from a server action: `project.created` | [`app/projects/actions.ts`](app/projects/actions.ts) | [Track named events](https://useatune.com/docs/guides/named-events) |
| Named event from a route handler: `project.exported` | [`app/api/projects/[projectId]/export/route.ts`](app/api/projects/%5BprojectId%5D/export/route.ts) | [track()](https://useatune.com/docs/sdk/track) |
| Names and company names, only under a DPA | [`app/api/webhooks/clerk/route.ts`](app/api/webhooks/clerk/route.ts) | [identify() / group()](https://useatune.com/docs/sdk/identify) |
| Ask about a team, with `knows: false` handling | [`scripts/ask.mts`](scripts/ask.mts) | [understand()](https://useatune.com/docs/sdk/understand) |
| Give your coding agent customer understanding | [`mcp/`](mcp) | [Query from an AI agent (MCP)](https://useatune.com/docs/guides/mcp-agent) |

## 5-minute setup

You need Node 22.18 or later, a [Clerk](https://clerk.com) application and an
Atune workspace.

1. **Install**

   ```bash
   git clone <this repo> && cd atune-nextjs-example
   npm install
   cp .env.example .env.local
   ```

2. **Clerk.** In the Clerk dashboard, enable **Organizations**. Copy the
   publishable key and secret key into `.env.local`.

3. **Atune.** In Atune, open **Settings → API key**. Put the key in
   `ATUNE_API_KEY` in `.env.local` yourself. Don't paste it into an AI chat.
   Keep `ATUNE_URL=https://useatune.com` (the bare host, no path).

4. **Run**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000, sign up, create a team and create a project.

### Environment variables

| Variable | Secret | What |
|----------|--------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | no | Clerk publishable key. |
| `CLERK_SECRET_KEY` | yes | Clerk secret key. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | no | `/sign-in` and `/sign-up`. |
| `CLERK_WEBHOOK_SIGNING_SECRET` | yes | Optional. Only for the identity webhook. |
| `ATUNE_API_KEY` | yes | Atune workspace key. Server-side only. Never prefix it with `NEXT_PUBLIC_`. |
| `ATUNE_URL` | no | `https://useatune.com`. |
| `ATUNE_SEND_IDENTITY` | no | `true` only after you have accepted Atune's DPA. |

## Verify that events arrive

1. Signed in, with a team selected, open **Projects** and create a project.
2. In Atune, open **Settings → Event log**.
3. The newest events should include `http.get./projects` (from the proxy) and
   `project.created` (from `track()`). Each must carry your team's
   organization ID (`org_…`, shown on the Projects page) as the account and
   your Clerk user ID as the user.

Nothing there? Check that `ATUNE_API_KEY` is set, that `ATUNE_URL` is the bare
host, and that you have a team selected. Without a team there is no account,
and no event is sent. The SDK logs nothing by design.

## Ask a question

Once events arrive, ask Atune about the team:

```bash
npm run ask -- "account:org_123" "How is this team doing?"
```

Replace `org_123` with your organization ID. When there isn't enough
understanding yet, Atune returns `knows: false` instead of guessing, and the
script says so. With a single test team that is the expected answer at first.

## How it works

**Account = the customer you bill.** Here that is a team (a Clerk
Organization). The same organization ID is used in `proxy.ts`, in every
`track()` call and in `understand("account:<id>")`. A signed-in user with no
team selected has no account, so nothing is captured for them. Adjust
[`lib/account.ts`](lib/account.ts) if your billing unit is different.

**Capture.** [`proxy.ts`](proxy.ts) runs Clerk first (auth and route
protection stay exactly as they were), then hands the response to Atune.
Atune records the request as `http.<method>.<route>` in the background. It
never reads request bodies and never delays or breaks a request.

**Named events.** Behavior capture covers every request. `track()` adds a
few named business events where the code already knows the account:
`project.created` and `project.exported`. Pick 3 to 5 such moments in your
own product.

**Identity (optional, DPA required).** Atune works on opaque IDs. To see names
like "Kari at Acme", the Clerk webhook calls `group()` for organizations and
`identify()` for members. These carry personal data, so they only run when
`ATUNE_SEND_IDENTITY=true`, which you set after accepting Atune's
data-processing agreement. See
[Identity, PII & the DPA](https://useatune.com/docs/concepts/identity-pii).
To try it, add a webhook endpoint in Clerk pointing to
`/api/webhooks/clerk` with the events `organization.created`,
`organization.updated` and `organizationMembership.created`.

## Give your coding agent customer understanding (MCP)

`npx atune mcp` starts a local MCP server with one tool, `understand`. Your
agent can then answer questions like "which teams created projects this week?"
from real, cited signals.

- **Claude Code:** copy [`mcp/claude-code.mcp.json`](mcp/claude-code.mcp.json)
  to `.mcp.json` in your project root.
- **Cursor:** copy [`mcp/cursor.mcp.json`](mcp/cursor.mcp.json) to
  `.cursor/mcp.json`.

Both read `ATUNE_API_KEY` and `ATUNE_URL` from your environment, so no key is
written into the file. Export them in the shell that starts your editor. The
`${...}` variable syntax is the editors' own; check your editor's MCP docs if
the server does not start.

## Install Atune with an AI coding agent

Adding Atune to your own app? Give your coding agent the install prompt at
[useatune.com/install.md](https://useatune.com/install.md), or see
[Install with an AI coding agent](https://useatune.com/docs/get-started/ai-agent).
Set `ATUNE_API_KEY` yourself; the agent never needs to see it.

## Docs

- [Atune docs](https://useatune.com/docs)
- [Quickstart](https://useatune.com/docs/get-started/quickstart) and
  [Manual setup](https://useatune.com/docs/get-started/manual-setup)
- Markdown for agents: [useatune.com/llms.txt](https://useatune.com/llms.txt),
  or add `.mdx` to any docs URL.

## Telemetry

This app sends usage data to Atune only. Clerk telemetry is turned off in
[`app/layout.tsx`](app/layout.tsx). Next.js has its own anonymous build
telemetry; turn it off with `npx next telemetry disable`.

## License

[Apache-2.0](LICENSE), the same license as the `atune` SDK.

Christopher Krohn, Founder of Atune
