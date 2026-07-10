import env from '#start/env'
import { chromium } from 'playwright-core'
export const PLAYWRIGHT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'

export async function createBroswerPageInstance() {
    const browser = await chromium.connectOverCDP(`${env.get('BROWESERLESS_LINK')}/?token=${env.get('BROWESERLESS_TOKEN')}`)
    const context = await browser.newContext({ userAgent: PLAYWRIGHT_USER_AGENT })
    const page = await context.newPage()

    return Promise.resolve({ browser, page })
}
