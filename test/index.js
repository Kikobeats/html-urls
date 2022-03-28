'use strict'

const test = require('ava')

const getLinks = require('..')

const { generateHtml } = require('./helpers')

test('empty html generate empty output', t => {
  t.deepEqual(getLinks(), [])
  t.deepEqual(getLinks(''), [])
})

test('get links from a semantic markup', t => {
  const html = generateHtml({
    urls: ['https://google.com', 'https://facebook.com']
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

test('ignore mailto URLs', t => {
  const html = generateHtml({
    urls: ['mailto:test@kiko.com']
  })

  t.snapshot(getLinks({ html }))
})

test('ignore phone URLs', t => {
  const html = generateHtml({
    urls: ['mailto:666']
  })

  t.snapshot(getLinks({ html }))
})
