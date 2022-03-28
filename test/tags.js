'use strict'

const { forEach } = require('lodash')
const test = require('ava')

const getLinks = require('..')

const { TAGS } = getLinks

forEach(TAGS, (tags, attributeName) => {
  forEach(tags, tag => {
    test(`${tag} (${attributeName})`, t => {
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
      const url = 'https://example.com'
      t.snapshot(getLinks({ html, url }))
    })
  })
})
