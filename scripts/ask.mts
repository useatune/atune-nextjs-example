// Ask Atune about one of your customers.
//
//   npm run ask -- "account:org_123" "How is this team doing?"
//
// The entity uses the same account ID that capture sends: the Clerk
// Organization ID. Other entities: user:<accountId>/<userId>, feature:<key>,
// portfolio. Docs: https://useatune.com/docs/sdk/understand
//
// Runs on the server with ATUNE_API_KEY (and optional ATUNE_URL) from .env.local.
// Requires Node 22.18+ (runs TypeScript directly).
import { understand } from "atune";
import type { UnderstandResult } from "atune";

const [entity, ...words] = process.argv.slice(2);
const question = words.join(" ");

if (!entity || !question) {
  console.error('Usage: npm run ask -- "account:<orgId>" "<question>"');
  process.exit(1);
}

let result: UnderstandResult;
try {
  result = await understand(entity, question);
} catch (error) {
  // understand() throws when ATUNE_API_KEY is missing, or Atune answers with
  // an error status (for example 401 for a bad key, 402 when insight is locked).
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (result.knows) {
  console.log(result.answer);
  console.log(`\nConfidence: ${result.confidence}`);
  for (const citation of result.citations) {
    console.log(`- ${citation.signal}: ${citation.value} (${citation.when})`);
  }
  if (result.recommendedNext) console.log(`\nRecommended next: ${result.recommendedNext}`);
} else {
  // Not enough understanding yet. Don't force an answer. This alone does not
  // say whether capture is broken: check Settings -> Event log in Atune.
  console.log("Atune does not know enough about this yet.");
  console.log("Signals:", JSON.stringify(result.signals, null, 2));
}
