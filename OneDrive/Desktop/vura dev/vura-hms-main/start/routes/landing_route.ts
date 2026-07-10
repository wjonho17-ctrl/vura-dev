import router from '@adonisjs/core/services/router'

router.get('/', ({ view }) => {
  return view.render('pages/landing')
})

router.get('/home', ({ view }) => {
  return view.render('pages/landing')
})
