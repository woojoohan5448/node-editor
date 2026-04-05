import { useState, useEffect } from 'react'
import { encodeProjectData } from '../utils/storage'

export default function PublishModal({ nodes, edges, onClose }) {
  const [copied, setCopied] = useState(false)
  const encoded = encodeProjectData(nodes, edges)
  const url = `${window.location.origin}/view/${encoded}`

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>공유 링크</h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          아래 링크를 공유하면 누구나 읽기 전용으로 볼 수 있습니다.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{
              flex: 1, padding: '10px 12px', border: '1px solid #d1d5db',
              borderRadius: 8, fontSize: 13, background: '#f9fafb', outline: 'none',
            }}
            value={url}
            readOnly
            onFocus={(e) => e.target.select()}
          />
          <button onClick={handleCopy} style={copyBtn}>
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} style={closeBtn}>닫기</button>
        </div>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}
const modal = {
  background: '#fff', borderRadius: 12, padding: 24, width: 480,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
}
const copyBtn = {
  padding: '10px 16px', borderRadius: 8, border: 'none',
  background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
}
const closeBtn = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
  background: '#fff', fontSize: 14, color: '#374151',
}
