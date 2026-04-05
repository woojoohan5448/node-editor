/**
 * Convert legacy string content to BlockNote blocks for backward compatibility.
 */
export function contentToBlocks(content) {
  if (Array.isArray(content)) {
    // Already BlockNote blocks - return as-is
    if (content.length === 0) return undefined
    return content
  }
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
  try {
    const lines = []
    for (const block of blocks) {
      if (!block || !Array.isArray(block.content)) continue
      const texts = []
      for (const item of block.content) {
        if (item?.type === 'text' && item.text) texts.push(item.text)
      }
      if (texts.length > 0) lines.push(texts.join(''))
    }
    const full = lines.join('\n')
    return full.length > 120 ? full.slice(0, 120) + '…' : full
  } catch {
    return ''
  }
}

/**
 * Parse inline markdown into BlockNote content array with styles.
 */
function parseInlineContent(text) {
  // Clean HTML tags first
  text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')

  const content = []
  // Match **bold**, *italic*, `code`, and plain text
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+))/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // **bold**
      content.push({ type: 'text', text: match[2], styles: { bold: true } })
    } else if (match[3]) {
      // *italic*
      content.push({ type: 'text', text: match[3], styles: { italic: true } })
    } else if (match[4]) {
      // `code`
      content.push({ type: 'text', text: match[4], styles: { code: true } })
    } else if (match[5]) {
      content.push({ type: 'text', text: match[5], styles: {} })
    }
  }

  return content.length > 0 ? content : [{ type: 'text', text, styles: {} }]
}

/**
 * Parse AI markdown response into BlockNote block array.
 */
export function parseAIResponseToBlocks(text) {
  // Normalize <br> tags to newlines and strip other HTML
  text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')

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
      blocks.push({ type: 'heading', props: { level: 3 }, content: parseInlineContent(line.slice(4)) })
      i++; continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'heading', props: { level: 2 }, content: parseInlineContent(line.slice(3)) })
      i++; continue
    }
    if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', props: { level: 1 }, content: parseInlineContent(line.slice(2)) })
      i++; continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({ type: 'paragraph', content: [] })
      i++; continue
    }

    // Bullet list
    if (/^[-*] /.test(line)) {
      blocks.push({ type: 'bulletListItem', content: parseInlineContent(line.replace(/^[-*] /, '')) })
      i++; continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      blocks.push({ type: 'numberedListItem', content: parseInlineContent(line.replace(/^\d+\.\s/, '')) })
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push({ type: 'paragraph', content: parseInlineContent(line.slice(2)) })
      i++; continue
    }

    // Default paragraph
    blocks.push({ type: 'paragraph', content: parseInlineContent(line) })
    i++
  }

  return blocks.length > 0 ? blocks : [{ type: 'paragraph', content: parseInlineContent(text) }]
}

/**
 * Parse markdown table response into BlockNote table block.
 */
export function parseTableResponse(text) {
  // Clean HTML
  text = text.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')

  const lines = text.split('\n').filter(l => l.trim())
  const tableRows = []

  for (const line of lines) {
    // Skip separator rows like |---|---|
    if (/^\|[\s-:|]+\|$/.test(line.trim())) continue
    // Match table rows like | cell | cell |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.trim().slice(1, -1).split('|').map(c => c.trim())
      tableRows.push(cells)
    }
  }

  if (tableRows.length > 0) {
    // Build BlockNote table block
    const tableContent = {
      type: 'table',
      content: {
        type: 'tableContent',
        rows: tableRows.map(cells => ({
          cells: cells.map(cell => [{ type: 'text', text: cell }]),
        })),
      },
    }
    return [tableContent]
  }

  // Fallback: if no table found, return as regular blocks
  return parseAIResponseToBlocks(text)
}
