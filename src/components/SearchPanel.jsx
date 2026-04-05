import { useState, useEffect, useRef, useMemo } from 'react'

function extractText(blocks) {
  if (!Array.isArray(blocks)) return ''
  const parts = []
  for (const block of blocks) {
    if (Array.isArray(block?.content)) {
      for (const item of block.content) {
        if (item?.type === 'text' && item.text) parts.push(item.text)
        if (item?.type === 'link') {
          const linkText = item.content?.map(c => c?.text || '').join('') || item.href || ''
          parts.push(linkText)
        }
      }
    }
    if (Array.isArray(block?.children)) {
      parts.push(extractText(block.children))
    }
  }
  return parts.join(' ')
}

function highlightMatch(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#fef08a', padding: 0, borderRadius: 2 }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function getSnippet(fullText, query, maxLen = 80) {
  if (!query) return fullText.slice(0, maxLen)
  const lower = fullText.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return fullText.slice(0, maxLen) + (fullText.length > maxLen ? '...' : '')
  const start = Math.max(0, idx - 20)
  const end = Math.min(fullText.length, idx + query.length + 60)
  let snippet = ''
  if (start > 0) snippet += '...'
  snippet += fullText.slice(start, end)
  if (end < fullText.length) snippet += '...'
  return snippet
}

export default function SearchPanel({ nodes, onFocusNode, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return nodes.filter(n => {
      const title = (n.data?.title || '').toLowerCase()
      const body = extractText(n.data?.blocks).toLowerCase()
      return title.includes(q) || body.includes(q)
    }).map(n => ({
      id: n.id,
      title: n.data?.title || '제목 없음',
      text: extractText(n.data?.blocks),
    }))
  }, [nodes, query])

  return (
    <div ref={panelRef} style={panel}>
      <div style={inputWrap}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          style={inputStyle}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="노드 검색..."
        />
        {query && (
          <button style={clearBtn} onClick={() => setQuery('')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      {query.trim() && (
        <div style={resultLabel}>결과 {results.length}개</div>
      )}
      <div style={resultList}>
        {results.map(r => (
          <button
            key={r.id}
            style={resultItem}
            onClick={() => { onFocusNode(r.id); onClose() }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 }}>
              {highlightMatch(r.title, query)}
            </div>
            {r.text && (
              <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>
                {highlightMatch(getSnippet(r.text, query), query)}
              </div>
            )}
          </button>
        ))}
        {query.trim() && results.length === 0 && (
          <div style={{ padding: '16px 12px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
            검색 결과가 없습니다
          </div>
        )}
      </div>
    </div>
  )
}

const panel = {
  position: 'absolute', top: 56, left: 16,
  width: 340, background: '#fff',
  border: '1px solid #e2e8f0', borderRadius: 12,
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  zIndex: 200, overflow: 'hidden',
}

const inputWrap = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '10px 14px', borderBottom: '1px solid #f1f5f9',
}

const inputStyle = {
  flex: 1, border: 'none', outline: 'none', fontSize: 14,
  background: 'transparent', color: '#1a1a1a', fontFamily: 'inherit',
}

const clearBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 20, height: 20, border: 'none', borderRadius: 4,
  background: 'transparent', color: '#9ca3af', cursor: 'pointer',
}

const resultLabel = {
  padding: '6px 14px', fontSize: 11, color: '#9ca3af', fontWeight: 500,
  borderBottom: '1px solid #f1f5f9',
}

const resultList = {
  maxHeight: 320, overflowY: 'auto',
}

const resultItem = {
  display: 'block', width: '100%', padding: '10px 14px',
  border: 'none', borderBottom: '1px solid #f8fafc',
  background: 'transparent', textAlign: 'left', cursor: 'pointer',
  transition: 'background 0.1s',
}
