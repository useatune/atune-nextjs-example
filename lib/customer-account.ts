/**
 * The one mapping from a Clerk session to an Atune account, shared by
 * proxy.ts (capture) and lib/account.ts (track() and understand()).
 *
 * In this app a customer is a team (a Clerk Organization). That is the unit you
 * would bill, so it is the Atune account. A signed-in user with no active team
 * has no account, and nothing is captured for them.
 *
 * If your billing unit is the individual user when there is no team, use the
 * SDK's `clerkAccount(auth)` in proxy.ts instead: it does exactly that.
 */
export function customerAccount(session: { userId?: string | null; orgId?: string | null }): { accountId: string; userId: string } | null {
  if (!session.userId || !session.orgId) return null;
  return { accountId: session.orgId, userId: session.userId };
}
