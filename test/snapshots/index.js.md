# Snapshot report for `test/index.js`

The actual snapshot is saved in `index.js.snap`.

Generated by [AVA](https://avajs.dev).

## get links from a semantic markup

> Snapshot 1

    [
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com',
      },
      {
        uri: 'https://facebook.com/',
        url: 'https://facebook.com/',
        value: 'https://facebook.com',
      },
      {
        uri: 'mailto://example.com',
        url: undefined,
        value: 'mailto://kiko@example.com',
      },
    ]

## remove duplicate urls from same tag

> Snapshot 1

    [
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com',
      },
      {
        uri: 'https://facebook.com/',
        url: 'https://facebook.com/',
        value: 'https://facebook.com',
      },
    ]

## remove duplicate urls from different tags

> Snapshot 1

    [
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com',
      },
    ]

## non remove duplicate urls from same tag

> Snapshot 1

    [
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com',
      },
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com',
      },
      {
        uri: 'https://facebook.com/',
        url: 'https://facebook.com/',
        value: 'https://facebook.com',
      },
    ]

## non remove duplicate urls from different tags

> Snapshot 1

    [
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com',
      },
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com',
      },
    ]

## normalize trailing slash

> Snapshot 1

    [
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com/',
      },
      {
        uri: 'https://facebook.com/',
        url: 'https://facebook.com/',
        value: 'https://facebook.com',
      },
    ]

## normalize wwww

> Snapshot 1

    [
      {
        uri: 'https://www.google.com/',
        url: 'https://www.google.com/',
        value: 'https://www.google.com',
      },
      {
        uri: 'https://google.com/',
        url: 'https://google.com/',
        value: 'https://google.com',
      },
      {
        uri: 'https://facebook.com/',
        url: 'https://facebook.com/',
        value: 'https://facebook.com',
      },
    ]

## normalize query string parameters

> Snapshot 1

    [
      {
        uri: 'https://google.com/?hello=world&foo=bar',
        url: 'https://google.com/?hello=world&foo=bar',
        value: 'https://google.com?hello=world&foo=bar',
      },
      {
        uri: 'https://google.com/?foo=bar&hello=world',
        url: 'https://google.com/?foo=bar&hello=world',
        value: 'https://google.com?foo=bar&hello=world',
      },
      {
        uri: 'https://facebook.com/',
        url: 'https://facebook.com/',
        value: 'https://facebook.com',
      },
    ]

## ignore invalid URLs

> Snapshot 1

    [
      {
        uri: undefined,
        url: undefined,
        value: 'http://',
      },
    ]
