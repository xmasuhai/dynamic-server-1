function sign(signId, signUrl, signHref, signMsg) {
  const $form = $(signId)
  $form.on('submit', (e) => {
    e.preventDefault()
    const name = $form.find('input[name=name]').val()
    const password = $form.find('input[name=password]').val()

    $.ajax({
      method: 'POST',
      url: signUrl,
      contentType: "text/json; charset=utf-8",
      data: JSON.stringify({
        name,
        password
      })
    }).then(
      () => {
        alert(signMsg + '成功')
        location.href = signHref
      },
      () => {
        alert(signMsg + '失败')
      })
  })
}

if ($('#registerForm')[0]) {
  sign('#registerForm', '/register', '/sign_in.html', '注册')
  // console.log($('#registerForm')[0])
} else {
  sign('#signInForm', '/sign_in', '/home.html', '登录')
  // console.log($('#signInForm')[0])
}