import https from 'https'

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'user-agent': 'inmoalia-catalog/1' } }, (res) => {
        let d = ''
        res.on('data', (c) => (d += c))
        res.on('end', () => resolve(d))
      })
      .on('error', reject)
  })
}

for (const path of ['/home/sd-furniture/hps/hps-06', '/home/sd-furniture/hps/hps-07']) {
  const d = await fetchText(`https://www.aw-dropship.es${path}`)
  const set = new Set()
  for (const m of d.matchAll(/https:\/\/media\.aiku\.io\/[^"'\\\s<>]+/g)) {
    const raw = m[0]
    if (!/(jpe?g|png|webp)/i.test(raw)) continue
    set.add(raw.split('?')[0])
  }
  const urls = [...set].filter((s) => /HD|GD|GC/.test(s)).slice(0, 15)
  console.log('---', path, '---', urls.length)
  console.log(JSON.stringify(urls, null, 2))
}
