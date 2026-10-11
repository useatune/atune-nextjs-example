// proxy.ts (Next.js 16; on Next.js 14/15 this file is middleware.ts)
//
// Atune capture, chained with Clerk. Clerk keeps its job (authentication and
// route protection); Atune only records the request afterwards.
// Docs: https://useatune.com/docs/sdk/middleware
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAtuneMiddleware } from "atune";

// Pages anyone can open, plus the Clerk webhook (it verifies its own signature).
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
]);

export default clerkMiddleware(async (auth, request) => {
  // 1. Your existing auth policy, unchanged.
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // 2. Atune capture. The account is the customer you bill: here the Clerk
  //    Organization (the team), never the individual user. We pass it with
  //    getAccount, read from the session Clerk just verified, so the mapping is
  //    explicit. No organization means no account, and no event is sent.
  const { userId, orgId } = await auth();
  const atune = createAtuneMiddleware({
    getAccount: () => (userId && orgId ? { accountId: orgId, userId } : null),
  });

  // Pass the response you would have returned anyway. atune() returns it
  // unchanged and records the request in the background (fire-and-forget,
  // request bodies are never read).
  return atune(request, NextResponse.next());
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
