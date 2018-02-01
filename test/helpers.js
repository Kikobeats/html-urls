'use strict'

const generateHtml = ({ urls }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>hello world</title>
</head>
<body>
  ${urls.map(url => `<a href="${url}"></a>`).join('\n')}
</body>
</html>
`

module.exports = { generateHtml }
