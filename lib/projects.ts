import "server-only";

// Demo storage: an in-memory map, scoped by team. It resets when the server
// restarts. Swap it for your database; the Atune wiring does not change.

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
};

const projectsByTeam = new Map<string, Project[]>();

export function listProjects(teamId: string): Project[] {
  return projectsByTeam.get(teamId) ?? [];
}

export function getProject(teamId: string, projectId: string): Project | undefined {
  return listProjects(teamId).find((project) => project.id === projectId);
}

export function createProject(teamId: string, name: string, createdBy: string): Project {
  const project: Project = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  projectsByTeam.set(teamId, [...listProjects(teamId), project]);
  return project;
}
