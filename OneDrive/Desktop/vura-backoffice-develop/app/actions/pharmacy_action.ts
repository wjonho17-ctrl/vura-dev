import { MedbookUserRoles } from '#enums/user_role';
import Pharmacist from '#models/pharmacist';
import { createPharmacyValidator } from "#validators/pharmacy_validator";
import stringHelpers from '@adonisjs/core/helpers/string';
import { attachmentManager } from '@jrmc/adonis-attachment';
import { Infer } from "@vinejs/vine/types";
import db from '@adonisjs/lucid/services/db'


export class PharmacyAction {
    static async create(payload: Infer<typeof createPharmacyValidator>) {
        return db.connection('medbook').transaction(async (trx) => {

            const roleId = payload.isWholeseller ? MedbookUserRoles.WHOLESELER : MedbookUserRoles.PHARMACIST

            const [logo, fdaLicense, pharmacyLicense] = await Promise.all([
                payload.logo && attachmentManager.createFromFile(payload.logo),
                attachmentManager.createFromFile(payload.profile.fdaLiscense),
                attachmentManager.createFromFile(payload.profile.pharmacistLiscense),
            ])

            const owner = await Pharmacist.create({
                roleId,
                password: stringHelpers.generateRandom(16),
                phone: payload.profile.phone,
                email: payload.profile.email
            }, { client: trx })

            const [pharmacy, pharmacistProfile] = await Promise.all([
                owner.related('pharmacy').create({
                    logo,
                    email: payload.email,
                    isWholeseller: payload.isWholeseller,
                    name: payload.name,
                    phoneNumber: payload.phoneNumber,
                    phoneNumberTwo: payload.phoneNumberTwo,
                    tin: payload.tin,
                    postalBox: payload.postalBox
                }),

                owner.related('pharmacistProfile').create({
                    fdaLicense,
                    pharmacyLicense
                }),

                owner.related('profile').create({
                    gender: payload.profile.gender,
                    lastname: payload.profile.lastname,
                    firstname: payload.profile.firstname,
                }),


            ])

            const branch = await pharmacy.useTransaction(trx).related('branches').create({
                isMain: true,
                email: payload.email,
                latitude: payload.branch.latitude,
                longitude: payload.branch.longitude,
                name: 'Headquater',
                phoneNumber: payload.phoneNumber,
                phoneNumberTwo: payload.phoneNumberTwo,
                villageId: payload.branch.villageId,
                postalBox: payload.postalBox
            })

            await pharmacistProfile.related('currentBranch').associate(branch)

            return Promise.resolve(pharmacy)
        })

    }
}