"use server";

import { revalidatePath } from "next/cache";
import { track } from "atune";
import { getCustomerAccount } from "@/lib/account";
import { createProject, listProjects } from "@/lib/projects";

export async function createProjectAction(formData: FormData) {
  const account = await getCustomerAccount();
  if (!account) throw new Error("Pick or create a team first.");

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  if (!name) return;

  createProject(account.accountId, name, account.userId);

  // Named event for a meaningful action. accountId comes from the verified
  // session, never from the form. Not awaited: track() never throws and never
  // delays the response. Docs: https://useatune.com/docs/guides/named-events
  void track("project.created", {
    accountId: account.accountId,
    userId: account.userId,
    properties: { projectCount: listProjects(account.accountId).length },
  });

  revalidatePath("/projects");
}
