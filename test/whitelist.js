'use strict'

const test = require('ava')

const getLinks = require('..')

const { generateHtml } = require('./helpers')

test.only('exclude exact match from whitelist', t => {
  const urls = [
    'https://indiehackers.com/images/favicons/favicon',
    'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173',
    'https://indiehackers.com/assets/indie-hackers-12c4cfc88599dcf564ce2d9f226133.css',
    'https://indiehackers.com/feed.xml',
    'https://indiehackers.com'
  ]

  const html = generateHtml({ urls })
  const whitelist = ['https://indiehackers.com/']
  const htmlUrls = getLinks({ html, whitelist }).map(({ uri }) => uri)

  t.deepEqual(htmlUrls, [
    'https://indiehackers.com/images/favicons/favicon',
    'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173',
    'https://indiehackers.com/assets/indie-hackers-12c4cfc88599dcf564ce2d9f226133.css',
    'https://indiehackers.com/feed.xml'
  ])
})

test('exclude pattern from whitelist', t => {
  const urls = [
    'https://indiehackers.com/images/favicons/favicon',
    'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173',
    'https://indiehackers.com/assets/indie-hackers-12c4cfc88599dcf564ce2d9f226133.css',
    'https://indiehackers.com/feed.xml',
    'https://indiehackers.com'
  ]

  const html = generateHtml({ urls })
  const whitelist = ['https://indiehackers.com*']
  const htmlUrls = getLinks({ html, whitelist }).map(({ uri }) => uri)

  t.deepEqual(htmlUrls, [
    'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173'
  ])
})

test('exclude multiple pattern from whitelist', t => {
  const urls = [
    'https://indiehackers.com/images/favicons/favicon',
    'https://www.indiehackers.com/forum/introduce-yourself-january-2018-411d4f5173',
    'https://indiehackers.com/assets/indie-hackers-12c4cfc88599dcf564ce2d9f226133.css',
    'https://indiehackers.com/feed.xml',
    'https://indiehackers.com'
  ]

  const html = generateHtml({ urls })
  const whitelist = ['https://indiehackers.com*', 'https://www.indiehackers.com*']
  const htmlUrls = getLinks({ html, whitelist }).map(({ uri }) => uri)

  t.deepEqual(htmlUrls, [])
})
