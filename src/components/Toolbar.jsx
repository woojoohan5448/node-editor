const ALIGN_BUTTONS = [
  { type: 'left', title: '왼쪽 정렬', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="4" x2="4" y2="20" /><rect x="8" y="6" width="12" height="4" rx="1" /><rect x="8" y="14" width="8" height="4" rx="1" /></svg> },
  { type: 'right', title: '오른쪽 정렬', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="20" y1="4" x2="20" y2="20" /><rect x="4" y="6" width="12" height="4" rx="1" /><rect x="8" y="14" width="8" height="4" rx="1" /></svg> },
  { type: 'center-h', title: '가로 중앙 정렬', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22" strokeDasharray="2 2" /><rect x="4" y="6" width="16" height="4" rx="1" /><rect x="6" y="14" width="12" height="4" rx="1" /></svg> },
  { type: 'top', title: '위쪽 정렬', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="4" x2="20" y2="4" /><rect x="6" y="8" width="4" height="12" rx="1" /><rect x="14" y="8" width="4" height="8" rx="1" /></svg> },
  { type: 'bottom', title: '아래쪽 정렬', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="20" x2="20" y2="20" /><rect x="6" y="4" width="4" height="12" rx="1" /><rect x="14" y="8" width="4" height="8" rx="1" /></svg> },
  { type: 'center-v', title: '세로 중앙 정렬', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="12" x2="22" y2="12" strokeDasharray="2 2" /><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="6" width="4" height="12" rx="1" /></svg> },
  { type: 'distribute-h', title: '가로 간격 균등 (3개 이상)', min: 3, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="4" height="12" rx="1" /><rect x="10" y="6" width="4" height="12" rx="1" /><rect x="18" y="6" width="4" height="12" rx="1" /><line x1="6" y1="12" x2="10" y2="12" strokeDasharray="2 2" /><line x1="14" y1="12" x2="18" y2="12" strokeDasharray="2 2" /></svg> },
  { type: 'distribute-v', title: '세로 간격 균등 (3개 이상)', min: 3, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="2" width="12" height="4" rx="1" /><rect x="6" y="10" width="12" height="4" rx="1" /><rect x="6" y="18" width="12" height="4" rx="1" /><line x1="12" y1="6" x2="12" y2="10" strokeDasharray="2 2" /><line x1="12" y1="14" x2="12" y2="18" strokeDasharray="2 2" /></svg> },
]

export default function Toolbar({ mode, onModeChange, onAddNode, selectedCount = 0, onAlign, onDeleteSelected }) {
  return (
    <div style={container}>
      <button
        style={{ ...btn, ...(mode === 'hand' ? activeBtn : {}) }}
        onClick={() => onModeChange('hand')}
        title="핸드 모드 (H)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 00-4 0v1M14 10V4a2 2 0 00-4 0v6M10 10.5V6a2 2 0 00-4 0v8" />
          <path d="M18 8a2 2 0 014 0v7a8 8 0 01-8 8h-2c-2.5 0-4.5-1-6.2-2.8L3.4 17a2 2 0 012.8-2.8L8 16" />
        </svg>
      </button>
      <button
        style={{ ...btn, ...(mode === 'cursor' ? activeBtn : {}) }}
        onClick={() => onModeChange('cursor')}
        title="커서 모드 (V)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
          <path d="M13 13l6 6" />
        </svg>
      </button>
      <div style={divider} />
      <button style={addBtn} onClick={onAddNode} title="노드 추가">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500 }}>노드 추가</span>
      </button>
      {selectedCount >= 2 && (
        <>
          <div style={divider} />
          {ALIGN_BUTTONS.map(ab => (
            <button
              key={ab.type}
              style={{ ...alignBtn, ...(ab.min && selectedCount < ab.min ? { opacity: 0.3, cursor: 'default' } : {}) }}
              onClick={() => { if (!ab.min || selectedCount >= ab.min) onAlign?.(ab.type) }}
              title={ab.title}
            >
              {ab.icon}
            </button>
          ))}
          <div style={divider} />
          <button
            style={{ ...alignBtn, color: '#ef4444' }}
            onClick={onDeleteSelected}
            title={`선택한 ${selectedCount}개 노드 삭제`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </>
      )}
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
const divider = { width: 1, height: 24, background: '#e5e7eb' }
const alignBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, border: 'none', borderRadius: 6,
  background: 'transparent', color: '#6b7280', cursor: 'pointer',
  transition: 'all 0.12s',
}
