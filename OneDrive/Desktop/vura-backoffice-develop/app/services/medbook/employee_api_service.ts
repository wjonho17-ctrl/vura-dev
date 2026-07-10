import {
  ListEmployeeQs,
  MedbookEmployee,
  MedbookStoreEmployee,
  MedbookStoreEmployeeBody,
} from '#types/api/medbook/employee_type'
import { KyInstance } from 'ky'

export default class EmployeeApiSerivce {
  private path = 'employees'

  constructor(private api: KyInstance) {}

  list(searchParams?: ListEmployeeQs) {
    return this.api.get<ListEmployeeQs>(this.path, { searchParams }).json<MedbookEmployee>()
  }

  store(body: MedbookStoreEmployeeBody) {
    return this.api.post(this.path, { body: JSON.stringify(body) }).json<MedbookStoreEmployee>()
  }
}
