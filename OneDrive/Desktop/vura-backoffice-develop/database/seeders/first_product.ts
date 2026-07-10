import { ProductClassification } from '#enums/product_enum'
import Product from '#models/product'
import User from '#models/user'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
    static environment = ['production']

    async run() {
        // Write your database queries inside the run method
        await Product.create({
            brandName: 'Paracetamol 500mg Tablets',
            composition: 'Paracetamol',
            classification: ProductClassification.HumanMedicine
        })
    }
}
