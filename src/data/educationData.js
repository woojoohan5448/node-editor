import { vibeCodingNodes, vibeCodingEdges } from './vibeCodingData'

const t = (text) => [{ type: 'text', text, styles: {} }]
const tb = (text) => [{ type: 'text', text, styles: { bold: true } }]
const p = (text) => ({ type: 'paragraph', props: {}, content: t(text), children: [] })
const h2 = (text) => ({ type: 'heading', props: { level: 2 }, content: t(text), children: [] })
const h3 = (text) => ({ type: 'heading', props: { level: 3 }, content: t(text), children: [] })
const bullet = (text, children = []) => ({ type: 'bulletListItem', props: {}, content: t(text), children })
const num = (text, children = []) => ({ type: 'numberedListItem', props: {}, content: t(text), children })

const educationNodes = [
  {
    id: 'overview',
    type: 'custom',
    position: { x: 10, y: 156 },
    style: { width: 600 },
    data: {
      title: '전체 요약',
      bgColor: '#eff6ff',
      size: 420,
      blocks: [
        h2('AI는 금붕어다'),
        p('"AI는 대화를 잊는다 → 그래서 기억 보조 장치를 만들었다 → 그게 프롬프트 엔지니어링이고, 컨텍스트 엔지니어링이고, 하네스 엔지니어링이다"'),
        { type: 'divider', props: {}, content: undefined, children: [] },
        p('간담회 흐름: 금붕어 비유로 시작 → 도구 기능 설명 → 진화 흐름 순서'),
      ],
    },
  },
  {
    id: 'step1',
    type: 'custom',
    position: { x: 0, y: 350 },
    data: {
      title: '1단계: LLM 작동 원리',
      bgColor: '#fefce8',
      size: 420,
      blocks: [
        h2('"AI는 왜 금붕어인가"'),
        p('LLM의 핵심: 컨텍스트 윈도우(Context Window) 안에 있는 것만 안다'),
        { type: 'divider', props: {}, content: undefined, children: [] },
        h3('세 가지 근본적 한계'),
        num('기억이 없다 — 대화가 끝나면 완전히 초기화', []),
        num('맥락이 없다 — 내가 누구인지, 어떤 말투를 좋아하는지 모름', []),
        num('최신 정보가 없다 — 학습 데이터 이후 세상은 모름', []),
        { type: 'divider', props: {}, content: undefined, children: [] },
        p('이 세 한계를 극복하려는 시도들이 바로 상용 AI 도구의 기능들입니다.'),
      ],
    },
  },
  {
    id: 'step2',
    type: 'custom',
    position: { x: 528, y: 356 },
    data: {
      title: '2단계: 상용 도구 기능',
      bgColor: '#fff7ed',
      size: 420,
      blocks: [
        h2('도구 기능이 왜 있는가'),
        {
          type: 'table',
          props: {},
          content: {
            type: 'tableContent',
            rows: [
              { cells: [{ type: 'tableCell', content: t('기능'), props: {} }, { type: 'tableCell', content: t('극복하는 한계'), props: {} }, { type: 'tableCell', content: t('상용 도구'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('시스템 프롬프트'), props: {} }, { type: 'tableCell', content: t('역할/맥락 부재'), props: {} }, { type: 'tableCell', content: t('Claude 프로젝트, GPT Instructions'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('메모리'), props: {} }, { type: 'tableCell', content: t('기억 부재'), props: {} }, { type: 'tableCell', content: t('Claude Memory, GPT Memory'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('RAG/파일 첨부'), props: {} }, { type: 'tableCell', content: t('최신 정보 부재'), props: {} }, { type: 'tableCell', content: t('Knowledge Base, 파일 업로드'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('폴더/프로젝트'), props: {} }, { type: 'tableCell', content: t('맥락 혼합'), props: {} }, { type: 'tableCell', content: t('Claude Projects, GPT GPTs'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('스킬/지침'), props: {} }, { type: 'tableCell', content: t('행동 패턴 부재'), props: {} }, { type: 'tableCell', content: t('Claude Preferences, Custom Instructions'), props: {} }] },
            ],
          },
          children: [],
        },
      ],
    },
  },
  {
    id: 'step3',
    type: 'custom',
    position: { x: 360, y: 700 },
    data: {
      title: '3단계: 진화 흐름',
      bgColor: '#f5f3ff',
      size: 420,
      blocks: [
        h2('프롬프트 → 컨텍스트 → 하네스'),
        p('"AI를 잘 쓰는 기술"이 점점 정교해진 역사입니다.'),
        { type: 'divider', props: {}, content: undefined, children: [] },
        num('프롬프트 엔지니어링 — 말을 잘 거는 기술 (개인)', []),
        num('컨텍스트 엔지니어링 — 정보 구조를 설계하는 기술 (팀/조직)', []),
        num('하네스 엔지니어링 — AI를 자동화 흐름에 묶는 기술 (시스템)', []),
      ],
    },
  },
  {
    id: 'prompt-eng',
    type: 'custom',
    position: { x: 25, y: 1050 },
    data: {
      title: '프롬프트 엔지니어링',
      bgColor: '#f0fdf4',
      size: 420,
      blocks: [
        h2('5가지 핵심 기법'),
        p('"AI에게 말을 잘 거는 기술" — 개인이 할 수 있는 가장 기본 기술'),
        {
          type: 'table',
          props: {},
          content: {
            type: 'tableContent',
            rows: [
              { cells: [{ type: 'tableCell', content: t('기법'), props: {} }, { type: 'tableCell', content: t('한 줄 핵심'), props: {} }, { type: 'tableCell', content: t('언제 쓰나'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('역할 부여'), props: {} }, { type: 'tableCell', content: t('AI의 관점을 세팅'), props: {} }, { type: 'tableCell', content: t('보고서, 제안서'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('예시 제공'), props: {} }, { type: 'tableCell', content: t('말 대신 보여주기'), props: {} }, { type: 'tableCell', content: t('반복 작업, 포맷 고정'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('출력 형식'), props: {} }, { type: 'tableCell', content: t('결과물 모양 설계'), props: {} }, { type: 'tableCell', content: t('PPT, 표, 이메일'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('단계적 사고 (CoT)'), props: {} }, { type: 'tableCell', content: t('논리 순서 강제'), props: {} }, { type: 'tableCell', content: t('계약 검토, 판단'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('금지 지시'), props: {} }, { type: 'tableCell', content: t('나쁜 습관 차단'), props: {} }, { type: 'tableCell', content: t('뻔한 말 방지'), props: {} }] },
            ],
          },
          children: [],
        },
      ],
    },
  },
  {
    id: 'context-eng',
    type: 'custom',
    position: { x: 745, y: 1050 },
    data: {
      title: '컨텍스트 엔지니어링',
      bgColor: '#f0f9ff',
      size: 320,
      blocks: [
        h2('정보 구조 설계'),
        p('"컨텍스트 창 안에 무엇을 얼마나 넣을지를 설계하는 기술"'),
        { type: 'divider', props: {}, content: undefined, children: [] },
        bullet('시스템 프롬프트로 역할 설정'),
        bullet('메모리로 사용자 정보 기억'),
        bullet('RAG로 외부 문서 참조'),
        bullet('파일 첨부로 맥락 제공'),
        { type: 'divider', props: {}, content: undefined, children: [] },
        p('단순히 말을 잘 거는 것을 넘어, 정보 구조 자체를 설계합니다.'),
      ],
    },
  },
  {
    id: 'harness-eng',
    type: 'custom',
    position: { x: 1365, y: 1050 },
    data: {
      title: '하네스 엔지니어링',
      bgColor: '#fdf2f8',
      size: 320,
      blocks: [
        h2('자동화 연결'),
        p('"AI를 실제 작업 흐름에 묶어 자동 실행되게 만드는 기술"'),
        { type: 'divider', props: {}, content: undefined, children: [] },
        bullet('사람이 매번 질문하지 않아도 됨'),
        bullet('n8n이 뉴스를 긁어오고 → Claude가 요약 → 이메일 발송'),
        bullet('AI가 도구(harness)에 연결되어 스스로 작동'),
        { type: 'divider', props: {}, content: undefined, children: [] },
        p('이것이 에이전트(Agent)의 핵심 개념이기도 합니다.'),
      ],
    },
  },
  {
    id: 'terminology',
    type: 'custom',
    position: { x: 25, y: 1400 },
    data: {
      title: '용어 정리: 레이어 구분',
      bgColor: '#f8fafc',
      size: 420,
      blocks: [
        h2('들어본 용어들, 어디에 해당하나?'),
        {
          type: 'table',
          props: {},
          content: {
            type: 'tableContent',
            rows: [
              { cells: [{ type: 'tableCell', content: t('레이어'), props: {} }, { type: 'tableCell', content: t('개념'), props: {} }, { type: 'tableCell', content: t('누가 쓰나'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('프롬프트 기법'), props: {} }, { type: 'tableCell', content: t('CoT (Chain-of-Thought)'), props: {} }, { type: 'tableCell', content: t('일반 사용자 ✅'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('추론 아키텍처'), props: {} }, { type: 'tableCell', content: t('ToT (Tree of Thoughts)'), props: {} }, { type: 'tableCell', content: t('연구자/개발자 ⚠️'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('모델 내부 구조'), props: {} }, { type: 'tableCell', content: t('MoE (Mixture of Experts)'), props: {} }, { type: 'tableCell', content: t('AI 엔지니어 ❌'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('정보 검색'), props: {} }, { type: 'tableCell', content: t('RAG (검색 증강 생성)'), props: {} }, { type: 'tableCell', content: t('일반 사용자 ✅'), props: {} }] },
              { cells: [{ type: 'tableCell', content: t('자동화'), props: {} }, { type: 'tableCell', content: t('Agent (에이전트)'), props: {} }, { type: 'tableCell', content: t('파워유저/개발자'), props: {} }] },
            ],
          },
          children: [],
        },
        { type: 'divider', props: {}, content: undefined, children: [] },
        p('CoT만 실용 기법으로 소개하고, ToT/MoE는 "이런 것도 있다" 수준으로 배경 지식 언급'),
      ],
    },
  },
]

const educationEdges = [
  { id: 'e-overview-step1', source: 'overview', target: 'step1', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  { id: 'e-overview-step2', source: 'overview', target: 'step2', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  { id: 'e-step1-step3', source: 'step1', target: 'step3', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  { id: 'e-step2-step3', source: 'step2', target: 'step3', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  { id: 'e-step3-prompt', source: 'step3', target: 'prompt-eng', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  { id: 'e-step3-context', source: 'step3', target: 'context-eng', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  { id: 'e-step3-harness', source: 'step3', target: 'harness-eng', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
  { id: 'e-prompt-term', source: 'prompt-eng', target: 'terminology', sourceHandle: 'bottom-source', targetHandle: 'top-target' },
]

export const initialNodes = [...educationNodes, ...vibeCodingNodes]
export const initialEdges = [...educationEdges, ...vibeCodingEdges]
