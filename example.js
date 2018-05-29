'use strict'

const getLinks = require('.')
const got = require('got')
;(async () => {
  const url = process.argv[2]
  if (!url) throw new TypeError('Need to provide an url as first argument.')
  const { body: html } = await got(url)
  const links = getLinks({ html, url })
  links.forEach(link => console.log(link.normalizeUrl))
})()
