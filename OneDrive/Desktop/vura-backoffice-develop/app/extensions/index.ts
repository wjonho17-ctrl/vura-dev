import { Request } from '@adonisjs/core/http'

Request.getter('isTuyau', function (this: Request) {
  return this.header('X-TUYAU')
})

declare module '@adonisjs/core/http' {
  interface Request {
    isTuyau: string | undefined
  }
}
