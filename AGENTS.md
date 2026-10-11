# Agent instructions

This repo is a reference app for wiring [Atune](https://useatune.com) into a
Next.js 16 + Clerk Organizations app. Coding agents work in it or copy patterns
from it. Keep changes small and keep the Atune wiring easy to find.

## Where the Atune wiring lives

| File | What |
|------|------|
| `proxy.ts` | Capture: `createAtuneMiddleware()` chained after `clerkMiddleware`, passing `{ account }` from the callback's `auth` (atune 0.1.5+). |
| `lib/customer-account.ts` | `customerAccount()`: the one mapping from a Clerk session to `{ accountId, userId }` (team = account). |
| `lib/account.ts` | `getCustomerAccount()`: that mapping for server actions and route handlers. |
| `app/projects/actions.ts` | `track("project.created", …)` from a server action. |
| `app/api/projects/[projectId]/export/route.ts` | `track("project.exported", …)` from a route handler. |
| `app/api/webhooks/clerk/route.ts` | `identify()` / `group()`, gated by `ATUNE_SEND_IDENTITY=true` (DPA). |
| `scripts/ask.mts` | `understand("account:<id>", "…")` with `knows: false` handling. |
| `mcp/` | MCP config snippets for Claude Code and Cursor (`npx atune mcp`). |

## Rules

- `ATUNE_API_KEY` is server-side only. Never put it in client code, a
  `NEXT_PUBLIC_` variable, a committed file or an AI chat. Ask the human to set
  it in `.env.local` or the host's environment.
- `ATUNE_URL` is optional and defaults to `https://useatune.com`. If set, it
  is the bare host, no path.
- With Clerk, pass the account from the `clerkMiddleware` callback's `auth`
  (`{ account: clerkAccount(auth) }`, or a custom mapping as here). Clerk's
  session can't be auto-detected inside a proxy.
- The account is the billable customer unit (here: the team / Clerk
  Organization), not the signed-in user. Use the same ID in capture, `track()`
  and `understand()`.
- Take `accountId` and `userId` from the verified server session. Never from a
  header, query or body the client sends.
- Don't rewrite auth to fit Atune. Keep the existing auth policy and add
  capture after it: `return atune(request, NextResponse.next(), { account })`.
- Don't await `track()` on a request path. It never throws.
- `identify()` / `group()` carry personal data and require an accepted DPA.
  Don't send names or emails any other way (not in event properties, not as IDs).
- Always branch on `result.knows` before using `understand()` answers. Don't
  invent an answer when `knows` is false.
- Only use APIs the `atune` package exports and the docs describe. Don't guess
  endpoints or options.

## Verify

- `npm run typecheck` and `npm run build` must pass. They work without real keys.
- Event delivery can only be checked against a real workspace: trigger an action,
  then **Settings → Event log** in Atune. An installer or build message is not
  proof that events arrive.

## Docs (markdown for agents)

- Index: https://useatune.com/llms.txt
- Any docs page as markdown: add `.mdx` to the URL, e.g.
  https://useatune.com/docs/sdk/middleware.mdx
- Key pages: `/docs/sdk/middleware`, `/docs/guides/nextjs`,
  `/docs/guides/named-events`, `/docs/sdk/identify`, `/docs/sdk/understand`,
  `/docs/guides/mcp-agent`
- Install prompt for agents: https://useatune.com/install.md
