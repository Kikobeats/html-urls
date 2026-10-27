'use strict'

const { concat, isEmpty } = require('lodash')
const { normalizeUrl } = require('@metascraper/helpers')
const isHttpUrl = require('is-url-http')
const { matcher } = require('matcher')
const cheerio = require('cheerio')
const isUri = require('is-uri')

const UID = 'uri'

/**
 * Originally picked from https://github.com/rehypejs/rehype-minify/blob/main/packages/html-url-attributes/index.js
 */
const TAGS = {
  action: ['form'],
  cite: ['blockquote', 'del', 'ins', 'q'],
  data: ['object'],
  formaction: ['button', 'input'],
  href: ['a', 'area', 'base', 'link'],
  icon: ['menuitem'],
  manifest: ['html'],
  ping: ['a', 'area'],
  poster: ['video'],
  src: ['audio', 'embed', 'iframe', 'img', 'input', 'script', 'source', 'track', 'video']
}

const getDedupeKey = link => link.uri || link.value

// normalizeUrl adds a trailing slash to bare hosts, and `*` is matcher's only
// wildcard, so exact entries need the same treatment the uri already got.
const normalizeWhitelist = whitelist => {
  if (isEmpty(whitelist)) return whitelist
  return whitelist.map(pattern =>
    pattern.includes('*') ? pattern : normalizeUrl(pattern) || pattern
  )
}

const getLink = ({ url, el, attribute }) => {
  const attr = el.attribs?.[attribute]
  if (!attr) return undefined
  const absoluteUrl = url ? normalizeUrl(url, attr) : normalizeUrl(attr)
  return {
    value: attr,
    url: isHttpUrl(absoluteUrl) ? absoluteUrl : undefined,
    uri: isUri(absoluteUrl) ? absoluteUrl : undefined
  }
}

const createIsWhitelisted = whitelist => {
  if (isEmpty(whitelist)) return () => false
  const patterns = concat(whitelist)
  return uid => !isEmpty(matcher([uid], patterns))
}

module.exports = ({
  html = '',
  url = '',
  whitelist = false,
  removeDuplicates = true,
  cheerioOpts = {}
} = {}) => {
  const $ = cheerio.load(html, cheerioOpts)
  const normalizedWhitelist = normalizeWhitelist(whitelist)

  const isWhitelisted = createIsWhitelisted(normalizedWhitelist)
  const seen = removeDuplicates ? new Set() : undefined
  const links = []

  for (const [attribute, htmlTags] of Object.entries(TAGS)) {
    $(htmlTags.join(',')).each(function () {
      const link = getLink({ url, el: this, attribute })
      if (link === undefined) return
      const key = getDedupeKey(link)
      if (seen?.has(key) || isWhitelisted(link[UID])) return
      seen?.add(key)
      links.push(link)
    })
  }

  return links
}

module.exports.TAGS = TAGS
