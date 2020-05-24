// 读取数据库
const fs = require('fs')

const usersString = fs.readFileSync('./db/users.json').toString()
const usersArray = JSON.parse(usersString)
console.log(typeof usersString)
console.log(usersString)
console.log(typeof usersArray)
console.log('is Array:' + (usersArray instanceof Array))
console.log(usersArray)

// 写数据库
const user3 = {
  id: 3,
  name: "tom",
  password: "yyy"
}
usersArray.push(user3)

// 文件只能存储字符串
const string = JSON.stringify(usersArray)
fs.writeFileSync('./db/users.json', string)