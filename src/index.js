'use strict'

const { uniqBy, concat, flatMap, isEmpty, map, reduce, get, findIndex } = require('lodash')
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

/**
 * Metadata keys whose `content` holds a URL. It is an explicit list because
 * most `<meta>` content is not addressable (`width=device-width`, `ie=edge`)
 * and resolving those against the base url would fabricate URLs.
 */
const METAS = [
  'canonical',
  'contentUrl',
  'embedUrl',
  'image',
  'image_src',
  'logo',
  'msapplication-TileImage',
  'msapplication-config',
  'msapplication-starturl',
  'og:audio',
  'og:audio:secure_url',
  'og:audio:url',
  'og:image',
  'og:image:secure_url',
  'og:image:url',
  'og:logo',
  'og:see_also',
  'og:url',
  'og:video',
  'og:video:secure_url',
  'og:video:url',
  'sameAs',
  'shareurl',
  'thumbnail',
  'thumbnailUrl',
  'twitter:image',
  'twitter:image:src',
  'twitter:player',
  'twitter:player:stream',
  'twitter:url',
  'url'
]

const META_ATTRIBUTES = ['property', 'name', 'itemprop']

const METAS_SELECTOR = flatMap(METAS, key =>
  map(META_ATTRIBUTES, attribute => `meta[${attribute}="${key}" i]`)
).join(',')

const REFRESH_SELECTOR = 'meta[http-equiv="refresh" i]'

const REFRESH_URL_REGEX = /^\s*[^;]*;\s*url\s*=\s*(?:'([^']*)'|"([^"]*)"|(.*?))\s*$/i

const reduceSelector = (collection, fn, acc = []) => {
  collection.each(function () {
    acc = fn(acc, this)
  })
  return acc
}

const includes = (collection, fn) => findIndex(collection, fn) !== -1

const getAttribute = attribute => el => get(el, `attribs.${attribute}`, '')

const getContent = getAttribute('content')

const getRefreshContent = el => {
  const match = REFRESH_URL_REGEX.exec(getContent(el))
  return match === null ? '' : match[1] || match[2] || match[3] || ''
}

const getLink = ({ url, value }) => {
  if (isEmpty(value)) return undefined
  const absoluteUrl = url ? normalizeUrl(url, value) : normalizeUrl(value)
  return {
    value,
    url: isHttpUrl(absoluteUrl) ? absoluteUrl : undefined,
    uri: isUri(absoluteUrl) ? absoluteUrl : undefined
  }
}

const createGetLinks = ({ removeDuplicates }) => {
  const has = removeDuplicates
    ? (acc, uid) => includes(acc, item => get(item, UID) === uid)
    : () => false

  return ({ selector, getValue, url, whitelist }) =>
    reduceSelector(
      selector,
      (acc, el) => {
        const link = getLink({ url, value: getValue(el) })
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
  const getLinks = createGetLinks({ removeDuplicates })

  const sources = concat(
    map(TAGS, (htmlTags, attribute) => ({
      selector: htmlTags.join(','),
      getValue: getAttribute(attribute)
    })),
    { selector: METAS_SELECTOR, getValue: getContent },
    { selector: REFRESH_SELECTOR, getValue: getRefreshContent }
  )

  return reduce(
    sources,
    (acc, { selector, getValue }) =>
      add(acc, getLinks({ selector: $(selector), getValue, url, whitelist })),
    []
  )
}

module.exports.TAGS = TAGS
module.exports.METAS = METAS
