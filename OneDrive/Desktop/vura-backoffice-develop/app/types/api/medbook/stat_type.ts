type MedbookStatResponse = {
  label: string
  total: number
  amount: number
  icon?: string
  color?: string
}

export type MedbookProductOverviewResponse = {
  wholesaler: { data: MedbookOverviewStockResponse[], meta: any },
  retailer: { data: MedbookOverviewStockResponse[], meta: any }
}

export type MedbookOverviewStockResponse = {
  pharmacy: {
    name: string
    logo: string | null
  },
  product: {
    name: string
    quantity: number
  },
  address: string,
  name: string,
  phone: string,
  phoneTwo: string
}

export type MedbookOverviewStatsResponse = {
  pharmacies: MedbookStatResponse[]
  orders: {
    inProgress: MedbookStatResponse
    completed: MedbookStatResponse
    transporter: MedbookStatResponse
    selfPickup: MedbookStatResponse
  };
  products: {
    wholesaler: {
      name: string
      productId: number
      quantity: number
    }[],
    retailer: {
      name: string
      productId: number
      quantity: number
    }[]
  }
}

export type MedbookGlobalBasicStatsResponse = {

  users: {
    all: {
      label: string
      total: number
      icon?: string
    }
    pharmacist: {
      label: string
      total: number
      icon?: string
    }
    transporter: {
      label: string
      total: number
      icon?: string
    }
    employees: {
      label: string
      total: number
      icon?: string
    }
  }
  top5Products: {
    wholesaler: {
      name: string
      total: number
      amount: number
      performance: number
    }[]
    retailer: {
      name: string
      total: number
      amount: number
      performance: number
    }[]
  }
  revenue: {
    labels: string[]
    datasets: {
      label: string
      backgroundColor: string
      data: number[]
      type?: string
      barThickness?: string
    }[]
  }
}