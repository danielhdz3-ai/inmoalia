import Link from 'next/link'

function inlineFormat(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[1] && m[2]) {
      const href = m[2]
      const external = href.startsWith('http')
      parts.push(
        external ? (
          <a key={key++} href={href} className="text-[#2d4a3e] underline hover:text-[#1e3329]" target="_blank" rel="noopener noreferrer">
            {m[1]}
          </a>
        ) : (
          <Link key={key++} href={href} className="text-[#2d4a3e] underline hover:text-[#1e3329]">
            {m[1]}
          </Link>
        ),
      )
    } else if (m[3]) {
      parts.push(<strong key={key++} className="font-semibold text-[#2a2a2a]">{m[3]}</strong>)
    }
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length ? parts : [text]
}

function parseTable(lines: string[]) {
  const rows = lines.filter((l) => l.trim().startsWith('|')).map((l) =>
    l.split('|').slice(1, -1).map((c) => c.trim()),
  )
  if (rows.length < 2) return null
  const header = rows[0]
  const body = rows.slice(2)
  return { header, body }
}

export default function BlogMarkdown({ content }: { content: string }) {
  const blocks: React.ReactNode[] = []
  const lines = content.split('\n')
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={key++} className="text-xl font-bold text-[#2a2a2a] mt-10 mb-3">
          {line.slice(3)}
        </h2>,
      )
      i++
      continue
    }

    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const table = parseTable(tableLines)
      if (table) {
        blocks.push(
          <div key={key++} className="overflow-x-auto my-6">
            <table className="w-full text-sm border border-[#e8ddd0] rounded-lg overflow-hidden">
              <thead className="bg-[#f9f6f1]">
                <tr>
                  {table.header.map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-[#2a2a2a] border-b border-[#e8ddd0]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.body.map((row, ri) => (
                  <tr key={ri} className="border-b border-[#e8ddd0] last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-[#6b5344]">
                        {inlineFormat(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )
      }
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-5 space-y-2 my-4 text-[#6b5344] leading-relaxed">
          {items.map((item) => (
            <li key={item}>{inlineFormat(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    const para: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !lines[i].startsWith('|') && !lines[i].startsWith('- ')) {
      para.push(lines[i])
      i++
    }
    blocks.push(
      <p key={key++} className="text-[#6b5344] leading-relaxed my-4">
        {inlineFormat(para.join(' '))}
      </p>,
    )
  }

  return <div className="blog-content">{blocks}</div>
}
