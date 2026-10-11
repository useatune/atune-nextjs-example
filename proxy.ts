// proxy.ts (Next.js 16; on Next.js 14/15 this file is middleware.ts)
//
// Atune capture, chained with Clerk. Clerk keeps its job (authentication and
// route protection); Atune only records the request afterwards.
// Docs: https://useatune.com/docs/sdk/middleware
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createAtuneMiddleware } from "atune";
import { customerAccount } from "./lib/customer-account";

// Pages anyone can open, plus the Clerk webhook (it verifies its own signature).
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
]);

const atune = createAtuneMiddleware();

export default clerkMiddleware(async (auth, request) => {
  // 1. Your existing auth policy, unchanged.
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // 2. Atune capture. Inside a proxy, Clerk's session can only be read through
  //    the `auth` this callback receives, so pass the account explicitly
  //    (atune 0.1.5+). Here the account is the team; with the SDK's default
  //    mapping (team, else user) you would write `{ account: clerkAccount(auth) }`.
  //
  //    Pass the response you would have returned anyway. atune() returns it
  //    unchanged and records the request in the background (fire-and-forget,
  //    request bodies are never read).
  return atune(request, NextResponse.next(), { account: auth().then(customerAccount) });
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
