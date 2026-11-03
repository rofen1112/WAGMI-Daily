export function bindProjectsToReport(projects = [], reportId) {
  if (!reportId) throw new Error('A GitHub report id is required.');

  const ids = new Set();
  const repos = new Set();
  const uniqueProjects = [];

  // GitHub redirects can leave both an old owner path and its canonical path in
  // the intake list. Walk backwards so the most recently verified row wins.
  for (let index = projects.length - 1; index >= 0; index -= 1) {
    const project = projects[index];
    const id = String(project?.id ?? '').toLowerCase();
    const repo = String(project?.repo ?? '').toLowerCase();
    const duplicate = (id && ids.has(id)) || (repo && repos.has(repo));
    if (id) ids.add(id);
    if (repo) repos.add(repo);
    if (duplicate) continue;
    uniqueProjects.push({ ...project, sourceReportId: reportId });
  }

  return uniqueProjects.reverse();
}
