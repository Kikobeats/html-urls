'use strict'

const test = require('ava').default

const getLinks = require('..')

const { generateHtml } = require('./helpers')

test('empty html generate empty output', t => {
  t.deepEqual(getLinks(), [])
  t.deepEqual(getLinks(''), [])
})

test('get links from a semantic markup', t => {
  const html = generateHtml({
    urls: ['https://google.com', 'https://facebook.com', 'mailto://kiko@example.com']
  })

  t.snapshot(getLinks({ html }))
})

test('remove duplicate urls from same tag', t => {
  const html = generateHtml({
    urls: ['https://google.com', 'https://google.com', 'https://facebook.com']
  })
  t.snapshot(getLinks({ html }))
})

test('remove duplicate urls from different tags', t => {
  const html = generateHtml({
    urls: ['https://google.com'],
    links: ['https://google.com']
  })
  t.snapshot(getLinks({ html }))
})

test('non remove duplicate urls from same tag', t => {
  const html = generateHtml({
    urls: ['https://google.com', 'https://google.com', 'https://facebook.com']
  })
  t.snapshot(getLinks({ html, removeDuplicates: false }))
})

test('non remove duplicate urls from different tags', t => {
  const html = generateHtml({
    urls: ['https://google.com'],
    links: ['https://google.com']
  })
  t.snapshot(getLinks({ html, removeDuplicates: false }))
})

test('normalize trailing slash', t => {
  const html = generateHtml({
    urls: ['https://google.com/', 'https://google.com', 'https://facebook.com']
  })

  t.snapshot(getLinks({ html }))
})

test('normalize wwww', t => {
  const html = generateHtml({
    urls: ['https://www.google.com', 'https://google.com', 'https://facebook.com']
  })

  t.snapshot(getLinks({ html }))
})

test('normalize query string parameters', t => {
  const html = generateHtml({
    urls: [
      'https://google.com?hello=world&foo=bar',
      'https://google.com?foo=bar&hello=world',
      'https://facebook.com'
    ]
  })

  t.snapshot(getLinks({ html }))
})

test('ignore invalid URLs', t => {
  const html = generateHtml({
    urls: ['http://']
  })

  t.snapshot(getLinks({ html }))
})

// Asserted explicitly rather than snapshotted: a regenerated snapshot would
// silently re-accept `url: http://169.254.169.254` for a mail address.
test('does not rewrite mailto:user@host into an HTTP url', t => {
  const html = generateHtml({ urls: ['mailto:admin@169.254.169.254'] })
  t.deepEqual(getLinks({ html, url: 'https://example.com/' }), [
    {
      value: 'mailto:admin@169.254.169.254',
      url: undefined,
      uri: 'mailto:admin@169.254.169.254'
    }
  ])
})

test('keeps the scheme of non HTTP(S) URIs', t => {
  const html = generateHtml({
    urls: [
      'MAILTO:Admin@Example.com',
      'mailto:',
      'tel:+34123456789',
      'custom:%zz',
      'javascript:alert(1)',
      'data:text/plain,hello',
      'ftp://EXAMPLE.com/a/../file.txt',
      'file:///etc/passwd'
    ]
  })

  t.snapshot(getLinks({ html, url: 'https://public.example/' }))
})

test('trims surrounding whitespace before resolving', t => {
  const html = generateHtml({ urls: ['  mailto:user@example.com  ', '  /path  '] })

  t.snapshot(getLinks({ html, url: 'https://example.com/dir/' }))
})

test('resolves relative and protocol relative URLs against the base url', t => {
  const html = generateHtml({ urls: ['/path?x=a:b', '//example.com/a', '#frag', 'page.html'] })

  t.snapshot(getLinks({ html, url: 'https://example.com/dir/' }))
})
