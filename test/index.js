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

test('does not rewrite mailto:user@host into an HTTP url', t => {
  const html = '<a href="mailto:admin@169.254.169.254">contact</a>'
  t.deepEqual(getLinks({ html, url: 'https://public.example/' }), [
    {
      value: 'mailto:admin@169.254.169.254',
      url: undefined,
      uri: 'mailto:admin@169.254.169.254'
    }
  ])
})
