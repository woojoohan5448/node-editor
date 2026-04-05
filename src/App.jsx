import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { nanoid } from 'nanoid'
import CustomNode from './components/CustomNode'
import EditModal from './components/EditModal'
import PublishModal from './components/PublishModal'
import Toolbar from './components/Toolbar'
import ZoomControls from './components/ZoomControls'
import ProjectSelector from './components/ProjectSelector'
import SettingsModal from './components/SettingsModal'
import SearchPanel from './components/SearchPanel'
import EdgeToolbar from './components/EdgeToolbar'
import {
  getProjects,
  getActiveProjectId,
  setActiveProjectId,
  createProject,
  updateProject,
  deleteProject,
  getProject,
} from './utils/storage'
import { initialNodes, initialEdges } from './data/snapshotData'

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#94a3b8', strokeWidth: 1.5 },
}

export default function App() {
  const [projects, setProjects] = useState(() => {
    // ?reset 쿼리 파라미터로 초기화 지원
    if (window.location.search.includes('reset')) {
      localStorage.removeItem('linkwisdom_projects')
      localStorage.removeItem('linkwisdom_active_project')
      window.history.replaceState({}, '', window.location.pathname)
    }
    const p = getProjects()
    if (p.length === 0) {
      const proj = createProject('AI 교육 자료')
      updateProject(proj.id, { nodes: initialNodes, edges: initialEdges })
      return getProjects()
    }
    return p
  })
  const [activeId, setActiveId] = useState(() => {
    const id = getActiveProjectId()
    if (id && getProject(id)) return id
    const p = getProjects()
    if (p.length > 0) {
      setActiveProjectId(p[0].id)
      return p[0].id
    }
    return null
  })

  const activeProject = useMemo(() => projects.find(p => p.id === activeId), [projects, activeId])

  const [nodes, setNodes] = useState(activeProject?.nodes || [])
  const [edges, setEdges] = useState(activeProject?.edges || [])
  const [mode, setMode] = useState('cursor')
  const rfInstanceRef = useRef(null)
  const [editNode, setEditNode] = useState(null)
  const [showPublish, setShowPublish] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState(null) // { id, position: {x, y} }
  const [selectedNodeIds, setSelectedNodeIds] = useState([])
  const [clipboard, setClipboard] = useState([])
  const clipboardRef = useRef([])
  const selectedRef = useRef([])
  // Keep refs in sync for use in event handler
  useEffect(() => { clipboardRef.current = clipboard }, [clipboard])
  useEffect(() => { selectedRef.current = selectedNodeIds }, [selectedNodeIds])

  const handleCopyNodes = useCallback(() => {
    const sel = selectedRef.current
    if (sel.length === 0) return
    setNodes(nds => {
      const copied = nds.filter(n => sel.includes(n.id)).map(n => JSON.parse(JSON.stringify(n)))
      setClipboard(copied)
      clipboardRef.current = copied
      return nds
    })
  }, [])

  const handleCutNodes = useCallback(() => {
    const sel = selectedRef.current
    if (sel.length === 0) return
    setNodes(nds => {
      const copied = nds.filter(n => sel.includes(n.id)).map(n => JSON.parse(JSON.stringify(n)))
      setClipboard(copied)
      clipboardRef.current = copied
      return nds.filter(n => !sel.includes(n.id))
    })
    setEdges(eds => eds.filter(e => !selectedRef.current.includes(e.source) && !selectedRef.current.includes(e.target)))
    setSelectedNodeIds([])
  }, [])

  const handlePasteNodes = useCallback(() => {
    const clip = clipboardRef.current
    if (clip.length === 0) return
    const newIds = []
    const idMap = {}
    const newNodes = clip.map(n => {
      const newId = nanoid(8)
      idMap[n.id] = newId
      newIds.push(newId)
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + 40, y: n.position.y + 40 },
        selected: true,
      }
    })
    setNodes(nds => [...nds.map(n => ({ ...n, selected: false })), ...newNodes])
    setSelectedNodeIds(newIds)
    // Update clipboard positions for next paste
    setClipboard(clip.map(n => ({ ...n, position: { x: n.position.x + 40, y: n.position.y + 40 } })))
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 'k') {
        e.preventDefault()
        setShowSearch(s => !s)
        return
      }
      // Clipboard shortcuts
      const tag = e.target.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable
      if (mod && !isTyping) {
        if (e.key === 'c') { e.preventDefault(); handleCopyNodes(); return }
        if (e.key === 'x') { e.preventDefault(); handleCutNodes(); return }
        if (e.key === 'v') { e.preventDefault(); handlePasteNodes(); return }
      }
      // Mode shortcuts
      if (mod || e.altKey) return
      if (isTyping) return
      if (e.key === 'h') setMode('hand')
      if (e.key === 'v') setMode('cursor')
    }
    window.addEventListener('keydown', handleKey, true)
    return () => window.removeEventListener('keydown', handleKey, true)
  }, [handleCopyNodes, handleCutNodes, handlePasteNodes])

  // Load project data when activeId changes
  useEffect(() => {
    const proj = getProject(activeId)
    if (proj) {
      setNodes((proj.nodes || []).map(n => ({
        ...n, data: { ...n.data, bgColor: '#ffffff' }
      })))
      setEdges((proj.edges || []).map(e => {
        const { strokeDasharray, ...restStyle } = e.style || {}
        return {
          ...e,
          animated: true,
          style: { ...restStyle, stroke: restStyle.stroke || '#94a3b8', strokeWidth: restStyle.strokeWidth || 1.5 },
        }
      }))
    }
  }, [activeId])

  // Auto-save to localStorage
  useEffect(() => {
    if (activeId) {
      const timeout = setTimeout(() => {
        updateProject(activeId, { nodes, edges })
        setProjects(getProjects())
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [nodes, edges, activeId])

  const makeNodeData = useCallback((id, data) => ({
    ...data,
    onEdit: () => setEditNode(id),
    onConnect: () => {},
    onDelete: () => {
      setNodes(nds => nds.filter(n => n.id !== id))
      setEdges(eds => eds.filter(e => e.source !== id && e.target !== id))
    },
    onColorChange: (bgColor) => {
      setNodes(nds => nds.map(n =>
        n.id === id ? { ...n, data: { ...n.data, bgColor } } : n
      ))
    },
    onResize: (width) => {
      setNodes(nds => nds.map(n =>
        n.id === id ? { ...n, style: { ...n.style, width }, data: { ...n.data, size: width } } : n
      ))
    },
  }), [])

  // Attach callbacks to nodes
  const nodesWithCallbacks = useMemo(
    () => nodes.map(n => ({ ...n, data: makeNodeData(n.id, n.data), type: 'custom' })),
    [nodes, makeNodeData]
  )

  const onNodesChange = useCallback(
    (changes) => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges(eds => applyEdgeChanges(changes, eds)),
    []
  )
  const onConnect = useCallback(
    (params) => setEdges(eds => addEdge(params, eds)),
    []
  )

  const handleAddNode = useCallback(() => {
    const id = nanoid(8)
    const newNode = {
      id,
      type: 'custom',
      position: { x: 250 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: { title: '', blocks: undefined },
    }
    setNodes(nds => [...nds, newNode])
  }, [])

  const handleEditSave = useCallback((nodeId, { title, blocks }) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, title, blocks } } : n
    ))
  }, [])

  const handleNodeDoubleClick = useCallback((_, node) => {
    setEditNode(node.id)
  }, [])

  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    setSelectedNodeIds((selectedNodes || []).map(n => n.id))
  }, [])

  const handleAlign = useCallback((type) => {
    if (selectedNodeIds.length < 2) return
    setNodes(nds => {
      const selected = nds.filter(n => selectedNodeIds.includes(n.id))
      if (selected.length < 2) return nds

      let targetValue
      switch (type) {
        case 'left':
          targetValue = Math.min(...selected.map(n => n.position.x))
          return nds.map(n => selectedNodeIds.includes(n.id) ? { ...n, position: { ...n.position, x: targetValue } } : n)
        case 'right':
          targetValue = Math.max(...selected.map(n => n.position.x + (n.data?.size || 240)))
          return nds.map(n => selectedNodeIds.includes(n.id) ? { ...n, position: { ...n.position, x: targetValue - (n.data?.size || 240) } } : n)
        case 'center-h':
          targetValue = selected.reduce((sum, n) => sum + n.position.x, 0) / selected.length
          return nds.map(n => selectedNodeIds.includes(n.id) ? { ...n, position: { ...n.position, x: targetValue } } : n)
        case 'top':
          targetValue = Math.min(...selected.map(n => n.position.y))
          return nds.map(n => selectedNodeIds.includes(n.id) ? { ...n, position: { ...n.position, y: targetValue } } : n)
        case 'bottom':
          targetValue = Math.max(...selected.map(n => n.position.y))
          return nds.map(n => selectedNodeIds.includes(n.id) ? { ...n, position: { ...n.position, y: targetValue } } : n)
        case 'center-v':
          targetValue = selected.reduce((sum, n) => sum + n.position.y, 0) / selected.length
          return nds.map(n => selectedNodeIds.includes(n.id) ? { ...n, position: { ...n.position, y: targetValue } } : n)
        case 'distribute-h': {
          if (selected.length < 3) return nds
          const sortedX = [...selected].sort((a, b) => a.position.x - b.position.x)
          const minX = sortedX[0].position.x
          const maxX = sortedX[sortedX.length - 1].position.x
          const step = (maxX - minX) / (sortedX.length - 1)
          const posMap = {}
          sortedX.forEach((n, i) => { posMap[n.id] = minX + step * i })
          return nds.map(n => posMap[n.id] != null ? { ...n, position: { ...n.position, x: posMap[n.id] } } : n)
        }
        case 'distribute-v': {
          if (selected.length < 3) return nds
          const sortedY = [...selected].sort((a, b) => a.position.y - b.position.y)
          const minY = sortedY[0].position.y
          const maxY = sortedY[sortedY.length - 1].position.y
          const stepY = (maxY - minY) / (sortedY.length - 1)
          const posMapY = {}
          sortedY.forEach((n, i) => { posMapY[n.id] = minY + stepY * i })
          return nds.map(n => posMapY[n.id] != null ? { ...n, position: { ...n.position, y: posMapY[n.id] } } : n)
        }
        default:
          return nds
      }
    })
  }, [selectedNodeIds])

  const handleAutoLayout = useCallback(() => {
    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({ rankdir: 'TB', nodesep: 300, ranksep: 200 })
    nodes.forEach(n => g.setNode(n.id, { width: n.data?.size || 240, height: 150 }))
    edges.forEach(e => g.setEdge(e.source, e.target))
    dagre.layout(g)
    setNodes(nds => nds.map(n => {
      const pos = g.node(n.id)
      if (!pos) return n
      return { ...n, position: { x: pos.x - (n.data?.size || 240) / 2, y: pos.y - 75 } }
    }))
  }, [nodes, edges])

  const handleEdgeClick = useCallback((event, edge) => {
    setSelectedEdge({ id: edge.id, position: { x: event.clientX, y: event.clientY } })
  }, [])

  const handleEdgeStyleChange = useCallback((edgeId, newStyle) => {
    setEdges(eds => eds.map(e =>
      e.id === edgeId ? { ...e, style: newStyle } : e
    ))
  }, [])

  const handleEdgeDelete = useCallback((edgeId) => {
    setEdges(eds => eds.filter(e => e.id !== edgeId))
    setSelectedEdge(null)
  }, [])

  const handleCreateProject = () => {
    createProject('새 프로젝트')
    setProjects(getProjects())
    setActiveId(getActiveProjectId())
  }

  const handleSelectProject = (id) => {
    setActiveProjectId(id)
    setActiveId(id)
  }

  const handleRenameProject = (id, name) => {
    updateProject(id, { name })
    setProjects(getProjects())
  }

  const handleDeleteProject = (id) => {
    if (projects.length <= 1) return
    deleteProject(id)
    setProjects(getProjects())
    setActiveId(getActiveProjectId())
  }

  const editingNode = editNode ? nodes.find(n => n.id === editNode) : null

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={settingsBtn} onClick={() => setShowSearch(s => !s)} title="검색 (Ctrl+K)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button style={settingsBtn} onClick={() => setShowSettings(true)} title="설정">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
        <ProjectSelector
          projects={projects}
          activeId={activeId}
          onCreate={handleCreateProject}
          onSelect={handleSelectProject}
          onRename={handleRenameProject}
          onDelete={handleDeleteProject}
        />
        </div>
        <button style={publishBtn} onClick={() => setShowPublish(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Publish
        </button>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => { rfInstanceRef.current = instance }}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={() => { setSelectedEdge(null); setSelectedNodeIds([]) }}
        onSelectionChange={onSelectionChange}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        panOnDrag={mode === 'hand'}
        selectionOnDrag={mode === 'cursor'}
        panOnScroll={mode === 'hand'}
        connectionMode={ConnectionMode.Loose}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        style={{ background: '#f1f5f9' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#cbd5e1" />
        <ZoomControls onAutoLayout={handleAutoLayout} />
      </ReactFlow>

      {/* Bottom Toolbar */}
      <Toolbar mode={mode} onModeChange={setMode} onAddNode={handleAddNode} selectedCount={selectedNodeIds.length} hasClipboard={clipboard.length > 0} onAlign={handleAlign} onCopy={handleCopyNodes} onCut={handleCutNodes} onPaste={handlePasteNodes} onDeleteSelected={() => {
        if (selectedNodeIds.length === 0) return
        if (!window.confirm(`선택한 ${selectedNodeIds.length}개 노드를 삭제할까요?`)) return
        setNodes(nds => nds.filter(n => !selectedNodeIds.includes(n.id)))
        setEdges(eds => eds.filter(e => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)))
        setSelectedNodeIds([])
      }} />

      {/* Edit Modal */}
      {editingNode && (
        <EditModal
          node={editingNode}
          onSave={handleEditSave}
          onClose={() => setEditNode(null)}
        />
      )}

      {/* Publish Modal */}
      {showPublish && (
        <PublishModal
          nodes={nodes}
          edges={edges}
          onClose={() => setShowPublish(false)}
        />
      )}

      {/* Edge Toolbar */}
      {selectedEdge && edges.find(e => e.id === selectedEdge.id) && (
        <EdgeToolbar
          edge={edges.find(e => e.id === selectedEdge.id)}
          position={selectedEdge.position}
          onChange={handleEdgeStyleChange}
          onDelete={handleEdgeDelete}
          onClose={() => setSelectedEdge(null)}
        />
      )}

      {/* Search Panel */}
      {showSearch && (
        <SearchPanel
          nodes={nodes}
          onFocusNode={(nodeId) => {
            const node = nodes.find(n => n.id === nodeId)
            if (node && rfInstanceRef.current) {
              const w = node.style?.width || node.data?.size || 240
              rfInstanceRef.current.setCenter(
                node.position.x + w / 2,
                node.position.y + 75,
                { zoom: 1, duration: 600 }
              )
            }
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          project={activeProject}
          onRename={(id, name) => { handleRenameProject(id, name) }}
          onDelete={(id) => { handleDeleteProject(id) }}
          onResetEdges={() => {
            setEdges(eds => eds.map(e => ({
              ...e,
              animated: true,
              style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            })))
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      <style>{`
        .node-action-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          border: 1px solid #e5e7eb; background: #fff;
          color: #6b7280; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          transition: all 0.15s;
        }
        .node-link:hover { text-decoration: underline !important; }
        .node-action-btn:hover { background: #f3f4f6; color: #1a1a1a; }
        .node-action-btn-delete:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }
        .react-flow__handle { opacity: 0; transition: opacity 0.2s; cursor: crosshair; }
        .react-flow__node:hover .react-flow__handle,
        .react-flow__node.selected .react-flow__handle { opacity: 1; }
        .react-flow__handle:hover { transform: scale(1.3); }
        .react-flow__edge:hover { cursor: pointer; }
        .react-flow__edge path[stroke-dasharray] {
          animation: dashFlow 0.5s linear infinite;
        }
        @keyframes dashFlow {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  )
}

const nodeTypes = { custom: CustomNode }

const headerStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, height: 52,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 16px', background: '#fff', borderBottom: '1px solid #e5e7eb', zIndex: 100,
}

const settingsBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: 8,
  background: '#fff', color: '#6b7280', cursor: 'pointer',
  transition: 'all 0.15s',
}

const publishBtn = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8,
  fontSize: 14, fontWeight: 500, cursor: 'pointer',
}
