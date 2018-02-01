'use strict'

const snapshot = require('snap-shot')
const should = require('should')

const getLinks = require('..')
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

  describe('normalization', () => {
    it('remove duplicate links', () => {
      const html = generateHtml({
        urls: [
          'https://google.com',
          'https://google.com',
          'https://facebook.com'
        ]
      })

      snapshot(getLinks({ html }))
    })

    it('final slash doesnt matter', () => {
      const html = generateHtml({
        urls: [
          'https://google.com/',
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
  })

  describe('selector', () => {
    describe('tag `a` support', () => {
      it('resolve relative links', () => {
        const url = 'https://microlink.io'
        const html = generateHtml({
          urls: ['/login']
        })

        snapshot(getLinks({ html, url }))
      })
    })

    it('tag `link` support', () => {
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>hello world</title>
        <link href="default.css" rel="stylesheet" title="Default Style">
      </head>
      <body>
      </body>
      </html>
      `

      const url = 'https://microlink.io'

      snapshot(getLinks({ html, url }))
    })
  })

  describe('whitelist', () => {
    it('string support', () => {
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>hello world</title>
      </head>
      <body>
        <a href="https://google.com">google</a>
        <a href="https://google.com">google</a>
        <a href="https://facebook.com">facebook</a>
      </body>
      </html>
      `
      snapshot(getLinks({ html, whitelist: ['https://google.com'] }))
    })

    it('regex support', () => {
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>hello world</title>
      </head>
      <body>
        <a href="https://google.es">google</a>
        <a href="https://google.com">google</a>
        <a href="https://facebook.com">facebook</a>
      </body>
      </html>
      `
      snapshot(getLinks({ html, whitelist: ['https://google.*'] }))
    })
  })
})
