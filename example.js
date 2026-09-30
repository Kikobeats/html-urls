'use strict'

const getLinks = require('.')
const got = require('got')
const { URL } = require('url')

const BLOCKED_HOSTNAME = /^(localhost|127\.|0\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|f[cd][0-9a-f]{0,2}:)/i

const isSafeUrl = url => {
  let parsed
  try {
    parsed = new URL(url)
  } catch (_) {
    return false
  }
  if (!/^https?:$/.test(parsed.protocol)) return false
  return !BLOCKED_HOSTNAME.test(parsed.hostname)
}

;(async () => {
  const url = process.argv[2]
  if (!url) throw new TypeError('Need to provide an url as first argument.')
  if (!isSafeUrl(url)) throw new TypeError('Provided url is not allowed.')
  const { body: html } = await got(url)
  const links = getLinks({ html, url })
  links.forEach(link => console.log(link.normalizedUrl))
})()
