import { useState, useEffect, useRef, useCallback } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { contentToBlocks, parseAIResponseToBlocks } from '../utils/blockUtils'

export default function EditModal({ node, onSave, onClose }) {
  const [title, setTitle] = useState(node?.data?.title || '')
  const [showAI, setShowAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const titleRef = useRef(null)
  const aiInputRef = useRef(null)

  const initialContent = contentToBlocks(node?.data?.blocks || node?.data?.content)

  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
  })

  const handleSave = useCallback(() => {
    const blocks = editor.document
    onSave(node.id, { title: title.trim(), blocks })
    onClose()
  }, [editor, node.id, title, onSave, onClose])

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        // Don't intercept ESC if BlockNote menus are open
        const slashMenu = document.querySelector('.bn-slash-menu, .bn-suggestion-menu')
        if (slashMenu) return
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleSave])

  useEffect(() => {
    if (showAI) aiInputRef.current?.focus()
  }, [showAI])

  const handleAIRequest = async () => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your-api-key-here') {
      alert('API 키를 .env 파일에 설정해주세요.')
      return
    }
    if (!aiPrompt.trim()) return

    setAiLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: aiPrompt }],
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `API 오류 (${res.status})`)
      }

      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const newBlocks = parseAIResponseToBlocks(text)
      const lastBlock = editor.document[editor.document.length - 1]
      editor.insertBlocks(newBlocks, lastBlock, 'after')

      setAiPrompt('')
      setShowAI(false)
    } catch (err) {
      alert(`AI 요청 실패: ${err.message}`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div style={overlay} onClick={handleSave}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <input
          ref={titleRef}
          style={titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해주세요"
        />

        {/* AI Button */}
        <button
          style={aiBtn}
          onClick={() => setShowAI(!showAI)}
          title="AI로 내용 생성"
        >
          ✨
        </button>

        {/* AI Dropdown */}
        {showAI && (
          <div style={aiDropdown}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 8 }}>
              AI 내용 생성
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={aiInputRef}
                style={aiInput}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !aiLoading) handleAIRequest() }}
                placeholder="무엇을 작성할까요?"
                disabled={aiLoading}
              />
              <button
                style={aiSubmitBtn}
                onClick={handleAIRequest}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <span style={spinner} />
                ) : '생성'}
              </button>
            </div>
          </div>
        )}

        {/* BlockNote Editor */}
        <div style={editorContainer}>
          <BlockNoteView editor={editor} theme="light" />
        </div>

        {/* Bottom Bar */}
        <div style={bottomBar}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            / 입력으로 블록 추가 &nbsp;|&nbsp; ESC로 저장 후 닫기
          </span>
          <button onClick={handleSave} style={saveBtn}>저장</button>
        </div>
      </div>

      <style>{`
        .bn-editor {
          padding: 0 !important;
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
        }
        .bn-block-outer {
          margin: 0 !important;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}

const modal = {
  position: 'relative',
  background: '#fff', borderRadius: 16, width: 640, maxWidth: '90vw',
  maxHeight: '80vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
  overflow: 'hidden',
}

const titleInput = {
  width: '100%', padding: '24px 60px 12px 24px', border: 'none', outline: 'none',
  fontSize: 22, fontWeight: 700, color: '#1a1a1a', background: 'transparent',
  fontFamily: 'inherit',
}

const aiBtn = {
  position: 'absolute', top: 20, right: 20,
  width: 36, height: 36, borderRadius: '50%',
  background: '#7c3aed', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 16, color: '#fff',
  boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
  transition: 'transform 0.15s, box-shadow 0.15s',
}

const aiDropdown = {
  position: 'absolute', top: 62, right: 20,
  width: 320, padding: 14, background: '#fff',
  border: '1px solid #e9d5ff', borderRadius: 12,
  boxShadow: '0 8px 24px rgba(124,58,237,0.12)', zIndex: 10,
}

const aiInput = {
  flex: 1, padding: '8px 12px', border: '1px solid #d8b4fe',
  borderRadius: 8, fontSize: 13, outline: 'none',
  fontFamily: 'inherit',
}

const aiSubmitBtn = {
  padding: '8px 16px', borderRadius: 8, border: 'none',
  background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', whiteSpace: 'nowrap', minWidth: 52,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const spinner = {
  display: 'inline-block', width: 16, height: 16,
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: '#fff', borderRadius: '50%',
  animation: 'spin 0.6s linear infinite',
}

const editorContainer = {
  flex: 1, overflow: 'auto', padding: '0 8px',
  minHeight: 300, maxHeight: 'calc(80vh - 160px)',
}

const bottomBar = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 24px', borderTop: '1px solid #f3f4f6',
}

const saveBtn = {
  padding: '8px 20px', borderRadius: 8, border: 'none',
  background: '#3b82f6', fontSize: 14, color: '#fff', fontWeight: 500,
  cursor: 'pointer',
}
