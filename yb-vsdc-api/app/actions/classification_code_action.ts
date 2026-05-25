import Admin from "#models/admin";
import ClassificationCode from "#models/classification_code";
import { EbmItemService } from "#services/ebm/ebm_item_service";
import env from "#start/env";
import { EbmApiResponseCode, EbmItemClassification } from "#types/ebm/ebm_type";
import { Meilisearch } from "meilisearch";

const client = new Meilisearch({
  host: env.get('MEILISEARCH_HOST'),
  apiKey: env.get('MEILISEARCH_API_KEY'),
});

export const MEILLISEARCH_PURCHASE_INDEX = 'classification_codes'

export default class ClassificationCodeAction {
  static async sync(admin: Admin) {
    let count = 0

    const response = await new EbmItemService().selectItemClass({
      branchId: "00",
      tin: admin.tin,
      lastRequestDt: admin.classificationLastReqDt || '20180101000000',
    })

    if (response.resultCd != EbmApiResponseCode.ServerSucceeded && response.resultCd != EbmApiResponseCode.NoSearchResult) {
      throw response.resultMsg
    }

    if (response.resultCd == EbmApiResponseCode.ServerSucceeded) {

      const items = this.formatItemClassifcationFromEbm(response.data.itemClsList)

      await ClassificationCode.updateOrCreateMany('code', items)

      count = items.length
    }

    await admin.merge({ classificationLastReqDt: response.resultDt }).save()

    return Promise.resolve(count)
  }

  static async search(query: string | undefined) {
    const index = client.index(MEILLISEARCH_PURCHASE_INDEX)
    const result = await index.search(query)
    const classificationCodes = result.hits.map((hit) => ({
      name: hit.name,
      code: hit.code,
      taxType: hit.taxType,
      used: hit.used
    }))

    return Promise.resolve(classificationCodes)
  }

  static formatItemClassifcationFromEbm(items: EbmItemClassification[]) {
    return items.map((item) => ({
      id: +item.itemClsCd,
      name: item.itemClsNm,
      code: item.itemClsCd,
      level: item.itemClsLvl,
      isMajorTarget: item.mjrTgYn,
      taxType: item.taxTyCd,
      used: item.useYn
    }))
  }
}