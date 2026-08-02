'use strict'

const test = require('ava').default

const getLinks = require('..')

const { generateHtml } = require('./helpers')

test('empty html generate empty output', t => {
  t.deepEqual(getLinks(), [])
  t.deepEqual(getLinks(''), [])
})

test('keeps distinct unresolved relatives when url is omitted', t => {
  const html = `
    <a href="/r1"></a>
    <a href="/r2"></a>
    <img src="logo.png">
    <a href="#x"></a>
    <a href="https://a.com/ok"></a>
  `

  t.deepEqual(
    getLinks({ html }).map(({ value }) => value),
    ['/r1', '/r2', '#x', 'https://a.com/ok', 'logo.png']
  )
})

test('still dedupes identical unresolved relatives by value', t => {
  const html = `
    <a href="/same"></a>
    <a href="/same"></a>
    <img src="/same">
  `

  t.deepEqual(
    getLinks({ html }).map(({ value }) => value),
    ['/same']
  )
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
  const html = generateHtml({
    urls: ['mailto:admin@169.254.169.254', 'mailto:root@127.0.0.1']
  })

  t.deepEqual(getLinks({ html, url: 'https://example.com/' }), [
    {
      value: 'mailto:admin@169.254.169.254',
      url: undefined,
      uri: 'mailto:admin@169.254.169.254'
    },
    {
      value: 'mailto:root@127.0.0.1',
      url: undefined,
      uri: 'mailto:root@127.0.0.1'
    }
  ])
})

test('keeps the scheme of non HTTP(S) URIs', t => {
  const html = generateHtml({
    urls: [
      'MAILTO:Admin@Example.com',
      'mailto:',
      'tel:+34123456789',
      'data:text/plain,hello',
      'ftp://EXAMPLE.com/a/../file.txt',
      'file:///etc/passwd'
    ]
  })

  t.snapshot(getLinks({ html, url: 'https://example.com/' }))
})

test('discards URIs that cannot be fetched or addressed', t => {
  const html = generateHtml({ urls: ['javascript:alert(1)'] })

  t.deepEqual(getLinks({ html, url: 'https://example.com/' }), [
    { value: 'javascript:alert(1)', url: undefined, uri: undefined }
  ])
})

test('resolves a padded attribute, keeping the value as authored', t => {
  const html = generateHtml({ urls: ['  mailto:user@example.com  ', '  /path  '] })

  t.snapshot(getLinks({ html, url: 'https://example.com/dir/' }))
})

test('resolves relative and protocol relative URLs against the base url', t => {
  const html = generateHtml({ urls: ['/path?x=a:b', '//example.com/a', '#frag', 'page.html'] })

  t.snapshot(getLinks({ html, url: 'https://example.com/dir/' }))
})
