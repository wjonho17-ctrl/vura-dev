import { flashInertiaError } from '#helpers/toast_notification_helper'
import Product from '#models/product'
import { MedbookAdminApiService } from '#services/medbook_admin_api_service'
import { InsuranceProductInfo } from '#types/insurance_type'
import { createManyProductValidator, createProductValidator, updateProductValidator } from '#validators/product_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { attachmentManager } from '@jrmc/adonis-attachment'
import { errors } from '@vinejs/vine'

@inject()
export default class ProductsController {
    constructor(private medbookApi: MedbookAdminApiService) { }
    async list({ inertia, request }: HttpContext) {
        const { page, perPage, ...input } = request.qs()
        const [products, insurances] = await Promise.all([
            Product.search(input?.brandName || input?.composition || '').paginate(+perPage || 20, +page || 1),
            this.medbookApi.insurances.list()
        ])


        await Promise.all(products.map(p => p.load('insurances')))

        return inertia.render('dashboard/products', { products, insurances })
    }

    async new_product({ inertia }: HttpContext) {
        const insurances = await this.medbookApi.insurances.list()

        return inertia.render('dashboard/new_product', { insurances })
    }

    async edit({ inertia, request }: HttpContext) {
        const id = +request.param('id', -1)

        const [product, insurances] = await Promise.all([
            Product.query().where({ id }).preload('insurances').firstOrFail(),
            this.medbookApi.insurances.list()
        ])

        return inertia.render('dashboard/new_product', { productToEdit: product, insurances })
    }

    async create({ session, request, response }: HttpContext) {
        const { insuranceInfo, insurances, ...payload } = await request.validateUsing(createProductValidator)

        const trx = await db.connection('medbook').transaction()

        try {
            const images = payload.images && await attachmentManager.createFromFiles(payload.images)
            const customInsuranceInfo: InsuranceProductInfo = {
                designation: insuranceInfo.designation || '',
                genericDescription: insuranceInfo.genericDescription || '',
                instructions: insuranceInfo.instructions || '',
                sellingUnit: insuranceInfo.sellingUnit || '',
            }
            const data = { ...payload, fdaForm: payload.dosageForm, fdaStrength: payload.strength, images, insuranceInfo: { data: customInsuranceInfo } }

            const product = await Product.create(data, { client: trx })
            if(insurances) await product.related('insurances').createMany(insurances, { client: trx })
            await trx.commit()

        } catch (error: any) {
            console.error(error)
            await trx.rollback()
            flashInertiaError(session, 'Cannot create product')
        } finally {
            response.redirect().back()
        }
    }

    async update({ response, request, session }: HttpContext) {
        const trx = await db.connection('medbook').transaction()

        try {
            const payload = await request.validateUsing(updateProductValidator)

            const product = await Product.query().where({ id: payload.productId }).preload('insurances').first()

            if (!product) {
                throw { msg: 'Product not found' }
            }

            const productNameExist = await Product.query().where('brandName', payload.brandName).whereNot('id', payload.productId).first()
            if (productNameExist) {
                throw { msg: 'Product with this name already exists' }
            }

            const productInsuranceCodeExist = await Product.query().where('brandName', payload.insuranceDrugCode || '').whereNot('id', payload.productId).first()
            if (payload.insuranceDrugCode && productInsuranceCodeExist) {
                throw { msg: 'Product with this insurance code already exists' }
            }

            const fdaRegNoExist = payload.fdaRegNo && await Product.query().where('fdaRegNo', payload.fdaRegNo).whereNot('id', payload.productId).first()

            if (payload.fdaRegNo && fdaRegNoExist) {
                throw { msg: 'Product with this FDA registration number already exist' }
            }

            const barcodeDoesNotExist = payload.barcode && await Product.query().where('barcode', payload.barcode).whereNot('id', payload.productId).first()

            if (payload.barcode && barcodeDoesNotExist) {
                throw { msg: 'Product with this barcode already exist' }
            }

            const oldImages = product.images?.filter(img => !payload.imagesToRemove?.includes(img.name)) || []
            const newImages = payload.images ? await attachmentManager.createFromFiles(payload.images) : []

            if (oldImages.length + newImages.length > 4) {
                throw { msg: 'You can upload a maximum of 4 images per product' }
            }

            product.images = [...oldImages, ...newImages]

            const { images, productId, imagesToRemove, insuranceInfo, insurances, ...data } = payload

            const customInsuranceInfo: InsuranceProductInfo = {
                designation: insuranceInfo.designation || product.insuranceInfo.data?.designation || '',
                genericDescription: insuranceInfo.genericDescription || product.insuranceInfo.data?.genericDescription || '',
                instructions: insuranceInfo.instructions || product.insuranceInfo.data?.instructions || '',
                sellingUnit: insuranceInfo.sellingUnit || product.insuranceInfo.data?.sellingUnit || '',
            }

            const insuranceTypes = insurances?.map(i => i.type) || []
            const insuranceToRemove = product.insurances.filter(i => !insuranceTypes.includes(i.type))

            await Promise.all([
                product.useTransaction(trx).merge({ ...data, insuranceInfo: { data: customInsuranceInfo } }).save(),
                insuranceToRemove.map(i => i.delete())
            ])

            insurances && insurances?.length > 0 && await product.related('insurances').updateOrCreateMany(insurances, 'type')

            await trx.commit()

            return response.redirect().back()
        } catch (error: any) {
            console.error(error)
            await trx.rollback()
            flashInertiaError(session, error?.msg || 'Cannot update product!')
        }

        return response.redirect().back()
    }

    async create_many({ response, request, session }: HttpContext) {
        try {
            const payload = await request.validateUsing(createManyProductValidator)

            const formatedProducts = payload.products.map(product => ({
                ...product,
                instructions: product.instructions ? { data: product.instructions.split(',') } : { data: [] },
            }))

            await Product.createMany(formatedProducts)

            return response.redirect().back()
        } catch (error: any) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                console.error('Validation Error:', error.messages)
                flashInertiaError(session, error.messages)
            } else {
                flashInertiaError(session, 'Cannot save many products!')
            }
        }

        return response.redirect().back()
    }
}