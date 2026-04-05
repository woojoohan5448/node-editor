import { useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { decodeProjectData } from '../utils/storage'
import CustomNode from './CustomNode'

const nodeTypes = { custom: CustomNode }

export default function ViewPage() {
  const [hash, setHash] = useState(window.location.hash.slice(1))
  useEffect(() => {
    const onHash = () => setHash(window.location.hash.slice(1))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const decoded = useMemo(() => hash ? decodeProjectData(hash) : null, [hash])

  if (!decoded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Pretendard' }}>
        <p style={{ color: '#6b7280', fontSize: 16 }}>잘못된 링크입니다.</p>
      </div>
    )
  }

  const viewNodes = decoded.nodes.map(n => ({
    ...n,
    data: { ...n.data, onEdit: undefined, onConnect: undefined, onDelete: undefined },
    draggable: false,
    connectable: false,
    selectable: false,
  }))

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={header}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>LinkWisdom</span>
        <span style={badge}>읽기 전용</span>
      </div>
      <ReactFlow
        nodes={viewNodes}
        edges={decoded.edges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
        <Controls position="bottom-left" />
      </ReactFlow>
    </div>
  )
}

const header = {
  position: 'fixed', top: 0, left: 0, right: 0, height: 52,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 20px', background: '#fff', borderBottom: '1px solid #e5e7eb', zIndex: 100,
}
const badge = {
  padding: '4px 10px', background: '#fef3c7', color: '#92400e',
  borderRadius: 6, fontSize: 12, fontWeight: 500,
}
