const $form = $('#registerForm')
$form.on('submit', (e) => {
  //阻止默认事件 刷新页面
  //preventDefault()[dom标准写法(ie678不兼容)]
  //ie678用returnValue
  //或者利用return false也能阻止默认行为,没有兼容问题(只限传统注册方式)
  e.preventDefault()
  // 获取用户名和密码 的值
  const name = $form.find('input[name=name]').val()
  const password = $form.find('input[name=password]').val()

  // console.log(typeof name, typeof password)
  // console.log(name, password)

  // 提交获取的数据 发一个AJAX请求
  $.ajax({
    method: 'POST',
    url: '/register',
    /*     data: JSON.stringify({
          name: name,
          password: password
        }), */
    contentType: "text/json; charset=utf-8",
    data: JSON.stringify({
      name,
      password
    })
  }).then(
    // 成功
    () => {
      alert('注册成功')
      // window.open()
      location.href = '/sign_in.html'
    },
    // 失败
    () => {
      alert('注册失败')
    })
})