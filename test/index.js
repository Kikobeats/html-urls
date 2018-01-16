'use strict'

const snapshot = require('snap-shot')
const should = require('should')

const getLinks = require('..')

describe('html links', () => {
  it('empty html generate empty output', () => {
    should(getLinks()).be.eql([])
    should(getLinks('')).be.eql([])
  })

  it('get links from a semantic markup', () => {
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
      <a href="https://facebook.com">facebook</a>
    </body>
    </html>
    `

    snapshot(getLinks({ html }))
  })

  describe('normalization', () => {
    it('remove duplicate links', () => {
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

      snapshot(getLinks({ html }))
    })

    it('final slash doesnt matter', () => {
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
        <a href="https://google.com/">google</a>
        <a href="https://google.com">google</a>
        <a href="https://facebook.com">facebook</a>
      </body>
      </html>
      `
      snapshot(getLinks({ html }))
    })

    it('query string parameters position are not relevant', () => {
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
        <a href="https://google.com?hello=world&foo=bar">google</a>
        <a href="https://google.com?foo=bar&hello=world">google</a>
        <a href="https://facebook.com">facebook</a>
      </body>
      </html>
      `

      snapshot(getLinks({ html }))
    })
  })

  describe('selector', () => {
    describe('tag `a` support', () => {
      it('resolve relative links', () => {
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
          <a href="/login">login</a>
        </body>
        </html>
        `

        const url = 'https://microlink.io'

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

  describe('blacklist', () => {
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
      snapshot(getLinks({ html, blacklist: ['https://google.com'] }))
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
      snapshot(getLinks({ html, blacklist: ['https://google.*'] }))
    })
  })
})
