import { useState, useEffect, useRef } from 'react'

export default function EditModal({ node, onSave, onClose }) {
  const [title, setTitle] = useState(node?.data?.title || '')
  const [content, setContent] = useState(node?.data?.content || '')
  const titleRef = useRef(null)

  useEffect(() => {
    titleRef.current?.focus()
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSave = () => {
    onSave(node.id, { title: title.trim(), content: content.trim() })
    onClose()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>노드 편집</h3>
        <label style={labelStyle}>제목</label>
        <input
          ref={titleRef}
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해주세요"
        />
        <label style={{ ...labelStyle, marginTop: 12 }}>내용</label>
        <textarea
          style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력해주세요"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={cancelBtn}>취소</button>
          <button onClick={handleSave} style={saveBtn}>저장</button>
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
  background: '#fff', borderRadius: 12, padding: 24, width: 400,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
}
const labelStyle = { fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: 14, outline: 'none', transition: 'border-color 0.15s',
}
const cancelBtn = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
  background: '#fff', fontSize: 14, color: '#374151',
}
const saveBtn = {
  padding: '8px 16px', borderRadius: 8, border: 'none',
  background: '#3b82f6', fontSize: 14, color: '#fff', fontWeight: 500,
}
