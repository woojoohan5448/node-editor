/**
 * Convert legacy string content to BlockNote blocks for backward compatibility.
 */
export function contentToBlocks(content) {
  if (Array.isArray(content)) return content
  if (!content || typeof content !== 'string') return undefined
  return content.split('\n').filter(Boolean).map(line => ({
    type: 'paragraph',
    content: [{ type: 'text', text: line, styles: {} }],
  }))
}

/**
 * Extract plain text preview from BlockNote blocks (for node card display).
 */
export function blocksToPlainText(blocks) {
  if (!Array.isArray(blocks)) return ''
  const lines = []
  for (const block of blocks) {
    if (!block.content) continue
    const texts = []
    for (const item of block.content) {
      if (item.type === 'text' && item.text) texts.push(item.text)
    }
    if (texts.length > 0) lines.push(texts.join(''))
  }
  const full = lines.join('\n')
  return full.length > 120 ? full.slice(0, 120) + '…' : full
}

/**
 * Parse Claude AI markdown response into BlockNote block array.
 */
export function parseAIResponseToBlocks(text) {
  const lines = text.split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block (fenced)
    if (line.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({
        type: 'codeBlock',
        content: [{ type: 'text', text: codeLines.join('\n'), styles: {} }],
      })
      continue
    }

    // Empty line → skip
    if (line.trim() === '') { i++; continue }

    // Headings
    if (line.startsWith('### ')) {
      blocks.push({ type: 'heading', props: { level: 3 }, content: [{ type: 'text', text: line.slice(4), styles: {} }] })
      i++; continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: line.slice(3), styles: {} }] })
      i++; continue
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: line.slice(2), styles: {} }] })
      i++; continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'paragraph', content: [] })
      i++; continue
    }

    // Bullet list
    if (/^[-*] /.test(line)) {
      blocks.push({ type: 'bulletListItem', content: [{ type: 'text', text: line.replace(/^[-*] /, ''), styles: {} }] })
      i++; continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      blocks.push({ type: 'numberedListItem', content: [{ type: 'text', text: line.replace(/^\d+\.\s/, ''), styles: {} }] })
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push({ type: 'paragraph', content: [{ type: 'text', text: line.slice(2), styles: { italic: true } }] })
      i++; continue
    }

    // Default paragraph
    blocks.push({ type: 'paragraph', content: [{ type: 'text', text: line, styles: {} }] })
    i++
  }

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', content: [{ type: 'text', text: text, styles: {} }] }]
}
