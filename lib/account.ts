import "server-only";
import { auth } from "@clerk/nextjs/server";
import { customerAccount } from "./customer-account";

/**
 * The customer account for the current request, from the verified Clerk session.
 * Use it in server actions and route handlers (track(), understand()).
 * Returns null when the user is signed out or has no active team.
 */
export async function getCustomerAccount(): Promise<{ accountId: string; userId: string } | null> {
  return customerAccount(await auth());
}
