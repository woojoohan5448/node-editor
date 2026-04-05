import { nanoid } from 'nanoid'
import pako from 'pako'

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

function toBase64Url(uint8) {
  let binary = ''
  for (let i = 0; i < uint8.length; i += 8192) {
    binary += String.fromCharCode(...uint8.subarray(i, i + 8192))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  return Uint8Array.from(binary, c => c.charCodeAt(0))
}

export function encodeProjectData(nodes, edges) {
  try {
    const json = JSON.stringify({ nodes, edges })
    const compressed = pako.deflate(json)
    return toBase64Url(compressed)
  } catch {
    return btoa(encodeURIComponent(JSON.stringify({ nodes, edges })))
  }
}

export function decodeProjectData(encoded) {
  // Try pako compressed (base64url)
  try {
    const bytes = fromBase64Url(encoded)
    return JSON.parse(pako.inflate(bytes, { to: 'string' }))
  } catch { /* not pako format */ }
  // Fallback: old uncompressed base64
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch {
    return null
  }
}
