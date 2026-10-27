'use strict'

const { writeFileSync } = require('fs')
const { join } = require('path')

const htmlUrls = require('..')

const RUNS = 7
const PAGE_URL = 'https://example.com/blog/'

const LINK_KINDS = [
  index => `/page/${index}`,
  index => `https://example.org/post/${index}`,
  index => `/page/${index % 50}`,
  index => `#section-${index % 20}`,
  index => `mailto:user${index % 30}@example.com`,
  () => 'javascript:void(0)',
  index => `../assets/${index}.png`,
  index => `https://cdn.example.net/lib/${index % 100}.js?v=${index % 3}`
]

const median = values => {
  const sorted = values.slice().sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const createPage = links => {
  const anchors = Array.from(
    { length: links },
    (_, index) => `<a href="${LINK_KINDS[index % LINK_KINDS.length](index)}">link ${index}</a>`
  )
  return `<html><body>${anchors.join('\n')}</body></html>`
}

const dedupeKey = link => link.uri || link.value

const countUnique = links => new Set(links.map(dedupeKey)).size

const extract = (html, removeDuplicates) => htmlUrls({ html, url: PAGE_URL, removeDuplicates })

const caseName = ({ links, removeDuplicates }) =>
  `${links} links removeDuplicates ${removeDuplicates ? 'on' : 'off'}`

const createCase = ({ links, removeDuplicates, iterations }) => {
  const html = createPage(links)
  const expected = removeDuplicates ? countUnique(extract(html, false)) : links
  return {
    name: caseName({ links, removeDuplicates }),
    iterations,
    work: `parses of ${links} links (${html.length} html chars), ${expected} expected`,
    run: count => {
      for (let i = 0; i < count; i++) {
        const result = extract(html, removeDuplicates)
        if (result.length !== expected) {
          throw new Error(`expected ${expected} links, got ${result.length}`)
        }
        if (removeDuplicates && countUnique(result) !== result.length) {
          throw new Error('duplicates left in result')
        }
      }
    }
  }
}

const CASES = [
  { links: 1000, removeDuplicates: false, iterations: 8 },
  { links: 1000, removeDuplicates: true, iterations: 8 },
  { links: 16000, removeDuplicates: false, iterations: 1 },
  { links: 16000, removeDuplicates: true, iterations: 1 }
]

const measure = entry => {
  const walls = []
  let errors = 0
  entry.run(1)
  for (let run = 0; run < RUNS; run++) {
    const started = process.hrtime.bigint()
    try {
      entry.run(entry.iterations)
      walls.push(Number(process.hrtime.bigint() - started) / 1e6)
    } catch (error) {
      errors++
      console.error(`${entry.name} run ${run}`, error)
    }
  }
  return { walls, errors }
}

const fmt = value => value.toFixed(1)

const report = (entry, { walls, errors }) => {
  const med = walls.length ? median(walls) : Number.NaN
  const min = walls.length ? Math.min(...walls) : Number.NaN
  const max = walls.length ? Math.max(...walls) : Number.NaN
  const extra = `work ${entry.iterations} ${entry.work}, errors ${errors}, runs ${RUNS}`
  console.log(`${entry.name}  median ${fmt(med)}ms  range ${fmt(min)}-${fmt(max)}  ${extra}`)
  return {
    name: entry.name,
    unit: 'ms',
    value: Number(fmt(med)),
    range: `${fmt(min)}-${fmt(max)}`,
    extra
  }
}

const main = () => {
  const results = []
  let errors = 0
  for (const options of CASES) {
    let entry
    let measured
    try {
      entry = createCase(options)
      measured = measure(entry)
    } catch (error) {
      console.error(`${caseName(options)} warmup`, error)
      entry = { name: caseName(options), iterations: options.iterations, work: 'parses' }
      measured = { walls: [], errors: 1 }
    }
    errors += measured.errors
    results.push(report(entry, measured))
  }
  writeFileSync(
    join(__dirname, '..', 'benchmark-output.json'),
    JSON.stringify(results, null, 2) + '\n'
  )
  if (errors > 0 || results.some(result => !Number.isFinite(result.value))) {
    process.exitCode = 1
  }
}

main()
