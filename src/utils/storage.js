import { nanoid } from 'nanoid'
import { deflate, inflate } from 'pako'

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
  try {
    const json = JSON.stringify({ nodes, edges })
    const compressed = deflate(json)
    // Convert Uint8Array to base64 in chunks to avoid stack overflow
    let binary = ''
    const len = compressed.length
    for (let i = 0; i < len; i += 8192) {
      binary += String.fromCharCode(...compressed.subarray(i, i + 8192))
    }
    return btoa(binary)
  } catch {
    return btoa(encodeURIComponent(JSON.stringify({ nodes, edges })))
  }
}

export function decodeProjectData(encoded) {
  try {
    const binary = atob(encoded)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    return JSON.parse(inflate(bytes, { to: 'string' }))
  } catch {
    try {
      return JSON.parse(decodeURIComponent(atob(encoded)))
    } catch {
      return null
    }
  }
}
