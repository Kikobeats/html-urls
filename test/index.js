'use strict'

const snapshot = require('snap-shot')
const { forEach } = require('lodash')
const should = require('should')

const getLinks = require('..')

const { TAGS } = getLinks

const { generateHtml } = require('./helpers')

describe('html links', () => {
  it('empty html generate empty output', () => {
    should(getLinks()).be.eql([])
    should(getLinks('')).be.eql([])
  })

  it('get links from a semantic markup', () => {
    const html = generateHtml({
      urls: ['https://google.com', 'https://facebook.com']
    })

    snapshot(getLinks({ html }))
  })

  describe('remove duplicate urls', () => {
    it('from same tag', () => {
      const html = generateHtml({
        urls: [
          'https://google.com',
          'https://google.com',
          'https://facebook.com'
        ]
      })
      snapshot(getLinks({ html }))
    })
    it('from different tags', () => {
      const html = generateHtml({
        urls: ['https://google.com'],
        links: ['https://google.com']
      })
      snapshot(getLinks({ html }))
    })
  })

  describe('non remove duplicate urls', () => {
    it('from same tag', () => {
      const html = generateHtml({
        urls: [
          'https://google.com',
          'https://google.com',
          'https://facebook.com'
        ]
      })
      snapshot(getLinks({ html, removeDuplicates: false }))
    })
    it('from different tags', () => {
      const html = generateHtml({
        urls: ['https://google.com'],
        links: ['https://google.com']
      })
      snapshot(getLinks({ html, removeDuplicates: false }))
    })
  })

  describe('normalization', () => {
    it('invariant final slash', () => {
      const html = generateHtml({
        urls: [
          'https://google.com/',
          'https://google.com',
          'https://facebook.com'
        ]
      })

      snapshot(getLinks({ html }))
    })

    it('invariant wwww', () => {
      const html = generateHtml({
        urls: [
          'https://www.google.com',
          'https://google.com',
          'https://facebook.com'
        ]
      })

      snapshot(getLinks({ html }))
    })

    it('query string parameters position are not relevant', () => {
      const html = generateHtml({
        urls: [
          'https://google.com?hello=world&foo=bar',
          'https://google.com?foo=bar&hello=world',
          'https://facebook.com'
        ]
      })

      snapshot(getLinks({ html }))
    })

    it('ignore invalid URLs', () => {
      const html = generateHtml({
        urls: ['http://']
      })

      snapshot(getLinks({ html }))
    })

    it('ignore mailto URLs', () => {
      const html = generateHtml({
        urls: ['mailto:test@kiko.com']
      })

      snapshot(getLinks({ html }))
    })
  })

  describe('selectors supported', () => {
    forEach(TAGS, (tags, attributeName) => {
      forEach(tags, tag => {
        it(`${tag} (${attributeName})`, () => {
          const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>hello world</title>
            <${tag} ${attributeName}="https://example.com">
          </head>
          <body>
          </body>
          </html>
          `
          const url = 'https://microlink.io'
          snapshot(getLinks({ html, url }))
        })
      })
    })
  })

  describe('whitelist', () => {
    it('exclude exact match', () => {
      const urls = [
        'https://indiehackers.com/images/favicons/favicon',
        'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173',
        'https://indiehackers.com/assets/indie-hackers-12c4cfc88599dcf564ce2d9f226133.css',
        'https://indiehackers.com/feed.xml',
        'https://indiehackers.com'
      ]

      const html = generateHtml({ urls })
      const whitelist = ['https://indiehackers.com']
      const htmlUrls = getLinks({ html, whitelist }).map(
        ({ normalizedUrl }) => normalizedUrl
      )

      should(htmlUrls).be.eql([
        'https://indiehackers.com/images/favicons/favicon',
        'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173',
        'https://indiehackers.com/assets/indie-hackers-12c4cfc88599dcf564ce2d9f226133.css',
        'https://indiehackers.com/feed.xml'
      ])
    })

    it('exclude pattern', () => {
      const urls = [
        'https://indiehackers.com/images/favicons/favicon',
        'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173',
        'https://indiehackers.com/assets/indie-hackers-12c4cfc88599dcf564ce2d9f226133.css',
        'https://indiehackers.com/feed.xml',
        'https://indiehackers.com'
      ]

      const html = generateHtml({ urls })
      const whitelist = ['https://indiehackers.com*']
      const htmlUrls = getLinks({ html, whitelist }).map(
        ({ normalizedUrl }) => normalizedUrl
      )

      should(htmlUrls).be.eql([
        'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173'
      ])
    })

    it('exclude multiple pattern', () => {
      const urls = [
        'https://indiehackers.com/images/favicons/favicon',
        'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173',
        'https://indiehackers.com/assets/indie-hackers-12c4cfc88599dcf564ce2d9f226133.css',
        'https://indiehackers.com/feed.xml',
        'https://indiehackers.com'
      ]

      const html = generateHtml({ urls })
      const whitelist = [
        'https://indiehackers.com*',
        'https://www.indiehackers.com*'
      ]
      const htmlUrls = getLinks({ html, whitelist }).map(
        ({ normalizedUrl }) => normalizedUrl
      )

      should(htmlUrls).be.eql([])
    })
  })
})
