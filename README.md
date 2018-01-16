# html-links

![Last version](https://img.shields.io/github/tag/Kikobeats/html-links.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/Kikobeats/html-links/master.svg?style=flat-square)](https://travis-ci.org/Kikobeats/html-links)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/html-links.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/html-links)
[![Dependency status](https://img.shields.io/david/Kikobeats/html-links.svg?style=flat-square)](https://david-dm.org/Kikobeats/html-links)
[![Dev Dependencies Status](https://img.shields.io/david/dev/Kikobeats/html-links.svg?style=flat-square)](https://david-dm.org/Kikobeats/html-links#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/html-links.svg?style=flat-square)](https://www.npmjs.org/package/html-links)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/Kikobeats)

> Get all links from a HTML markup.

## Install

```bash
$ npm install html-links --save
```

## Usage

```js
const got = require('got')
const getLinks = require('html-links')

;(async() => {
  const url = process.argv[2]
  if (!url) throw new TypeError('Need to provide an url as first argument.')
  const {body: html} = await got(url)
  const links = getLinks({html, url})

  console.log(links)

  // => [
  //   'https://microlink.io/component---src-layouts-index-js-86b5f94dfa48cb04ae41.js',
  //   'https://microlink.io/component---src-pages-index-js-a302027ab59365471b7d.js',
  //   'https://microlink.io/path---index-709b6cf5b986a710cc3a.js',
  //   'https://microlink.io/app-8b4269e1fadd08e6ea1e.js',
  //   'https://microlink.io/commons-8b286eac293678e1c98c.js',
  //   'https://microlink.io',
  //   ...
  // ]
})()
```

See [examples](/examples).

## API

### links([options])

#### options

##### html

Type: `string`<br>
Default: `''`

The HTML markup.

##### url

Type: `string`<br>
Default: `''`

The URL associated with the HTML markup.

It is used for resolve relative links that can be present in the HTML markup.

##### backlist

Type: `array`<br>
Default: `[]`

A list of links to be excluded from the final output. It supports regex patterns.

## License

**html-links** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/Kikobeats/html-links/blob/master/LICENSE.md) License.<br>
Authored and maintained by Kiko Beats with help from [contributors](https://github.com/Kikobeats/html-links/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [@Kiko Beats](https://github.com/Kikobeats) · Twitter [@Kikobeats](https://twitter.com/Kikobeats)
