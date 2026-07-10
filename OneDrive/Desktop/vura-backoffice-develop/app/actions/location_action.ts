import Cell from "#models/cell"
import District from "#models/district"
import Province from "#models/province"
import Sector from "#models/sector"
import Village from "#models/village"

export type LocationData = {
    name: string
    longitude: number
    latitude: number
}

export default class LocationAction {
    static async createProvince(data: LocationData) {
        const province = await Province.findBy({ name: data.name })
        if (province) throw { msg: `${data.name} already exist as province` }
        return Province.create(data)
    }

    static async createDistrict(provinceId: number, data: LocationData) {
        const [province, district] = await Promise.all([
            Province.findOrFail(provinceId),
            District.findBy({ name: data.name })
        ])

        if (district) throw { msg: data.name + 'already exist as district in ' + province.name }

        return province.related('districts').create(data)
    }

    static async createSector(districtId: number, data: LocationData) {
        const [district, sector] = await Promise.all([
            District.findOrFail(districtId),
            Sector.findBy({ name: data.name })
        ])

        if (sector) throw { msg: data.name + 'already exist as sector in' + district.name }
        return district.related('sectors').create(data)
    }

    static async createCell(sectorId: number, data: LocationData) {
        const [sector, cell] = await Promise.all([
            Sector.findOrFail(sectorId),
            Cell.findBy({ name: data.name })
        ])


        if (cell) throw { msg: data.name + 'already exist as village in ' + cell.name }
        return sector.related('cells').create(data)
    }

    static async createVillage(cellId: number, data: LocationData) {
        const [cell, village] = await Promise.all([
            Cell.findOrFail(cellId),
            Village.findBy({ name: data.name })
        ])

        if (village) throw { msg: data.name + 'already exist as village in ' + village.name }

        return cell.related('villages').create(data)
    }

    static async findOneBy({
        provinceId, districtId
    }: { provinceId: number | undefined, districtId: number | undefined }) {
        const [province, district] = await Promise.all([
            provinceId && Province.find(provinceId),
            provinceId && districtId && districtId && District.findBy({
                id: districtId, provinceId: provinceId
            })
        ])

        return Promise.resolve({ province: province || null, district: district || null })
    }

    static async findAllBy({
        provinceId
    }: { provinceId: number | undefined }) {
        const [provinces, districts] = await Promise.all([
            Province.all(),
            provinceId ? District.query().where({ provinceId: provinceId || 1 }) : []
        ])

        return Promise.resolve({ provinces, districts })
    }
}