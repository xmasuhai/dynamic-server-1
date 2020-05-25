var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf('?'))
  }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

  // 动态服务器
  if (path === '/register' && method === 'POST') {
    response.setHeader('Content-Type', "text/html;charset=utf-8")

    // 获取当前数据库中的数据
    const userArray = JSON.parse(fs.readFileSync('./db/users.json'))

    // 声明一个数组塞数据 数据有可能是分段（数据块chunk）上传的 数据的大小未知
    const array = []
    // 发送请求时 监听
    // 请求传来一个数据过来 放入数组
    request.on('data', (chunk) => {
      array.push(chunk)
    })
    request.on('end', () => {
      const string = Buffer.concat(array).toString()
      console.log(string)
      const obj = JSON.parse(string)
      console.log('obj.name: ' + obj.name, 'obj.password:' + obj.password)

      // id 为最后一个用户的id + 1
      let lastUser = userArray[userArray.length - 1]
      const newUser = {
        id: lastUser ? lastUser.id + 1 : 1,
        name: obj.name,
        password: obj.password
      }

      // 更新数据
      userArray.push(newUser)
      // 将数据 转化为字符串覆盖写入数据库
      fs.writeFileSync('./db/users.json', JSON.stringify(userArray))

      response.end("很好")
    })
  } else {
    // 静态服务器

    response.statusCode = 200
    // 设置默认首页
    const filePath = path === '/' ? '/index.html' : path
    const suffixIndex = filePath.lastIndexOf('.')
    // suffix 是后缀
    const suffix = filePath.substring(suffixIndex)
    const suffixTypeName = 'text/' + suffix.replace('.', '')

    const fileTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'text/json',
      '.xml': 'text/xml',
      '.scss': 'text/scss',
      '.less': 'text/less',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.jpg': 'image/jpeg'
    }
    response.setHeader('Content-Type',
      `${fileTypes[suffix] || suffixTypeName ||text/html };charset=utf-8`)
    let content
    try {
      content = fs.readFileSync(`./public${filePath}`)
    } catch (error) {
      content = '文件不存在'
      response.statusCode = 404
    }
    response.write(content)
    response.end()
  }



  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)