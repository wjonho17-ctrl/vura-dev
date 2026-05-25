import env from '#start/env'
import {
  EbmEndpoint,
  EbmLastRequestDateTime,
  ItemCodeEbmOptions,
  EbmSelectRequest,
} from '#types/ebm/ebm_service_type'
import { EbmDefaultResponse } from '#types/ebm/ebm_type'
import Admin from '#models/admin'
import User from '#models/user'
import ky, { KyInstance } from 'ky'
import app from '@adonisjs/core/services/app'

const DEV_MOCK_RESPONSES: Partial<Record<EbmEndpoint, object>> = {
  [EbmEndpoint.SelectInitInfo]: {
    resultCd: '902',
    resultMsg: 'It is succeeded',
    resultDt: '20260101000000',
    data: {
      info: {
        tin: '999909100', taxprNm: 'TEST VSDC', bsnsActv: 'TESTING',
        bhfId: '00', bhfNm: 'Headquarter', bhfOpenDt: '20210214',
        prvncNm: 'KIGALI CITY', dstrtNm: 'GASABO', sctrNm: 'REMERA',
        locDesc: 'KG 100 St', hqYn: 'Y', mgrNm: 'Test Manager',
        mgrTelNo: '0780000000', mgrEmail: 'manager@test.com',
        sdcId: 'SDC010000001', mrcNo: 'MRC0000001',
        dvcId: 'DVCTEST0000001',
        lastPchsInvcNo: 0, lastSaleRcptNo: 0,
        lastInvcNo: 0, lastSaleInvcNo: 0,
        lastTrainInvcNo: 0, lastProfrmInvcNo: 0, lastCopyInvcNo: 0,
      },
    },
  },
  [EbmEndpoint.saveStockItems]: { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveStock]:      { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveStockMaster]:{ resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveSales]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000',
    data: {
      rcptNo: 1, intrlData: 'DEVMOCKINTRLDATA001', rcptSign: 'DEVMOCKSIGN001',
      totRcptNo: 1, vsdcRcptPbctDate: '20260101000000',
      sdcId: 'SDC010000001', mrcNo: 'MRC0000001',
    },
  },
  [EbmEndpoint.savePurchases]:       { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveBranchCustomers]: { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveBranchUsers]:     { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveBranchInsurances]:{ resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.updateImportItems]:   { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectItems]:              { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectStockItems]:         { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectImportItems]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260331000000',
    data: {
      itemList: [{
        taskCd: 'TASK001', dclDe: '20260331', itemSeq: 1,
        dclNo: 'DCL202603310001', hsCd: '2201100000',
        itemNm: 'Mineral Water Import Batch',
        imptItemsttsCd: '2',
        orgnNatCd: 'KE', exptNatCd: 'KE',
        pkg: 100, pkgUnitCd: 'BQ',
        qty: 1000, qtyUnitCd: 'KGM',
        totWt: 500, netWt: 450,
        spplrNm: 'Kenya Beverages Ltd', agntNm: 'RW Clearing Agent',
        invcFcurAmt: 800, invcFcurCd: 'USD', invcFcurExcrt: 1300,
      }],
    },
  },
  [EbmEndpoint.selectTrnsPurchaseSales]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260331000000',
    data: {
      saleList: [{
        spplrTin: '999909100', spplrNm: 'TEST VSDC', spplrBhfId: '00',
        spplrInvcNo: 2, spplrSdcId: 'SDC010000001', spplrMrcNo: 'MRC0000001',
        prcOrdCd: 'ABC001', rcptTyCd: 'P', pmtTyCd: '02',
        cfmDt: '2026-03-31 11:00:00', salesDt: '20260331',
        stockRlsDt: '2026-03-31 11:00:00',
        totItemCnt: 1,
        taxblAmtA: 0, taxblAmtB: 2000, taxblAmtC: 0, taxblAmtD: 0,
        taxRtA: 0, taxRtB: 18, taxRtC: 0, taxRtD: 0,
        taxAmtA: 0, taxAmtB: 0, taxAmtC: 0, taxAmtD: 0,
        totTaxblAmt: 2000, totTaxAmt: 0, totAmt: 2000,
        itemList: [{
          itemSeq: 1, itemCd: 'RW3NTKGM0000003', itemClsCd: '5020230301',
          itemNm: 'Delivery Service', pkgUnitCd: 'NT', pkg: 1,
          qtyUnitCd: 'KGM', qty: 1, prc: 2000, splyAmt: 2000,
          dcRt: 0, dcAmt: 0, taxTyCd: 'B', taxblAmt: 2000, taxAmt: 0, totAmt: 2000,
        }],
      }],
    },
  },
  [EbmEndpoint.selectBranchUsers]:        { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectBranchInsurances]:   { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectItemsClass]:  { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectCodes]:       { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectNotices]:  { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectCustomer]: { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectBranches]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000',
    data: {
      bhfList: [
        {
          tin: '999909100', bhfId: '00', bhfNm: 'Headquarter', bhfSttsCd: 'A',
          prvncNm: 'KIGALI CITY', dstrtNm: 'GASABO', sctrNm: 'REMERA',
          locDesc: 'KG 100 St', hqYn: 'Y',
          mgrNm: 'Test Manager', mgrTelNo: '0780000000', mgrEmail: 'manager@test.com',
        },
      ],
    },
  },
}

export interface EbmHeaders {
  tin?: string | number
  bhfId?: string
  dvcSrlNo?: string
}

export class EbmService {
  private baseUrl = env.get('EBM_BASE_URL')
  protected client: KyInstance
  private static instance: KyInstance | null = null
  protected user?: User | Admin

  constructor(user?: User | Admin) {
    this.user = user
    this.client = EbmService.instance || this.createClient()
  }

  private createClient() {
    return ky.create({
      prefixUrl: this.baseUrl,
      retry: 3,
      timeout: 1000 * 150,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  public generateItemCode(options: ItemCodeEbmOptions) {
    let lastIncrementCode = ''

    if (!options.lastItemCode) {
      lastIncrementCode = '0000001'
    } else {
      const itemCodeMatch = options.lastItemCode.slice(-7)

      const lastCodePart = (parseInt(itemCodeMatch, 10) + 1).toString()

      for (let i = 0; i < 7 - lastCodePart.length; i++) {
        lastIncrementCode += '0'
      }

      lastIncrementCode += lastCodePart
    }

    return (
      options.itemCode.countryCode +
      options.itemCode.productType +
      options.itemCode.packingUnit +
      options.itemCode.quantityUnit +
      lastIncrementCode
    )
  }

  public generateLastReqDt(options: EbmLastRequestDateTime) {
    options.year = options.year || '2018'
    options.month = options.month || '05'
    options.day = options.day || '20'
    options.hour = options.hour || '00'
    options.minute = options.minute || '00'
    options.second = options.second || '00'

    const newOptions = this.serializeLastReqDtAttribute(options)

    return (
      newOptions.year +
      newOptions.month +
      newOptions.day +
      newOptions.hour +
      newOptions.minute +
      newOptions.second
    )
  }

  private serializeLastReqDtAttribute(options: EbmLastRequestDateTime) {
    let newOptions: any = { year: options.year }

    for (const key of Object.keys(options)) {
      if (key === 'year') continue
      const value = options[key as 'month']
      newOptions[key as 'month'] = value?.length == 2 ? value : '0' + value
    }

    return {
      year: newOptions.year,
      month: newOptions.month,
      day: newOptions.day,
      hour: newOptions.hour,
      minute: newOptions.minute,
      second: newOptions.second,
    }
  }

  protected async selectEbmData<T>(
    endpoint: EbmEndpoint,
    options: EbmSelectRequest
  ) {
    const body = this.convertSelectEbmDataOptionToEbmProps(options)
    const headers: EbmHeaders = {
      tin: options.tin,
      bhfId: options.branchId,
    }
    return this.postEbmData<T>(endpoint, body, headers)
  }

  protected async postEbmData<T>(endpoint: EbmEndpoint, body: string, overrides?: EbmHeaders) {
    console.log(`[EBM REQ] ${endpoint}`, body)

    if (app.inDev && DEV_MOCK_RESPONSES[endpoint] !== undefined) {
      const mock = DEV_MOCK_RESPONSES[endpoint] as EbmDefaultResponse & T
      console.log(`[EBM DEV MOCK] ${endpoint}`, mock)
      return mock
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (overrides) {
      if (overrides.tin) headers['tin'] = String(overrides.tin)
      if (overrides.bhfId) headers['bhfId'] = String(overrides.bhfId)
      if (overrides.dvcSrlNo) headers['dvcSrlNo'] = String(overrides.dvcSrlNo)
    }

    if (this.user) {
      if (!headers['tin'] && this.user.tin) headers['tin'] = String(this.user.tin)
      if (!headers['bhfId']) headers['bhfId'] = String(this.user.branchId || '00')
      if (!headers['dvcSrlNo'] && this.user.serialNo) headers['dvcSrlNo'] = String(this.user.serialNo)
    }

    try {
      const res = await this.client.post(endpoint, { body, headers })
      const data = await res.json<EbmDefaultResponse & T>()
      console.log(`[EBM RES] ${endpoint}`, data)
      return data
    } catch (error) {
      console.error(`[EBM ERR] ${endpoint}`, error)
      throw error
    }
  }

  protected convertSelectEbmDataOptionToEbmProps(options: EbmSelectRequest) {
    return JSON.stringify({
      tin: String(options.tin || this.user?.tin),
      bhfId: String(options.branchId || this.user?.branchId || '00'),
      lastReqDt: options.lastRequestDt,
    })
  }
}
