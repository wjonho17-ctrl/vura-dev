import { ProductClassification } from '#enums/product_enum'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const connection = 'medbook'
const table = 'products'

export const createProductValidator = vine.compile(
  vine.object({
    brandName: vine.string().trim().minLength(2).maxLength(255).unique({ table, column: 'brand_name', connection }),
    classification: vine.enum(ProductClassification),
    images: vine.array(vine.file({ extnames: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG'], size: '5mb' })).maxLength(4).nullable(),

    // Optional / Nullable fields
    composition: vine.string().optional(),
    strength: vine.string().optional(),
    dosageForm: vine.string().optional(),
    barcode: vine.string().trim().unique({ table, column: 'barcode', connection }).optional(),

    // FDA Fields
    fdaRegNo: vine.string().trim().unique({ table, column: 'fda_reg_no', connection }).optional(),
    fdaStrength: vine.string().trim().optional(),
    fdaForm: vine.string().trim().optional(),
    fdaPack: vine.string().trim().optional(),
    fdaShelfLife: vine.string().trim().optional(),
    fdaManufacturer: vine.string().trim().optional(),
    fdaCountry: vine.string().trim().optional(),
    fdaMah: vine.string().trim().optional(),
    fdaLtr: vine.string().trim().optional(),

    // Date validation for Luxon fields
    fdaRegDate: vine.date({ formats: ['iso8601'] }).optional().transform<DateTime>(v => DateTime.fromJSDate(v)),
    fdaExpiry: vine.date({ formats: ['iso8601'] }).optional().transform<DateTime>(v => DateTime.fromJSDate(v)),

    //FIXME: check validation
    // Insurance & EBM
    insuranceDrugCode: vine.string().trim().unique({ table, connection, column: 'insurance_drug_code' }).optional(),
    insuranceInfo: vine.object({
      instructions: vine.string().trim().optional(),
      genericDescription: vine.string().trim().optional(),
      designation: vine.string().trim().optional(),
      sellingUnit: vine.string().trim().optional(),
    }),

    insurances: vine.array(vine.object({
      type: vine.number(),
      price: vine.number().min(0).max(99_9999_999)
    })).optional(),

    instructions: vine.object({ data: vine.array(vine.string()) }).optional()
  })
)

export const updateProductValidator = vine.compile(
  vine.object({
    productId: vine.number().min(1),
    imagesToRemove: vine.array(vine.string().trim()).optional(),
    brandName: vine.string().trim().minLength(2).maxLength(255),
    classification: vine.enum(ProductClassification),
    images: vine.array(vine.file({ extnames: ['png', 'PNG', 'jpg', 'JPG', 'jpeg', 'JPEG'], size: '5mb' })).maxLength(4).nullable(),

    // Optional / Nullable fields
    composition: vine.string().optional(),
    strength: vine.string().optional(),
    dosageForm: vine.string().optional(),
    barcode: vine.string().optional(),

    // FDA Fields
    fdaRegNo: vine.string().trim().optional(),
    fdaStrength: vine.string().trim().optional(),
    fdaForm: vine.string().trim().optional(),
    fdaPack: vine.string().trim().optional(),
    fdaShelfLife: vine.string().trim().optional(),
    fdaManufacturer: vine.string().trim().optional(),
    fdaCountry: vine.string().trim().optional(),
    fdaMah: vine.string().trim().optional(),
    fdaLtr: vine.string().trim().optional(),

    // Date validation for Luxon fields
    fdaRegDate: vine.date({ formats: ['iso8601'] }).optional().transform<DateTime>(v => DateTime.fromJSDate(v)),
    fdaExpiry: vine.date({ formats: ['iso8601'] }).optional().transform<DateTime>(v => DateTime.fromJSDate(v)),

    //FIXME: check validation
    // Insurance & EBM
    insuranceDrugCode: vine.string().trim().optional(),
    insuranceInfo: vine.object({
      instructions: vine.string().trim().optional(),
      genericDescription: vine.string().trim().optional(),
      designation: vine.string().trim().optional(),
      sellingUnit: vine.string().trim().optional(),
    }),

    insurances: vine.array(vine.object({
      type: vine.number(),
      price: vine.number().min(0).max(99_9999_999)
    })).optional(),

    ebmClassification: vine.string().trim().optional()
  })
)

export const createManyProductValidator = vine.compile(
  vine.object({
    products: vine.array(vine.object({
      brandName: vine.string().trim().minLength(2).maxLength(255).unique({ table, column: 'brand_name', connection }),
      classification: vine.enum(ProductClassification),

      // Optional / Nullable fields
      composition: vine.string().optional(),
      strength: vine.string().optional(),
      dosageForm: vine.string().optional(),

      // FDA Fields
      fdaRegNo: vine.string().trim().unique({ table, column: 'fda_reg_no', connection }).optional(),
      fdaStrength: vine.string().trim().optional(),
      fdaForm: vine.string().trim().optional(),
      fdaPack: vine.string().trim().optional(),
      fdaShelfLife: vine.string().trim().optional(),
      fdaManufacturer: vine.string().trim().optional(),
      fdaCountry: vine.string().trim().optional(),
      fdaMah: vine.string().trim().optional(),
      fdaLtr: vine.string().trim().optional(),

      // Date validation for Luxon fields
      fdaRegDate: vine.date({ formats: ['iso8601'] }).optional().transform<DateTime>(v => DateTime.fromJSDate(v)),
      fdaExpiry: vine.date({ formats: ['iso8601'] }).optional().transform<DateTime>(v => DateTime.fromJSDate(v)),

      // Insurance & EBM
      insuranceCode: vine.string().trim().optional(),
      insurancePrice: vine.number().min(0).max(99_999_999).optional(),
      ebmClassification: vine.string().trim().optional(),

      /**
       * Medical Instructions (Practitioner Scope)
       * Validates the JSON structure { data: [...] }
       */
      instructions: vine.string().optional()
    }))
  })
)
