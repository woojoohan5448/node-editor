import { nanoid } from 'nanoid'

const STORAGE_KEY = 'linkwisdom_projects'
const ACTIVE_KEY = 'linkwisdom_active_project'

export function getProjects() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function getActiveProjectId() {
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveProjectId(id) {
  localStorage.setItem(ACTIVE_KEY, id)
}

export function createProject(name = '새 프로젝트') {
  const projects = getProjects()
  const project = {
    id: nanoid(8),
    name,
    nodes: [],
    edges: [],
    createdAt: Date.now(),
  }
  projects.push(project)
  saveProjects(projects)
  setActiveProjectId(project.id)
  return project
}

export function updateProject(id, updates) {
  const projects = getProjects()
  const idx = projects.findIndex(p => p.id === id)
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...updates }
    saveProjects(projects)
  }
}

export function deleteProject(id) {
  let projects = getProjects()
  projects = projects.filter(p => p.id !== id)
  saveProjects(projects)
  if (getActiveProjectId() === id) {
    if (projects.length > 0) {
      setActiveProjectId(projects[0].id)
    } else {
      localStorage.removeItem(ACTIVE_KEY)
    }
  }
}

export function getProject(id) {
  return getProjects().find(p => p.id === id) || null
}

export function encodeProjectData(nodes, edges) {
  const data = JSON.stringify({ nodes, edges })
  return btoa(encodeURIComponent(data))
}

export function decodeProjectData(encoded) {
  try {
    const data = JSON.parse(decodeURIComponent(atob(encoded)))
    return data
  } catch {
    return null
  }
}
