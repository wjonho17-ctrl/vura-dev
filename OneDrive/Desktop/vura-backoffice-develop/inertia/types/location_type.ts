export interface Location {
    id: number
    name: string
    longitude: number
    latitude: number
}
export type LocationType = 'province' | 'district' | 'sector' | 'cell' | 'village' 
