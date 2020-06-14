var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {

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

  console.log("有个傻子发请求过来啦！路径（带查询参数）为：" + pathWithQuery)
  const session = JSON.parse(fs.readFileSync('./session.json').toString())

  /* 动态服务器 */

  // 登录
  if (path === '/sign_in' && method === 'POST') {
    response.setHeader('Content-Type', "text/html;charset=utf-8")
    // 获取当前数据库中的用户名密码
    const userArray = JSON.parse(fs.readFileSync('./db/users.json'))

    // 声明一个数组塞数据 数据有可能是分段（数据块chunk）上传的 数据的大小未知
    const array = []
    // 监听发送请求
    // 请求传来一个数据过来 放入数组
    request.on('data', (chunk) => {
      array.push(chunk)
    })

    // 监听请求结束
    request.on('end', () => {
      const string = Buffer.concat(array).toString()
      const obj = JSON.parse(string) // name password

      // 判断是否有匹配的 name 和 password ，并且拿到存进变量user
      const user = userArray.find((user) => user.name === obj.name && user.password === obj.password)

      if (user === undefined) {
        response.statusCode = 400
        // response.end('name password不匹配')
        response.end(`{"errorCode":4001}`)
      } else {
        response.statusCode = 200

        const random = (10 * Math.random()).toString(36).slice(2)
        //每发一次请求 读取一次session // const session = JSON.parse(fs.readFileSync('./session.json').toString())
        session[random] = {
          user_id: user.id
        }

        // 写入session
        fs.writeFileSync('./session.json', JSON.stringify(session))
        // response.setHeader('Set-Cookie', `logined=1`) // 替换
        // response.setHeader('Set-Cookie', `user_id=${user.id};HttpOnly`)
        response.setHeader('Set-Cookie', `session_id=${random};HttpOnly`)

        response.end()
      }
    })

  } else if (path === '/home.html') { // 跳转主页

    const cookie = request.headers['cookie'] // 小写的cookie
    console.log('cookie: ' + cookie)
    // 模板
    const homeHtml = fs.readFileSync('./public/home.html').toString()

    // let userId // "string"
    let sessionId // "string"
    try {
      // 将字符串 转为数组 处理
      // .split(';') // 分割成子字符串数组
      // .filter(s => s.indexOf('user_id') >= 0)[0] // 查找到"user_id"
      // 由response.setHeader('Set-Cookie', `user_id=${user.id}`)
      // .split('=')[1]

      /*
        userId = cookie.split(';')
        .filter(s => s.indexOf('user_id=') >= 0)[0]
        .split('=')[1]
      */

      sessionId = cookie
        .split(';')
        .filter(s => s.indexOf('session_id=') >= 0)[0]
        .split('=')[1]

    } catch (error) {}
    // console.log(cookie.split(';').filter(s => s.indexOf('user_id') >= 0)[0].split('=')[1])

    console.log("free from browser by HttpOnly: sessionId: ")
    console.log(sessionId)
    console.log("hide from browser by HttpOnly: session[sessionId]: ")
    console.log(session[sessionId])

    // 匹配则替换home.html里的文字
    if (sessionId && session[sessionId]) {
      // 对应的
      const userId = session[sessionId].user_id

      // 获取当前数据库中的数据
      const userArray = JSON.parse(fs.readFileSync('./db/users.json'))

      //user.id "string" userId int
      // const user = userArray.find(user => user.id.toString() === userId)
      const user = userArray.find(user => user.id === userId)
      let string = ''

      console.log('user: ')
      console.log(user)
      // 判断user是否存在

      if (user) {
        console.log('userId: ' + userId)
        // 模板替换文字
        string = homeHtml.replace(/登录/g, '退出，重新登录')
          .replace(/{{loginStatus}}/g, '已登录')
          .replace(/{{user.name}}/g, user.name)
          .replace(/logIn/g, "logOut")
      } else {
        // string ='' // 必须有string 至少是空字符串，写到页面里
        string = homeHtml.replace(/{{loginStatus}}/g, '未登录')
          .replace(/{{user.name}}/g, '请登录，游客')
      }
      response.write(string)
    } else {
      string = homeHtml.replace(/{{loginStatus}}/g, '未登录')
        .replace(/{{user.name}}/g, '请登录，游客')
      response.write(string)
    }
    response.end()

  } else if (path === '/register' && method === 'POST') {
    response.setHeader('Content-Type', "text/html;charset=utf-8")

    // 获取当前数据库中的数据
    const userArray = JSON.parse(fs.readFileSync('./db/users.json'))

    // 声明一个数组塞数据 数据有可能是分段（数据块chunk）上传的 数据的大小未知
    const array = []
    // 监听发送请求
    // 请求传来一个数据过来 放入数组
    request.on('data', (chunk) => {
      array.push(chunk)
    })
    // 监听请求结束
    request.on('end', () => {
      const string = Buffer.concat(array).toString()
      const obj = JSON.parse(string)
      //  console.log('obj.name: ' + obj.name, 'obj.password:' + obj.password)

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

    /* 静态服务器  */
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