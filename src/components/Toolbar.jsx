export default function Toolbar({ mode, onModeChange, onAddNode }) {
  return (
    <div style={container}>
      <button
        style={{ ...btn, ...(mode === 'hand' ? activeBtn : {}) }}
        onClick={() => onModeChange('hand')}
        title="핸드 모드"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 00-4 0v1M14 10V4a2 2 0 00-4 0v6M10 10.5V6a2 2 0 00-4 0v8" />
          <path d="M18 8a2 2 0 014 0v7a8 8 0 01-8 8h-2c-2.5 0-4.5-1-6.2-2.8L3.4 17a2 2 0 012.8-2.8L8 16" />
        </svg>
      </button>
      <button
        style={{ ...btn, ...(mode === 'cursor' ? activeBtn : {}) }}
        onClick={() => onModeChange('cursor')}
        title="커서 모드"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="M13 13l6 6" />
        </svg>
      </button>
      <div style={{ width: 1, height: 24, background: '#e5e7eb' }} />
      <button style={addBtn} onClick={onAddNode} title="노드 추가">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500 }}>노드 추가</span>
      </button>
    </div>
  )
}

const container = {
  position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px',
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 50,
}
const btn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, border: 'none', borderRadius: 8,
  background: 'transparent', color: '#6b7280', cursor: 'pointer',
  transition: 'all 0.15s',
}
const activeBtn = {
  background: '#eff6ff', color: '#3b82f6',
}
const addBtn = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
  border: 'none', borderRadius: 8, background: '#3b82f6', color: '#fff',
  cursor: 'pointer', transition: 'background 0.15s',
}
