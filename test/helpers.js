'use strict'

const generateHtml = ({ links = [], urls = [] }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>hello world</title>
  ${links.map(link => `<link href="${link}"></a>`).join('\n')}
</head>
<body>
  ${urls.map(url => `<a href="${url}"></a>`).join('\n')}
</body>
</html>
`

module.exports = { generateHtml }
