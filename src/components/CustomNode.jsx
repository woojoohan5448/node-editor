import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { blocksToPlainText } from '../utils/blockUtils'

const handleStyle = {
  width: 8,
  height: 8,
  background: '#94a3b8',
  border: '2px solid #fff',
}

const SIZE_OPTIONS = [
  { label: 'S', width: 160 },
  { label: 'M', width: 240 },
  { label: 'L', width: 320 },
  { label: 'XL', width: 420 },
]

function CustomNode({ data, selected }) {
  const currentWidth = data.size || 240

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '16px 20px',
        width: currentWidth,
        boxShadow: selected
          ? '0 0 0 2px #3b82f6, 0 4px 12px rgba(0,0,0,0.1)'
          : '0 1px 8px rgba(0,0,0,0.08)',
        border: selected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
        position: 'relative',
        transition: 'box-shadow 0.15s, border-color 0.15s, width 0.2s ease',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ ...handleStyle, top: -4 }} />
      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, bottom: -4 }} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ ...handleStyle, left: -4 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ ...handleStyle, right: -4 }} />

      {/* Size Toolbar - shown above node when selected */}
      {selected && (
        <div style={sizeToolbar}>
          {SIZE_OPTIONS.map(({ label, width }) => (
            <button
              key={label}
              className="node-size-btn"
              style={{
                ...sizeBtn,
                ...(currentWidth === width ? sizeBtnActive : {}),
              }}
              onClick={(e) => { e.stopPropagation(); data.onResize?.(width) }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Action Buttons - top right */}
      {selected && (
        <div style={actionBtns}>
          <button
            className="node-action-btn"
            onClick={(e) => { e.stopPropagation(); data.onEdit?.() }}
            title="편집"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="node-action-btn"
            onClick={(e) => { e.stopPropagation(); data.onConnect?.() }}
            title="연결"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </button>
          <button
            className="node-action-btn node-action-btn-delete"
            onClick={(e) => { e.stopPropagation(); data.onDelete?.() }}
            title="삭제"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      )}

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#1a1a1a' }}>
        {data.title || '제목을 입력해주세요'}
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {data.blocks
          ? (blocksToPlainText(data.blocks) || '내용 없음')
          : (data.content || '내용 없음')}
      </div>
    </div>
  )
}

const sizeToolbar = {
  position: 'absolute',
  top: -40,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 2,
  padding: 3,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  zIndex: 10,
}

const sizeBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 26,
  border: 'none',
  borderRadius: 5,
  background: 'transparent',
  color: '#6b7280',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s',
}

const sizeBtnActive = {
  background: '#3b82f6',
  color: '#fff',
}

const actionBtns = {
  position: 'absolute',
  top: -12,
  right: -8,
  display: 'flex',
  gap: 4,
  zIndex: 10,
}

export default memo(CustomNode)
