import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { group, identify } from "atune";

// Clerk webhook -> Atune identity.
//
// identify() and group() send personal data (names, emails, company names).
// They flow only under an accepted data-processing agreement (DPA) with Atune,
// so this route does nothing until ATUNE_SEND_IDENTITY=true.
// Docs: https://useatune.com/docs/sdk/identify and https://useatune.com/docs/concepts/identity-pii
//
// Subscribe to these events in the Clerk dashboard (Webhooks):
// organization.created, organization.updated, organizationMembership.created.
// The signing secret goes in CLERK_WEBHOOK_SIGNING_SECRET.
export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (process.env.ATUNE_SEND_IDENTITY !== "true") {
    return new Response(null, { status: 204 });
  }

  // identify()/group() are awaited here on purpose: if Atune cannot be reached,
  // the route fails and Clerk retries the webhook later.
  switch (event.type) {
    case "organization.created":
    case "organization.updated":
      // The team is the account, so the account ID is the organization ID.
      await group(event.data.id, { company: event.data.name });
      break;

    case "organizationMembership.created": {
      const { organization, public_user_data: user } = event.data;
      const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || undefined;
      const email = user.identifier.includes("@") ? user.identifier : undefined;
      // Pass accountId so the person is linked to the same account capture uses.
      await identify(user.user_id, { name, email }, { accountId: organization.id });
      break;
    }
  }

  return new Response(null, { status: 204 });
}
