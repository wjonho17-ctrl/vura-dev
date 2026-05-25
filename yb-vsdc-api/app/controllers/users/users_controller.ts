import { StockAction } from '#actions/stock_action'
import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import { isDevOrSandboxEnv } from '#helpers/index'
import { createBroswerPageInstance } from '#helpers/scrapping_helper'
import ClassificationCode from '#models/classification_code'
import User from '#models/user'
import Admin from '#models/admin'
import { EbmCustomerService } from '#services/ebm/ebm_customer_service'
import { EbmInitService } from '#services/ebm/ebm_init_service'
import env from '#start/env'
import { EbmApiResponseCode } from '#types/ebm/ebm_type'
import { userEditValidator, userPurchaseCodeValidator } from '#validators/users/user_validator'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { attachmentManager } from '@jrmc/adonis-attachment'

export default class UsersController extends CatchEbmAndAllError {
  async init({ response, auth }: HttpContext) {
    const user = auth.user as User | Admin
    const branchId = ('branchId' in user && user.branchId) ? user.branchId : '00'

    try {
      const result = await new EbmInitService().InitilizeDevice({
        tin: user.tin,
        branchId: branchId,
        deviceSerialNo: app.inDev ? env.get('ADMIN_SERIAL_NO') : user.serialNo,
      })

      if (
        result.resultCd === EbmApiResponseCode.ServerSucceeded ||
        result.resultCd === EbmApiResponseCode.ServerDeviceInstalled
      ) {
        if (user instanceof User) {
          if (result.data?.sdcId) user.sdcId = result.data.sdcId
          if (result.data?.mrc)   user.mrc   = result.data.mrc
          user.initLastReqDt = result.resultDt
          await user.save()
          await StockAction.syncItems(user)
        }
      } else {
        throw result
      }

      return result
    } catch (error) {
      console.error(error)

      return response.badRequest({ error })
    }
  }

  async customer_find({ request, response, auth }: HttpContext) {
    try {
      const customerTin = request.input('customer_tin')
      const branchId = request.param('branchId')

      const user = auth.user as User | Admin
      const branchIdForFind = 'branchId' in user ? user.branchId : branchId

      return await new EbmCustomerService().selectCustumer({
        tin: user.tin,
        branchId: branchIdForFind,
        customerTin,
      })

    } catch (error) {
      console.log(error)

      return response.badRequest(error)
    }
  }

  async items_classification({ response }: HttpContext) {
    try {
      const codes = await ClassificationCode.query().orderBy('level', 'asc').orderBy('name', 'asc').exec()
      
      const categorized: Record<string, any[]> = {}
      codes.forEach(c => {
        const key = `Level ${c.level}`
        if (!categorized[key]) categorized[key] = []
        categorized[key].push(c)
      })

      return categorized
    } catch (error) {
      this.catchErrors(response, error)
    }
  }

  async edit({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(userEditValidator)

    try {
      const user = auth.user as User

      if (payload.image) {
        user.image = await attachmentManager.createFromFile(payload.image)
        user.imageLink = ''
      } else if (payload.imageLink) {
        user.imageLink = payload.imageLink
        user.image = null
      }

      user.phoneNumberTwo = payload.phoneNumberTwo
      user.serialNo = payload.serialNo || user.serialNo
      user.mrc = payload.mrc || user.mrc

      return await user.save()
    } catch (error) {
      console.log(error)
      return { error: 'Cannot edit user' }
    }
  }

  async updateMrc({ request, auth }: HttpContext) {
    const user = auth.user as User
    const mrc = request.input('mrc')
    if (!mrc) throw new Error('MRC is required')
    
    user.mrc = mrc
    await user.save()
    return { message: 'MRC updated successfully', mrc: user.mrc }
  }

  async purchase_code({ request, response }: HttpContext) {
    const payload = await request.validateUsing(userPurchaseCodeValidator)

    const { page, browser } = await createBroswerPageInstance()

    try {
      await page.goto(
        isDevOrSandboxEnv() ? env.get('MY_RRA_PURCHASE_CODE_DEV') : env.get('MY_RRA_PURCHASE_CODE')
      )

      await page.waitForLoadState('domcontentloaded')

      const getPurchaseBtn = await page.waitForSelector('[id=onlinePurchaseCode_P_D_B_update]')

      //fill inputs
      await page.locator('[name=buyerTel]').fill(payload.buyerTel)
      await page.locator('[name=buyerTin]').fill(payload.buyerTin)
      await page.locator('[name=sellerTin]').fill(payload.sellerTin)

      await getPurchaseBtn.click()

      //check errors
      const buyerTelError = page.getByText('* Invalid mobile number. (ex.')
      const tinError = page.getByText('* Invalid TIN. (ex.1XXXXXXXX')

      const inuptErrors = []
      if (buyerTelError && (await buyerTelError.isVisible())) {
        inuptErrors.push(await buyerTelError.innerText())
      }

      if (tinError && tinError.first() && (await tinError.first().isVisible())) {
        inuptErrors.push('Buyer Tin Invalid')
      }

      if (tinError && tinError.nth(1) && (await tinError.nth(1).isVisible())) {
        inuptErrors.push('Seller Tin Invalid')
      }

      if (inuptErrors.length > 0) {
        const error = new Error()
        error.message = inuptErrors.join(';')
        throw error
      }

      await page.getByRole('button', { name: 'Yes' }).click()

      const successMsg = page.getByText('code has been generated')
      await successMsg.waitFor({ timeout: 1000 * 30 })

      return { msg: await successMsg.innerText() }
    } catch (error) {
      console.log({ error })
      if ('message' in error && error.message.includes('code has been generated')) {
        const message = `Dear Taxpayer, your TIN : ${payload.buyerTin} does not match with this phone no: ${payload.buyerTel} Please try again`
        return response.badRequest({ error: message })
      }

      return response.badRequest({ error })
    } finally {
      console.log('close bwr')
      await browser.close()
    }
  }


  async info({ auth }: HttpContext) {
    return auth.user
  }
}
