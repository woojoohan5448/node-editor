import { useState, useRef, useEffect } from 'react'

export default function ProjectSelector({ projects, activeId, onCreate, onSelect, onRename, onDelete }) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const active = projects.find(p => p.id === activeId)

  const startRename = (p) => {
    setEditingId(p.id)
    setEditName(p.name)
  }

  const confirmRename = () => {
    if (editName.trim()) onRename(editingId, editName.trim())
    setEditingId(null)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={triggerBtn}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{active?.name || '프로젝트 선택'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={dropdown}>
          {projects.map(p => (
            <div key={p.id} style={{ ...dropdownItem, background: p.id === activeId ? '#f0f7ff' : 'transparent' }}>
              {editingId === p.id ? (
                <input
                  autoFocus
                  style={renameInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={confirmRename}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmRename() }}
                />
              ) : (
                <>
                  <span
                    style={{ flex: 1, cursor: 'pointer', fontSize: 14 }}
                    onClick={() => { onSelect(p.id); setOpen(false) }}
                  >
                    {p.name}
                  </span>
                  <button style={iconBtn} onClick={() => startRename(p)} title="이름 변경">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button style={iconBtn} onClick={() => onDelete(p.id)} title="삭제">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </>
              )}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #e5e7eb', padding: '4px 0' }}>
            <button
              style={{ ...dropdownItem, color: '#3b82f6', fontWeight: 500, fontSize: 14, border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => { onCreate(); setOpen(false) }}
            >
              + 새 프로젝트
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const triggerBtn = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
  fontSize: 14, color: '#1a1a1a', cursor: 'pointer',
}
const dropdown = {
  position: 'absolute', top: '100%', left: 0, marginTop: 4,
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 220, zIndex: 100, overflow: 'hidden',
}
const dropdownItem = {
  display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 6,
}
const iconBtn = {
  background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', borderRadius: 4,
}
const renameInput = {
  flex: 1, padding: '4px 8px', border: '1px solid #3b82f6', borderRadius: 4, fontSize: 14, outline: 'none',
}
