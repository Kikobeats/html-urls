'use strict'

const { forEach } = require('lodash')
const test = require('ava').default

const getLinks = require('..')

const { METAS } = getLinks

const generateHtml = metas => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>hello world</title>
  ${metas.join('\n')}
</head>
<body>
</body>
</html>
`

forEach(METAS, key => {
  forEach(['property', 'name', 'itemprop'], attribute => {
    test(`${key} (${attribute})`, t => {
      const html = generateHtml([`<meta ${attribute}="${key}" content="/image.png">`])
      t.deepEqual(getLinks({ html, url: 'https://example.com' }), [
        {
          value: '/image.png',
          url: 'https://example.com/image.png',
          uri: 'https://example.com/image.png'
        }
      ])
    })
  })
})

test('metadata keys are matched case insensitively', t => {
  const html = generateHtml(['<meta property="OG:IMAGE" content="https://example.com/a.png">'])
  t.deepEqual(getLinks({ html }), [
    {
      value: 'https://example.com/a.png',
      url: 'https://example.com/a.png',
      uri: 'https://example.com/a.png'
    }
  ])
})

// The regression this list exists for: resolving any `<meta content>` against
// the base url turns `width=device-width` into `https://example.com/width=device-width`.
test('ignores meta tags whose content is not a URL', t => {
  const html = generateHtml([
    '<meta name="description" content="hello world">',
    '<meta property="og:title" content="hello world">',
    '<meta property="og:image:width" content="1200">',
    '<meta name="robots" content="index, follow">'
  ])
  t.deepEqual(getLinks({ html, url: 'https://example.com' }), [])
})

test('deduplicates a meta url already present as a tag url', t => {
  const html = generateHtml([
    '<link href="https://example.com/a">',
    '<meta property="og:url" content="https://example.com/a">'
  ])
  t.deepEqual(getLinks({ html }), [
    { value: 'https://example.com/a', url: 'https://example.com/a', uri: 'https://example.com/a' }
  ])
})

test('keeps a meta url duplicated when removeDuplicates is disabled', t => {
  const html = generateHtml([
    '<link href="https://example.com/a">',
    '<meta property="og:url" content="https://example.com/a">'
  ])
  t.is(getLinks({ html, removeDuplicates: false }).length, 2)
})

test('excludes meta urls matching the whitelist', t => {
  const html = generateHtml(['<meta property="og:image" content="https://example.com/a.png">'])
  t.deepEqual(getLinks({ html, whitelist: ['https://example.com*'] }), [])
})

test('detects the url of a meta refresh redirect', t => {
  const html = generateHtml(['<meta http-equiv="refresh" content="0; url=/next">'])
  t.deepEqual(getLinks({ html, url: 'https://example.com' }), [
    { value: '/next', url: 'https://example.com/next', uri: 'https://example.com/next' }
  ])
})

test('detects a meta refresh url written with quotes and odd casing', t => {
  const html = generateHtml([
    '<meta HTTP-EQUIV="Refresh" content="5;URL=\'https://example.com/next\'">'
  ])
  t.deepEqual(getLinks({ html }), [
    {
      value: 'https://example.com/next',
      url: 'https://example.com/next',
      uri: 'https://example.com/next'
    }
  ])
})

test('ignores a meta refresh without a url', t => {
  const html = generateHtml(['<meta http-equiv="refresh" content="30">'])
  t.deepEqual(getLinks({ html, url: 'https://example.com' }), [])
})

test('ignores a meta refresh with an empty url', t => {
  const html = generateHtml(['<meta http-equiv="refresh" content="0; url=">'])
  t.deepEqual(getLinks({ html, url: 'https://example.com' }), [])
})
