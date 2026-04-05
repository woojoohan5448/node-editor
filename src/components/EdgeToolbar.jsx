import { useEffect, useRef } from 'react'

const LINE_STYLES = [
  { label: '실선', value: 'solid', dash: null },
  { label: '점선', value: 'dotted', dash: '5,5' },
  { label: '대시', value: 'dashed', dash: '10,5' },
]

const WIDTHS = [
  { label: '얇게', value: 1.5 },
  { label: '보통', value: 2.5 },
  { label: '굵게', value: 4 },
]

const COLORS = [
  { value: '#3b82f6', label: '파랑' },
  { value: '#94a3b8', label: '회색' },
  { value: '#1a1a1a', label: '검정' },
  { value: '#ef4444', label: '빨강' },
  { value: '#22c55e', label: '초록' },
]

export default function EdgeToolbar({ edge, position, onChange, onDelete, onClose }) {
  const ref = useRef(null)

  const style = edge.style || {}
  const currentDash = style.strokeDasharray || null
  const currentWidth = style.strokeWidth || 2.5
  const currentColor = style.stroke || '#3b82f6'

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const updateStyle = (updates) => {
    const newStyle = { ...style, ...updates }
    // Remove strokeDasharray entirely for solid lines
    if (newStyle.strokeDasharray === null || newStyle.strokeDasharray === undefined) {
      delete newStyle.strokeDasharray
    }
    onChange(edge.id, newStyle)
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%) translateY(-12px)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        zIndex: 200,
      }}
    >
      {/* Line Style */}
      <div style={groupStyle}>
        {LINE_STYLES.map(ls => (
          <button
            key={ls.value}
            title={ls.label}
            style={{
              ...btnStyle,
              ...(currentDash === ls.dash ? btnActive : {}),
            }}
            onClick={() => updateStyle({ strokeDasharray: ls.dash })}
          >
            <svg width="20" height="12" viewBox="0 0 20 12">
              <line
                x1="0" y1="6" x2="20" y2="6"
                stroke="currentColor" strokeWidth="2"
                {...(ls.dash ? { strokeDasharray: ls.dash } : {})}
              />
            </svg>
          </button>
        ))}
      </div>

      <div style={divider} />

      {/* Width */}
      <div style={groupStyle}>
        {WIDTHS.map(w => (
          <button
            key={w.value}
            title={w.label}
            style={{
              ...btnStyle,
              ...(currentWidth === w.value ? btnActive : {}),
            }}
            onClick={() => updateStyle({ strokeWidth: w.value })}
          >
            <svg width="20" height="12" viewBox="0 0 20 12">
              <line
                x1="0" y1="6" x2="20" y2="6"
                stroke="currentColor" strokeWidth={w.value}
              />
            </svg>
          </button>
        ))}
      </div>

      <div style={divider} />

      {/* Colors */}
      <div style={groupStyle}>
        {COLORS.map(c => (
          <button
            key={c.value}
            title={c.label}
            style={{
              ...colorBtn,
              background: c.value,
              ...(currentColor === c.value ? colorBtnActive : {}),
            }}
            onClick={() => updateStyle({ stroke: c.value })}
          />
        ))}
      </div>

      <div style={divider} />

      {/* Delete */}
      <button
        title="삭제"
        style={{ ...btnStyle, color: '#ef4444' }}
        onClick={() => onDelete(edge.id)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
      </button>
    </div>
  )
}

const groupStyle = { display: 'flex', gap: 2 }

const btnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 28, border: 'none', borderRadius: 6,
  background: 'transparent', color: '#6b7280', cursor: 'pointer',
  transition: 'all 0.12s',
}

const btnActive = {
  background: '#eff6ff', color: '#3b82f6',
}

const colorBtn = {
  width: 18, height: 18, borderRadius: '50%',
  border: '2px solid transparent', cursor: 'pointer',
  transition: 'all 0.12s',
}

const colorBtnActive = {
  border: '2px solid #1a1a1a',
  boxShadow: '0 0 0 2px #fff, 0 0 0 4px #3b82f6',
}

const divider = {
  width: 1, height: 20, background: '#e5e7eb',
}
