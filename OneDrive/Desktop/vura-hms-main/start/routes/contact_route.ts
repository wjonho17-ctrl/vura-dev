import router from '@adonisjs/core/services/router'


const ContactUsController = () => import('#app/features/facilities/contact_uses_controller')


router
  .group(() => {
    router.post('/contact-us', [ContactUsController, 'send']).as('send')
  })
  .as('contact-us')