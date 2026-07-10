import Prescription from '#app/features/prescriptions/prescription'
import type { HttpContext } from '@adonisjs/core/http'
import vine, { errors as vineErros } from '@vinejs/vine'

export default class PrescriptionApisController {
  async search({ request, response }: HttpContext) {
    try {
      const code = request.input('code', '')

      const prescription = await Prescription.findBy({ code })

      if (!prescription) return response.notFound({ error: 'Prescription not found' })

      await Promise.all([prescription?.load('healthFacility'), prescription?.load('practitioner')])
      return prescription

    } catch (error) {
      console.log(error)
      return response.badRequest({ error: 'Cannot search prescription' })
    }
  }

  async sell({ request, response }: HttpContext) {
    try {
      const validator = vine.compile(
        vine.object({
          pharmacy: vine.object({
            time: vine.string(),
            pharmacyName: vine.string(),
            address: vine.string(),
            phone: vine.string(),
            email: vine.string(),
            villageId: vine.number(),
            note: vine.string().optional(),
            branchId: vine.string(),
            branchName: vine.string(),
            servedBy: vine.object({
              name: vine.string(),
              phone: vine.string(),
            }),
            products: vine.array(vine.object({
              name: vine.string(),
              productId: vine.number(),
              quantity: vine.number(),
              expirationDate: vine.string(),
              batchNo: vine.string().nullable(),
              lot: vine.string().nullable(),
            })),
          }),
          prescriptionId: vine.number(),
        })
      )

      const payload = await request.validateUsing(validator)

      const prescription = await Prescription.findOrFail(payload.prescriptionId)

      for (const product of payload.pharmacy.products) {
        const prescriptionInProduct = prescription.products.data.find(p => p.productId === product.productId)

        if (!prescriptionInProduct)

          throw { msg: `Product not found in prescription  with name: ${product.name}.` }

        const isSold = prescription.checkIfProductSold(product.productId, prescriptionInProduct)

        if (isSold) {
          throw { msg: `Product already sold in prescription  with name: ${product.name}.` }
        }

      }

      await Promise.all([
        prescription.load('practitioner'),
        prescription.load('healthFacility'),
        prescription.updateHistory(payload.pharmacy).save()
      ])

      /*
      table.integer('age') //FIXME: add age
      */
      return {
        prescriptionId: prescription.id,
        code: prescription.code,
        patientName: prescription.patientName,
        patientPhone: prescription.patientPhone,
        patientGenre: prescription.patientGenre,
        patientWeight: +prescription.patientWeight,
        treatmentDate: prescription.treatmentDate.toISO(),
        practitioner: {
          firstname: prescription.practitioner.firstname,
          lastname: prescription.practitioner.lastname,
          email: prescription.practitioner.email,
          phone: prescription.practitioner.phone,
          regno: prescription.practitioner.regno
        },
        healthFacility: {
          name: prescription.healthFacility.name,
          villageId: prescription.healthFacility.villageId
        },
        productHistoryStatus: prescription.productsStatus,
      }
    } catch (error) {
      console.error(error)
      if (error instanceof vineErros.E_VALIDATION_ERROR) {
        return response.badRequest(error.messages)
      }

      return response.badRequest(error?.msg || 'Could not update prescription pharmacy info')
    }
  }
}

