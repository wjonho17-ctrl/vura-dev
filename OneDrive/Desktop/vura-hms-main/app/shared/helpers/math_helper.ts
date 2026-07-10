import { randomBytes, randomInt } from 'node:crypto'

export function getRandomMinMax(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getMinMax(nbr: number, min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(nbr * (max - min + 1)) + min
}

export function calculateDiscountedPrice(amount: number, discountRate: number) {
  const discount = amount * (discountRate / 100)
  const finalAmount = (amount - discount).toFixed(2)
  return Number.parseFloat(finalAmount)
}

export function generateRandomHex(length: number) {
  return randomBytes(length).toString('hex').toUpperCase()
}
export function generateRandomInt(length: number) {
  let min = ''
  let max = ''
  for (let i = 1; i <= length; i++) {
    min += '1'
    max += '9'
  }

  return randomInt(+min, +max)
}

export function calculateDistanceBetweenTwoCoordinates(
  { lat1, lon1 }: { lat1: number; lon1: number },
  { lat2, lon2 }: { lat2: number; lon2: number }
) {
  const R = 6371e3 // metres
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const d = R * c
  return d
}

export function formatDistanceInKmAndMeter(distanceInMeters: number) {
  const km = Number.parseFloat((distanceInMeters / 1000).toFixed(1))

  if (km < 0.1) {
    return `${Math.round(distanceInMeters)} m`
  } else {
    const formatted = km % 1 === 0 ? km : km.toFixed(1)
    return `${formatted} km`
  }
}
