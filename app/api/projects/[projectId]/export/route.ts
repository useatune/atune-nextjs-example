import { track } from "atune";
import { getCustomerAccount } from "@/lib/account";
import { getProject } from "@/lib/projects";

// POST /api/projects/:projectId/export
// A route handler that sends a named event, the pattern from
// https://useatune.com/docs/guides/named-events
export async function POST(_request: Request, ctx: { params: Promise<{ projectId: string }> }) {
  const account = await getCustomerAccount();
  if (!account) return Response.json({ error: "No active team" }, { status: 401 });

  const { projectId } = await ctx.params;
  const project = getProject(account.accountId, projectId);
  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  void track("project.exported", {
    accountId: account.accountId,
    userId: account.userId,
    properties: { format: "json" },
  });

  return Response.json(project, {
    headers: { "Content-Disposition": `attachment; filename="project-${project.id}.json"` },
  });
}
