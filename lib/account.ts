import "server-only";
import { auth } from "@clerk/nextjs/server";

/**
 * The customer account for the current request, from the verified Clerk session.
 *
 * In this app a customer is a team (a Clerk Organization). That is the unit you
 * would bill, so it is the Atune account. Use the same mapping everywhere you
 * talk to Atune: in proxy.ts, in track() calls and in understand("account:<id>").
 *
 * Returns null when the user is signed out or has no active team.
 */
export async function getCustomerAccount(): Promise<{ accountId: string; userId: string } | null> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return null;
  return { accountId: orgId, userId };
}
