import { memo, useState, useCallback } from 'react'
import { Handle, Position, NodeResizer, NodeToolbar } from '@xyflow/react'

const URL_REGEX = /(https?:\/\/[^\s<>'"]+)/g

function linkifyText(text, key) {
  const parts = []
  let last = 0
  let match
  URL_REGEX.lastIndex = 0
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push(
      <a key={`${key}-${match.index}`} href={match[0]} target="_blank" rel="noopener noreferrer"
        style={{ color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}
        className="node-link"
        onClick={(e) => e.stopPropagation()}
      >{match[0]}</a>
    )
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length > 0 ? parts : text
}

function renderInlineContent(content) {
  if (!Array.isArray(content)) return null
  return content.map((item, i) => {
    if (item?.type === 'link') {
      const text = item.content?.map(c => c?.text || '').join('') || item.href || ''
      return (
        <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
          style={{ color: '#2563eb', textDecoration: 'none', wordBreak: 'break-all' }}
          className="node-link"
          onClick={(e) => e.stopPropagation()}
        >{text}</a>
      )
    }
    if (item?.type !== 'text' || !item.text) return null
    const s = item.styles || {}
    return (
      <span key={i} style={{
        fontWeight: s.bold ? 600 : undefined,
        fontStyle: s.italic ? 'italic' : undefined,
        textDecoration: s.underline ? 'underline' : undefined,
        fontFamily: s.code ? 'monospace' : undefined,
        background: s.code ? '#f3f4f6' : undefined,
        padding: s.code ? '1px 4px' : undefined,
        borderRadius: s.code ? 3 : undefined,
      }}>{linkifyText(item.text, i)}</span>
    )
  })
}

function CodeBlockPreview({ block, idx }) {
  const [copied, setCopied] = useState(false)
  const code = Array.isArray(block.content)
    ? block.content.map(c => c?.text || '').join('')
    : ''

  const handleCopy = useCallback((e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div key={idx} style={{ position: 'relative', background: '#f3f4f6', borderRadius: 6, padding: 12, marginTop: 4, marginBottom: 4, border: '1px solid #e5e7eb' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute', top: 6, right: 6,
          padding: '2px 6px', fontSize: 10, border: '1px solid #d1d5db',
          borderRadius: 4, background: copied ? '#dcfce7' : '#fff',
          color: copied ? '#16a34a' : '#6b7280', cursor: 'pointer',
        }}
      >{copied ? '✓ 복사됨' : '복사'}</button>
      <pre style={{ fontSize: 11, color: '#1f2937', lineHeight: 1.4, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', paddingRight: 40 }}>
        {code}
      </pre>
    </div>
  )
}

function TogglePreview({ block }) {
  const [open, setOpen] = useState(false)

  const fullText = Array.isArray(block.content)
    ? block.content.map(c => c?.text || '').join('')
    : ''
  const lines = fullText.split('\n').filter(Boolean)
  const titleText = lines[0] || '토글'
  const bodyLines = lines.slice(1)
  const children = block.children || []
  const hasBody = bodyLines.length > 0 || children.length > 0

  return (
    <div style={{ marginTop: 2, marginBottom: 2 }}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); if (hasBody) setOpen(o => !o) }}
        style={{
          fontSize: 12, color: '#374151', lineHeight: 1.5,
          cursor: hasBody ? 'pointer' : 'default',
          display: 'flex', alignItems: 'flex-start', gap: 4, userSelect: 'none',
        }}
      >
        <span style={{
          fontSize: 10, color: '#9ca3af', marginTop: 2, flexShrink: 0,
          transition: 'transform 0.15s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>▶</span>
        <span style={{ fontWeight: 500 }}>{titleText}</span>
      </div>
      {open && (
        <div style={{ paddingLeft: 16, borderLeft: '2px solid #e5e7eb', marginLeft: 5, marginTop: 2 }}>
          {bodyLines.map((line, li) => (
            <div key={`l${li}`} style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{line}</div>
          ))}
          {children.map((child, ci) => (
            <RenderBlock key={`c${ci}`} block={child} index={ci} numIndex={ci + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function hasContent(block) {
  if (!block) return false
  if (block.type === 'table') {
    const rows = block.content?.rows || []
    return rows.some(r => {
      const cells = Array.isArray(r?.cells) ? r.cells : []
      return cells.some(c => {
        if (c?.type === 'tableCell') return c.content?.some(item => item?.text?.trim())
        if (Array.isArray(c)) return c.some(item => item?.text?.trim())
        return false
      })
    })
  }
  if (block.type === 'divider') return true
  if (block.type === 'codeBlock') return true
  if (block.type === 'toggleListItem') return true
  if (block.type === 'image') return !!block.props?.url
  if (!Array.isArray(block.content)) return false
  return block.content.some(c =>
    c?.text?.trim() || c?.type === 'link'
  )
}

function RenderChildren({ children }) {
  if (!Array.isArray(children) || children.length === 0) return null
  let childNum = 0
  return (
    <div style={{ paddingLeft: 16 }}>
      {children.map((child, ci) => {
        if (child.type === 'numberedListItem') childNum++
        else if (child.type !== 'numberedListItem') childNum = 0
        return <RenderBlock key={ci} block={child} index={ci} numIndex={childNum || ci + 1} />
      })}
    </div>
  )
}

function RenderBlock({ block, index, numIndex }) {
  const type = block.type
  const kids = block.children?.length > 0 ? <RenderChildren children={block.children} /> : null

  if (type === 'heading') {
    const level = block.props?.level || 1
    const fontSize = level === 1 ? 14 : level === 2 ? 13 : 12
    return <><div style={{ fontSize, fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{renderInlineContent(block.content)}</div>{kids}</>
  }
  if (type === 'bulletListItem') {
    return <><div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, paddingLeft: 8 }}>• {renderInlineContent(block.content)}</div>{kids}</>
  }
  if (type === 'numberedListItem') {
    return <><div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, paddingLeft: 8 }}>{numIndex}. {renderInlineContent(block.content)}</div>{kids}</>
  }
  if (type === 'codeBlock') {
    return <CodeBlockPreview block={block} idx={index} />
  }
  if (type === 'toggleListItem') {
    return <TogglePreview block={block} />
  }
  if (type === 'image' && block.props?.url) {
    return (
      <div style={{ width: '100%', overflow: 'hidden', margin: '4px 0', borderRadius: 6 }}>
        <img
          src={block.props.url}
          alt={block.props.caption || ''}
          style={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'contain', borderRadius: 6, display: 'block' }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>
    )
  }
  if (type === 'quote') {
    return <><div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5, borderLeft: '3px solid #d1d5db', paddingLeft: 8, fontStyle: 'italic' }}>{renderInlineContent(block.content)}</div>{kids}</>
  }
  if (type === 'table') {
    const rows = block.content?.rows || []
    const dataRows = rows.filter(r => {
      const cells = Array.isArray(r?.cells) ? r.cells : []
      return cells.some(c => {
        if (c?.type === 'tableCell') return c.content?.some(item => item?.text?.trim())
        if (Array.isArray(c)) return c.some(item => item?.text?.trim())
        return false
      })
    })
    if (dataRows.length === 0) return null
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginTop: 4, marginBottom: 4 }}>
        <tbody>
          {dataRows.map((row, ri) => {
            const cells = Array.isArray(row.cells) ? row.cells : []
            const isHeader = ri === 0
            return (
              <tr key={ri}>
                {cells.map((cell, ci) => {
                  let text = ''
                  if (cell?.type === 'tableCell') {
                    text = (cell.content || []).map(item => item?.text || '').join('')
                  } else if (Array.isArray(cell)) {
                    text = cell.map(item => item?.text || '').join('')
                  }
                  return (
                    <td key={ci} style={{
                      padding: '4px 8px', border: '1px solid #e5e7eb',
                      background: isHeader ? '#f9fafb' : 'transparent',
                      fontWeight: isHeader ? 600 : 400,
                      color: isHeader ? '#111827' : '#374151', lineHeight: 1.4,
                    }}>{text}</td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
  if (type === 'divider') {
    return <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
  }
  return <><div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{renderInlineContent(block.content)}</div>{kids}</>
}

function BlocksPreview({ blocks }) {
  if (!Array.isArray(blocks)) return null
  try {
    // Render all blocks, compute numbering inline
    let numCounter = 0
    let lastWasNumbered = false
    const elements = []

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      if (!block) continue

      // Track numbered list counter - reset when non-numbered block appears
      if (block.type === 'numberedListItem') {
        if (!lastWasNumbered) numCounter = 0
        numCounter++
        lastWasNumbered = true
      } else {
        lastWasNumbered = false
      }

      // Skip truly empty paragraphs (no content at all)
      if (block.type === 'paragraph' && (!Array.isArray(block.content) || block.content.length === 0)) {
        continue
      }

      if (hasContent(block)) {
        elements.push(<RenderBlock key={i} block={block} index={i} numIndex={numCounter} />)
      }
    }

    return elements.length > 0 ? <div>{elements}</div> : null
  } catch { return null }
}

const handleStyle = {
  width: 12,
  height: 12,
  background: '#3b82f6',
  border: '2px solid #fff',
  cursor: 'crosshair',
}

const BG_COLORS = [
  { color: '#ffffff', label: '흰색' },
  { color: '#fefce8', label: '연한 노랑' },
  { color: '#fff7ed', label: '연한 주황' },
  { color: '#fef2f2', label: '연한 빨강' },
  { color: '#fdf2f8', label: '연한 분홍' },
  { color: '#f5f3ff', label: '연한 보라' },
  { color: '#eff6ff', label: '연한 파랑' },
  { color: '#f0f9ff', label: '연한 하늘' },
  { color: '#f0fdfa', label: '연한 청록' },
  { color: '#f0fdf4', label: '연한 초록' },
  { color: '#f8fafc', label: '연한 회색' },
  { color: '#f1f5f9', label: '연한 슬레이트' },
]

function ColorPalette({ current, onChange }) {
  return (
    <div style={{
      position: 'absolute', top: -48, right: -8,
      display: 'flex', gap: 3, padding: 4,
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20,
    }}>
      {BG_COLORS.map(({ color, label }) => (
        <button
          key={color}
          title={label}
          onClick={(e) => { e.stopPropagation(); onChange(color) }}
          style={{
            width: 18, height: 18, borderRadius: '50%', border: '1.5px solid #d1d5db',
            background: color, cursor: 'pointer', position: 'relative', padding: 0,
          }}
        >
          {current === color && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" style={{ position: 'absolute', top: 2.5, left: 2.5 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}

function CustomNode({ data, selected }) {
  const [showColors, setShowColors] = useState(false)

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 12,
        padding: '16px 20px',
        height: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        boxShadow: selected
          ? '0 0 0 2px #3b82f6, 0 4px 12px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        border: selected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
        position: 'relative',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={150}
        minHeight={50}
        handleStyle={{ background: '#3b82f6', width: 8, height: 8, borderRadius: 2 }}
        lineStyle={{ border: 'none' }}
      />
      <NodeToolbar isVisible={selected} position="top" offset={8}>
        <div style={{ display: 'flex', gap: 2, padding: 3, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {[['S', 200], ['M', 300], ['L', 450], ['XL', 600]].map(([label, w]) => (
            <button
              key={label}
              className="node-size-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 26, border: 'none', borderRadius: 5,
                background: (data.size || 300) === w ? '#3b82f6' : 'transparent',
                color: (data.size || 300) === w ? '#fff' : '#6b7280',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
              onClick={(e) => { e.stopPropagation(); data.onResize?.(w) }}
            >{label}</button>
          ))}
        </div>
      </NodeToolbar>
      <Handle type="target" position={Position.Top} id="top-target" style={{ ...handleStyle, top: -6 }} />
      <Handle type="source" position={Position.Top} id="top-source" style={{ ...handleStyle, top: -6 }} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={{ ...handleStyle, bottom: -6 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-source" style={{ ...handleStyle, bottom: -6 }} />
      <Handle type="target" position={Position.Left} id="left-target" style={{ ...handleStyle, left: -6 }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ ...handleStyle, left: -6 }} />
      <Handle type="target" position={Position.Right} id="right-target" style={{ ...handleStyle, right: -6 }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ ...handleStyle, right: -6 }} />



      {selected && (
        <div style={actionBtns}>
          <button className="node-action-btn" onClick={(e) => { e.stopPropagation(); data.onEdit?.() }} title="편집">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="node-action-btn" onClick={(e) => { e.stopPropagation(); data.onConnect?.() }} title="연결">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </button>
          <button className="node-action-btn" onClick={(e) => { e.stopPropagation(); setShowColors(s => !s) }} title="배경색">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
          </button>
          <button className="node-action-btn node-action-btn-delete" onClick={(e) => { e.stopPropagation(); data.onDelete?.() }} title="삭제">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      )}

      {/* Color Palette */}
      {selected && showColors && (
        <ColorPalette current={data.bgColor || '#ffffff'} onChange={(c) => { data.onColorChange?.(c); setShowColors(false) }} />
      )}

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#000000' }}>
        {data.title || '제목을 입력해주세요'}
      </div>
      {data.blocks ? (
        <BlocksPreview blocks={data.blocks} />
      ) : data.content ? (
        <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {data.content}
        </div>
      ) : null}
    </div>
  )
}

const actionBtns = {
  position: 'absolute', top: -12, right: -8, display: 'flex', gap: 4, zIndex: 10,
}

export default memo(CustomNode)
