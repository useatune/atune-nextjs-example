import { OrganizationList } from "@clerk/nextjs";
import { getCustomerAccount } from "@/lib/account";
import { listProjects } from "@/lib/projects";
import { createProjectAction } from "./actions";

export default async function ProjectsPage() {
  const account = await getCustomerAccount();

  // Projects belong to a team. Without an active team there is no customer
  // account, so we ask the user to pick or create one.
  if (!account) {
    return (
      <>
        <h1>Pick a team</h1>
        <p className="muted">Projects belong to a team. Create one or pick one you belong to.</p>
        <OrganizationList hidePersonal afterSelectOrganizationUrl="/projects" afterCreateOrganizationUrl="/projects" />
      </>
    );
  }

  const projects = listProjects(account.accountId);

  return (
    <>
      <h1>Projects</h1>
      <p className="muted">
        Atune account for this team: <code>{account.accountId}</code>
      </p>

      <form action={createProjectAction} className="inline">
        <input type="text" name="name" placeholder="New project name" required maxLength={80} />
        <button type="submit" className="primary">
          Create project
        </button>
      </form>

      {projects.length === 0 ? (
        <p className="muted">No projects yet.</p>
      ) : (
        <ul className="projects">
          {projects.map((project) => (
            <li key={project.id}>
              <span>{project.name}</span>
              <form action={`/api/projects/${project.id}/export`} method="post">
                <button type="submit">Export JSON</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
