const $form = $('#registerForm')
$form.on('submit', (e) => {
  //阻止默认事件
  //preventDefault()[dom标准写法(ie678不兼容)]
  //ie678用returnValue
  //或者利用return false也能阻止默认行为,没有兼容问题(只限传统注册方式)
  e.preventDefault()
  // 获取用户名和密码
  const name = $form.find('input[name=name]').val()
  const password = $form.find('input[name=password]').val()

  // console.log(typeof name, typeof password)
  // console.log(name, password)

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
  })
})