import { useState, useEffect, useRef, useCallback } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { contentToBlocks, parseAIResponseToBlocks, parseTableResponse, blocksToPlainText } from '../utils/blockUtils'

const AI_MODES = [
  { id: 'append', icon: '➕', label: '내용 추가', desc: '기존 내용 유지 + 아래에 추가' },
  { id: 'replace', icon: '🔄', label: '내용 대체', desc: '기존 내용 지우고 새로 생성' },
  { id: 'table', icon: '📊', label: '표로 정리', desc: '기존 내용을 표 형식으로 변환' },
]

export default function EditModal({ node, onSave, onClose }) {
  const [title, setTitle] = useState(node?.data?.title || '')
  const [showAI, setShowAI] = useState(false)
  const [aiMode, setAiMode] = useState('append')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const titleRef = useRef(null)
  const aiInputRef = useRef(null)

  const initialContent = contentToBlocks(node?.data?.blocks || node?.data?.content)

  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
    uploadFile: async (file) => {
      if (!file.type.startsWith('image/')) return ''
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    },
  })

  const handleSave = useCallback(() => {
    try {
      const blocks = editor.document
      onSave(node.id, { title: title.trim(), blocks })
    } catch (e) {
      // Fallback: save title only if editor is already disposed
      onSave(node.id, { title: title.trim(), blocks: node?.data?.blocks })
    }
    onClose()
  }, [editor, node, title, onSave, onClose])

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        const slashMenu = document.querySelector('.bn-slash-menu, .bn-suggestion-menu')
        if (slashMenu) return
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleSave])

  useEffect(() => {
    if (showAI && aiMode !== 'table') aiInputRef.current?.focus()
  }, [showAI, aiMode])

  const callGemini = async (prompt, systemPrompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey || apiKey === '여기에키입력') {
      alert('API 키를 .env 파일의 VITE_GEMINI_API_KEY에 설정해주세요.')
      return null
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `API 오류 (${res.status})`)
    }

    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  const systemBase = '반드시 아래 형식으로만 답변해줘:\n1. ## 제목으로 시작\n2. 쉬운 설명 1-2문장\n3. \'쉽게 비유하자면,\' 으로 시작하는 비유 1문장\n4. **핵심 특징** 소제목\n5. - **굵은 키워드**: 설명 형태로 3-4개 불릿\n전문 용어는 괄호로 쉽게 풀어써줘.\n답변은 한국어로.\nHTML 태그는 절대 사용하지 마.'

  const handleAIRequest = async () => {
    if (aiMode === 'table') {
      await handleTableMode()
      return
    }

    if (!aiPrompt.trim()) return

    setAiLoading(true)
    try {
      const userPrompt = title.trim() ? `'${title.trim()}'에 대해 ${aiPrompt}` : aiPrompt
      const systemPrompt = aiMode === 'replace'
        ? systemBase + '\n반드시 마크다운 형식으로 답변해줘.\n제목은 ## 사용, 항목은 - 사용, 중요 단어는 **굵게** 표시.'
        : systemBase
      const text = await callGemini(userPrompt, systemPrompt)
      if (text === null) return

      const newBlocks = parseAIResponseToBlocks(text)

      if (aiMode === 'replace') {
        editor.removeBlocks(editor.document)
        editor.insertBlocks(newBlocks, editor.document[0], 'before')
      } else {
        const lastBlock = editor.document[editor.document.length - 1]
        editor.insertBlocks(newBlocks, lastBlock, 'after')
      }

      setAiPrompt('')
      setShowAI(false)
    } catch (err) {
      alert(`AI 요청 실패: ${err.message}`)
    } finally {
      setAiLoading(false)
    }
  }

  const handleTableMode = async () => {
    const currentText = blocksToPlainText(editor.document)
    if (!currentText.trim()) {
      alert('표로 정리할 내용이 없습니다. 먼저 내용을 작성해주세요.')
      return
    }

    setAiLoading(true)
    try {
      const tableSystem = '반드시 마크다운 표(| 헤더 | 헤더 |\\n|---|---|\\n| 내용 | 내용 |) 형식으로만 답변해줘.\nHTML 태그 금지. 표 외에 다른 텍스트 없이 표만 출력해줘.'
      const prompt = `아래 내용을 핵심만 추려서 표로 정리해줘:\n\n${currentText}`
      const text = await callGemini(prompt, tableSystem)
      if (text === null) return

      const tableBlocks = parseTableResponse(text)

      editor.removeBlocks(editor.document)
      editor.insertBlocks(tableBlocks, editor.document[0], 'before')

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
            <div style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 10 }}>
              AI 내용 생성
            </div>

            {/* Mode Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              {AI_MODES.map(m => (
                <label
                  key={m.id}
                  style={{
                    ...modeLabel,
                    ...(aiMode === m.id ? modeLabelActive : {}),
                  }}
                >
                  <input
                    type="radio"
                    name="aiMode"
                    value={m.id}
                    checked={aiMode === m.id}
                    onChange={() => setAiMode(m.id)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: 14 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.desc}</div>
                  </div>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: aiMode === m.id ? '5px solid #7c3aed' : '2px solid #d1d5db',
                    background: '#fff',
                  }} />
                </label>
              ))}
            </div>

            {/* Prompt Input (hidden for table mode) */}
            {aiMode !== 'table' ? (
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
                <button style={aiSubmitBtn} onClick={handleAIRequest} disabled={aiLoading}>
                  {aiLoading ? <span style={spinner} /> : '생성'}
                </button>
              </div>
            ) : (
              <button
                style={{ ...aiSubmitBtn, width: '100%', justifyContent: 'center', padding: '10px 16px' }}
                onClick={handleAIRequest}
                disabled={aiLoading}
              >
                {aiLoading ? <span style={spinner} /> : '📊 표로 정리하기'}
              </button>
            )}
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
  width: 340, padding: 14, background: '#fff',
  border: '1px solid #e9d5ff', borderRadius: 12,
  boxShadow: '0 8px 24px rgba(124,58,237,0.12)', zIndex: 10,
}

const modeLabel = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
  border: '1px solid transparent', transition: 'all 0.12s',
}

const modeLabelActive = {
  background: '#f5f3ff', border: '1px solid #e9d5ff',
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
