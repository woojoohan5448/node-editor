import { useState, useEffect } from 'react'

const TABS = [
  { id: 'account', label: '계정 정보' },
  { id: 'project', label: '프로젝트 설정' },
]

export default function SettingsModal({ project, onRename, onDelete, onClose }) {
  const [tab, setTab] = useState('account')
  const [projectName, setProjectName] = useState(project?.name || '')
  const [userName] = useState(() => localStorage.getItem('lw_user_name') || '사용자')
  const [userEmail] = useState(() => localStorage.getItem('lw_user_email') || 'user@example.com')

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    setProjectName(project?.name || '')
  }, [project])

  const handleSaveName = () => {
    if (projectName.trim()) {
      onRename(project.id, projectName.trim())
    }
  }

  const initial = userName.charAt(0).toUpperCase()

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalHeader}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>설정</h3>
          <button style={closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={body}>
          {/* Left Tabs */}
          <div style={sidebar}>
            {TABS.map(t => (
              <button
                key={t.id}
                style={{ ...tabBtn, ...(tab === t.id ? tabBtnActive : {}) }}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div style={content}>
            {tab === 'account' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                  <div style={avatar}>{initial}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>{userName}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{userEmail}</div>
                  </div>
                </div>

                <label style={labelStyle}>이름</label>
                <input
                  style={inputStyle}
                  value={userName}
                  readOnly
                  placeholder="이름"
                />

                <label style={{ ...labelStyle, marginTop: 16 }}>이메일</label>
                <input
                  style={inputStyle}
                  value={userEmail}
                  readOnly
                  placeholder="이메일"
                />

                <button style={logoutBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  로그아웃
                </button>
              </div>
            )}

            {tab === 'project' && (
              <div>
                <label style={labelStyle}>프로젝트 이름</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                    placeholder="프로젝트 이름"
                  />
                  <button style={saveBtn} onClick={handleSaveName}>저장</button>
                </div>

                <div style={dangerZone}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>
                    위험 구역
                  </div>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                    프로젝트를 삭제하면 모든 노드와 연결이 영구적으로 삭제됩니다.
                  </p>
                  <button
                    style={deleteBtn}
                    onClick={() => {
                      if (window.confirm(`"${project.name}" 프로젝트를 삭제하시겠습니까?`)) {
                        onDelete(project.id)
                        onClose()
                      }
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    프로젝트 삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}

const modal = {
  background: '#fff', borderRadius: 14, width: 560, maxWidth: '90vw',
  maxHeight: '80vh', overflow: 'hidden',
  boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
  display: 'flex', flexDirection: 'column',
}

const modalHeader = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
}

const closeBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, border: 'none', borderRadius: 8,
  background: 'transparent', color: '#6b7280', cursor: 'pointer',
}

const body = {
  display: 'flex', flex: 1, minHeight: 320,
}

const sidebar = {
  width: 160, padding: '12px 8px', borderRight: '1px solid #f3f4f6',
  display: 'flex', flexDirection: 'column', gap: 2,
}

const tabBtn = {
  padding: '10px 12px', border: 'none', borderRadius: 8,
  background: 'transparent', color: '#6b7280', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
}

const tabBtnActive = {
  background: '#f0f7ff', color: '#3b82f6', fontWeight: 600,
}

const content = {
  flex: 1, padding: 24, overflow: 'auto',
}

const avatar = {
  width: 48, height: 48, borderRadius: '50%',
  background: '#7c3aed', color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 20, fontWeight: 700,
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6,
}

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8,
  fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a1a',
}

const saveBtn = {
  padding: '10px 20px', borderRadius: 8, border: 'none',
  background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 500,
  cursor: 'pointer', whiteSpace: 'nowrap',
}

const logoutBtn = {
  display: 'flex', alignItems: 'center', gap: 8,
  marginTop: 28, padding: '10px 16px', borderRadius: 8,
  border: '1px solid #d1d5db', background: '#fff',
  fontSize: 14, color: '#374151', cursor: 'pointer',
}

const dangerZone = {
  marginTop: 32, padding: 16, borderRadius: 10,
  border: '1px solid #fecaca', background: '#fef2f2',
}

const deleteBtn = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '10px 16px', borderRadius: 8, border: 'none',
  background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 500,
  cursor: 'pointer',
}
