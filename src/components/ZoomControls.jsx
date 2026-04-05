import { useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'

export default function ZoomControls({ onAutoLayout }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        fitView({ padding: 0.2 })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fitView])

  return (
    <div style={container}>
      <button style={btn} onClick={() => zoomIn()} title="확대">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <button style={btn} onClick={() => zoomOut()} title="축소">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <button style={btn} onClick={() => fitView({ padding: 0.2 })} title="전체 보기 (Ctrl+Shift+F)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
        </svg>
      </button>
      {onAutoLayout && (
        <button style={btn} onClick={onAutoLayout} title="자동 정렬">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
      )}
    </div>
  )
}

const container = {
  position: 'fixed', bottom: 20, left: 20,
  display: 'flex', flexDirection: 'column', gap: 2, padding: 4,
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: 50,
}
const btn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, border: 'none', borderRadius: 6,
  background: 'transparent', color: '#6b7280', cursor: 'pointer',
}
