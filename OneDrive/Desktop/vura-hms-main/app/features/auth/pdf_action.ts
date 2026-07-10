import { createBroswerPageInstance } from "#app/shared/helpers/scrapper"

export default class PdfAction {
  static async generateFromHTML(html: string, path: string): Promise<any> {
    const format = 'A4'
    const {page, browser} = await createBroswerPageInstance()
    await page.setContent(html)
    const pdf = await page.pdf({path, format})

    await browser.close()
    return Promise.resolve(pdf)
  }
}

