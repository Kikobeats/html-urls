const { isEmpty, reduce, map, get, findIndex } = require('lodash')
const { getUrl } = require('@metascraper/helpers')
const cheerio = require('cheerio')

const reduceSelector = (collection, fn, acc = []) => {
  collection.each(function (index, element) {
    acc = fn(acc, this)
  })
  return acc
}

const includes = (collection, fn) => findIndex(collection, fn) !== -1

const getLink = ({ url, el, attribute }) => {
  const attr = get(el, `attribs.${attribute}`, '')
  if (isEmpty(attr)) return null
  return Object.assign({
    normalizeUrl: getUrl(url, attr),
    url: attr
  })
}

const urlPattern = str => new RegExp(str, 'i')

const linksAttr = {
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

const addLinksByAttribute = ({ $, tags, attribute, url, blackListPattern }) => {
  const selector = $(tags.join(','))
  return reduceSelector(
    selector,
    (acc, el) => {
      const link = getLink({ url, el, attribute })
      if (isEmpty(link)) return acc

      const isAlreadyAdded = includes(
        acc,
        item => getUrl(item.normalizeUrl) === link.normalizeUrl
      )
      if (isAlreadyAdded) return acc

      const isBlacklist = includes(blackListPattern, pattern =>
        pattern.test(link.normalizeUrl)
      )
      if (!isBlacklist) acc.push(link)

      return acc
    },
    []
  )
}

const analyzeLinks = ({ html = '', url = '', blacklist = [] } = {}) => {
  const $ = cheerio.load(html)
  const blackListPattern = map(blacklist, urlPattern)

  return reduce(
    linksAttr,
    (acc, tags, attribute) => {
      const links = addLinksByAttribute({
        $,
        tags,
        attribute,
        url,
        blackListPattern
      })
      acc = acc.concat(links)
      return acc
    },
    []
  )
}

module.exports = analyzeLinks
