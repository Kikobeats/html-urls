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

// Prefer normalized uri for dedupe; fall back to the raw attribute value so
// unresolved relatives (uri === undefined) are not collapsed into one entry.
const getDedupeKey = link => {
  const uri = get(link, UID)
  return uri === undefined ? get(link, 'value') : uri
}

// normalizeUrl adds a trailing slash to bare hosts. Mirror that for exact
// whitelist entries so `https://evil.com` still excludes `https://evil.com/`.
const normalizeWhitelist = whitelist => {
  if (isEmpty(whitelist)) return whitelist
  return whitelist.map(pattern => {
    if (typeof pattern !== 'string') return pattern
    if (/[*?[]/.test(pattern)) return pattern
    return normalizeUrl(pattern) || pattern
  })
}

const getLink = ({ url, el, attribute }) => {
  const attr = get(el, `attribs.${attribute}`, '')
  if (isEmpty(attr)) return undefined
  const absoluteUrl = url ? normalizeUrl(url, attr) : normalizeUrl(attr)
  return {
    value: attr,
    url: isHttpUrl(absoluteUrl) ? absoluteUrl : undefined,
    uri: isUri(absoluteUrl) ? absoluteUrl : undefined
  }
}

const createGetLinksByAttribute = ({ removeDuplicates }) => {
  const has = removeDuplicates
    ? (acc, key) => includes(acc, item => getDedupeKey(item) === key)
    : () => false

  return ({ selector, attribute, url, whitelist }) =>
    reduceSelector(
      selector,
      (acc, el) => {
        const link = getLink({ url, el, attribute })
        if (isEmpty(link)) return acc
        const key = getDedupeKey(link)
        const isAlreadyAdded = has(acc, key)
        if (isAlreadyAdded) return acc
        const uid = get(link, UID)
        const match = !isEmpty(whitelist) && uid !== undefined && matcher([uid], concat(whitelist))
        return isEmpty(match) ? concat(acc, link) : acc
      },
      []
    )
}

const createAdd = ({ removeDuplicates }) =>
  removeDuplicates
    ? (acc, links) => uniqBy(concat(acc, links), getDedupeKey)
    : (acc, links) => concat(acc, links)

module.exports = ({
  html = '',
  url = '',
  whitelist = false,
  removeDuplicates = true,
  cheerioOpts = {}
} = {}) => {
  const $ = cheerio.load(html, cheerioOpts)
  const normalizedWhitelist = normalizeWhitelist(whitelist)

  const add = createAdd({ removeDuplicates })
  const getLinksByAttribute = createGetLinksByAttribute({ removeDuplicates })

  return reduce(
    TAGS,
    (acc, htmlTags, attribute) => {
      const links = getLinksByAttribute({
        selector: $(htmlTags.join(',')),
        attribute,
        url,
        whitelist: normalizedWhitelist
      })
      return add(acc, links)
    },
    []
  )
}

module.exports.TAGS = TAGS
