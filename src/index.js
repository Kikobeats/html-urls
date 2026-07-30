'use strict'

const { uniqBy, concat, isEmpty, reduce, get, findIndex } = require('lodash')
const { normalizeUrl } = require('@metascraper/helpers')
const isHttpUrl = require('is-url-http')
const cheerio = require('cheerio')
const matcher = require('matcher')
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

const reduceSelector = (collection, fn, acc = []) => {
  collection.each(function () {
    acc = fn(acc, this)
  })
  return acc
}

const includes = (collection, fn) => findIndex(collection, fn) !== -1

const SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/

// `@metascraper/helpers` exposes `protocol`, but it resolves via `new URL` and every
// relative href throws to get there, measured 75x slower than matching the scheme.
const isHttpScheme = value => {
  const match = SCHEME.exec(value)
  if (match === null) return true
  const scheme = match[1].toLowerCase()
  return scheme === 'http' || scheme === 'https'
}

const getLink = ({ url, el, attribute }) => {
  const attr = get(el, `attribs.${attribute}`, '').trim()
  if (isEmpty(attr)) return undefined

  // normalizeUrl applies defaultProtocol `http:`, turning `mailto:user@host` into
  // the fetchable `http://host`, so non-HTTP(S) schemes keep their own value.
  if (!isHttpScheme(attr)) {
    const normalized = normalizeUrl(attr)
    const uri = !normalized || isHttpScheme(normalized) ? attr : normalized
    return { value: attr, url: undefined, uri: isUri(uri) ? uri : undefined }
  }

  const absoluteUrl = url ? normalizeUrl(url, attr) : normalizeUrl(attr)
  return {
    value: attr,
    url: isHttpUrl(absoluteUrl) ? absoluteUrl : undefined,
    uri: isUri(absoluteUrl) ? absoluteUrl : undefined
  }
}

const createGetLinksByAttribute = ({ removeDuplicates }) => {
  const has = removeDuplicates
    ? (acc, uid) => includes(acc, item => get(item, UID) === uid)
    : () => false

  return ({ selector, attribute, url, whitelist }) =>
    reduceSelector(
      selector,
      (acc, el) => {
        const link = getLink({ url, el, attribute })
        const uid = get(link, UID)
        if (isEmpty(link)) return acc
        const isAlreadyAdded = has(acc, uid)
        if (isAlreadyAdded) return acc
        const match = !isEmpty(whitelist) && matcher([uid], concat(whitelist))
        return isEmpty(match) ? concat(acc, link) : acc
      },
      []
    )
}

const createAdd = ({ removeDuplicates }) =>
  removeDuplicates
    ? (acc, links) => uniqBy(concat(acc, links), UID)
    : (acc, links) => concat(acc, links)

module.exports = ({
  html = '',
  url = '',
  whitelist = false,
  removeDuplicates = true,
  cheerioOpts = {}
} = {}) => {
  const $ = cheerio.load(html, cheerioOpts)

  const add = createAdd({ removeDuplicates })
  const getLinksByAttribute = createGetLinksByAttribute({ removeDuplicates })

  return reduce(
    TAGS,
    (acc, htmlTags, attribute) => {
      const links = getLinksByAttribute({
        selector: $(htmlTags.join(',')),
        attribute,
        url,
        whitelist
      })
      return add(acc, links)
    },
    []
  )
}

module.exports.TAGS = TAGS
