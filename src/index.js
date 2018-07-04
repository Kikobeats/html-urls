'use strict'

const { concat, isEmpty, reduce, get, findIndex } = require('lodash')
const { getUrl } = require('@metascraper/helpers')
const cheerio = require('cheerio')
const matcher = require('matcher')

const TAGS = {
  background: ['body'],
  cite: ['blockquote', 'del', 'ins', 'q'],
  data: ['object'],
  href: ['a', 'area', 'embed', 'link'],
  icon: ['command'],
  longdesc: ['frame', 'iframe'],
  manifest: ['html'],
  poster: ['video'],
  pluginspage: ['embed'],
  pluginurl: ['embed'],
  src: [
    'audio',
    'embed',
    'frame',
    'iframe',
    'img',
    'input',
    'script',
    'source',
    'track',
    'video'
  ]
}

const reduceSelector = (collection, fn, acc = []) => {
  collection.each(function (index, element) {
    acc = fn(acc, this)
  })
  return acc
}

const includes = (collection, fn) => findIndex(collection, fn) !== -1

const getLink = ({ url, el, attribute }) => {
  const attr = get(el, `attribs.${attribute}`, '')
  return isEmpty(attr)
    ? null
    : Object.assign({
      url: attr,
      normalizedUrl: getUrl(url, attr)
    })
}

const getLinksByAttribute = ({ selector, attribute, url, whitelist }) => {
  return reduceSelector(
    selector,
    (acc, el) => {
      const link = getLink({ url, el, attribute })
      if (isEmpty(link)) return acc
      const isAlreadyAdded = includes(
        acc,
        item => item.normalizedUrl === link.normalizedUrl
      )
      if (isAlreadyAdded) return acc
      const match = whitelist && matcher([link.normalizedUrl], whitelist)
      return isEmpty(match) ? concat(acc, link) : acc
    },
    []
  )
}

module.exports = ({
  html = '',
  url = '',
  whitelist = false,
  cheerioOpts = {}
} = {}) => {
  const $ = cheerio.load(html, cheerioOpts)

  const set = reduce(
    TAGS,
    (set, htmlTags, attribute) => {
      const links = getLinksByAttribute({
        selector: $(htmlTags.join(',')),
        attribute,
        url,
        whitelist
      })

      return new Set([...set, ...links])
    },
    new Set()
  )

  return Array.from(set)
}

module.exports.TAGS = TAGS
