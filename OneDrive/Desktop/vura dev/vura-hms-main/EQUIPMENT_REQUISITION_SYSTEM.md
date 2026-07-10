# HMS - Equipment Requisition System

**Based on PMS Order Protocol** - Allows any user to add equipment requisitions, admins to approve and send

---

## 🏗️ System Architecture

### Database Schema

#### 1. Equipment Requisition Groups (requisition_groups)
```sql
CREATE TABLE requisition_groups (
  id UUID PRIMARY KEY,
  health_center_id UUID NOT NULL REFERENCES health_centers(id),
  created_by_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### 2. Equipment Requisitions (equipment_requisitions)
```sql
CREATE TABLE equipment_requisitions (
  id UUID PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES requisition_groups(id),
  health_center_id UUID NOT NULL REFERENCES health_centers(id),
  created_by_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_health_center_id ON equipment_requisitions(health_center_id);
CREATE INDEX idx_status ON equipment_requisitions(status);
CREATE INDEX idx_created_by_id ON equipment_requisitions(created_by_id);
```

#### 3. Requisition Items (requisition_items)
```sql
CREATE TABLE requisition_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  requisition_id UUID NOT NULL REFERENCES equipment_requisitions(id),
  equipment_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  category VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'normal',
  specification TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_requisition_id ON requisition_items(requisition_id);
```

#### 4. Requisition History (requisition_history)
```sql
CREATE TABLE requisition_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  requisition_id UUID NOT NULL REFERENCES equipment_requisitions(id),
  status VARCHAR(50),
  changed_by_id UUID REFERENCES users(id),
  remarks TEXT,
  changed_at TIMESTAMP DEFAULT now()
);
```

---

## 📊 Lucid Models

### RequisitionGroup Model
```typescript
// app/models/requisition_group.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, BelongsTo, HasMany } from '@adonisjs/lucid/orm'
import HealthCenter from './health_center.js'
import User from './user.js'
import EquipmentRequisition from './equipment_requisition.js'

export default class RequisitionGroup extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare healthCenterId: string

  @column()
  declare createdById: string

  @column()
  declare status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => HealthCenter)
  declare healthCenter: BelongsTo<typeof HealthCenter>

  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  @hasMany(() => EquipmentRequisition)
  declare requisitions: HasMany<typeof EquipmentRequisition>
}
```

### EquipmentRequisition Model
```typescript
// app/models/equipment_requisition.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, BelongsTo, HasMany } from '@adonisjs/lucid/orm'
import HealthCenter from './health_center.js'
import User from './user.js'
import RequisitionGroup from './requisition_group.js'
import RequisitionItem from './requisition_item.js'
import RequisitionHistory from './requisition_history.js'

export default class EquipmentRequisition extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare groupId: string

  @column()
  declare healthCenterId: string

  @column()
  declare createdById: string

  @column()
  declare status: 'pending' | 'approved' | 'rejected' | 'sent' | 'received'

  @column()
  declare totalAmount: number

  @column()
  declare remarks: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => RequisitionGroup)
  declare group: BelongsTo<typeof RequisitionGroup>

  @belongsTo(() => HealthCenter)
  declare healthCenter: BelongsTo<typeof HealthCenter>

  @belongsTo(() => User, { foreignKey: 'createdById' })
  declare createdBy: BelongsTo<typeof User>

  @hasMany(() => RequisitionItem)
  declare items: HasMany<typeof RequisitionItem>

  @hasMany(() => RequisitionHistory)
  declare history: HasMany<typeof RequisitionHistory>

  async updateHistory(data: { status: string; changedById: string; remarks?: string }) {
    await this.related('history').create(data)
  }
}
```

### RequisitionItem Model
```typescript
// app/models/requisition_item.ts
import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm'
import EquipmentRequisition from './equipment_requisition.js'

export default class RequisitionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requisitionId: string

  @column()
  declare equipmentName: string

  @column()
  declare quantity: number

  @column()
  declare unitPrice: number

  @column()
  declare totalPrice: number

  @column()
  declare category: string

  @column()
  declare priority: 'low' | 'normal' | 'high' | 'urgent'

  @column()
  declare specification: string | null

  @belongsTo(() => EquipmentRequisition)
  declare requisition: BelongsTo<typeof EquipmentRequisition>
}
```

---

## 🎮 Controllers

### RequisitionsController
```typescript
// app/controllers/requisitions_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import EquipmentRequisition from '#models/equipment_requisition'
import RequisitionService from '#services/requisition_service'
import { validator } from '@adonisjs/core/services/validator'

export default class RequisitionsController {
  constructor(private requisitionService: RequisitionService) {}

  // ANY USER can create requisition
  async store({ request, response, auth }: HttpContext) {
    const user = auth.user!

    const validatedData = await validator.validate({
      schema: RequisitionValidator.createSchema(),
      data: request.all(),
    })

    const requisition = await this.requisitionService.create(
      validatedData,
      user
    )

    return response.status(201).json(requisition)
  }

  // ANY USER can add items to their own requisition
  async addItem({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const requisitionId = request.param('id')

    const requisition = await EquipmentRequisition.findOrFail(requisitionId)

    // Verify ownership
    if (requisition.createdById !== user.id && user.role.name !== 'admin') {
      return response.forbidden({ message: 'Not authorized' })
    }

    const validatedData = await validator.validate({
      schema: RequisitionValidator.itemSchema(),
      data: request.all(),
    })

    const item = await this.requisitionService.addItem(requisitionId, validatedData)

    return response.json(item)
  }

  // ANY USER can view their own requisitions
  async index({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const isAdmin = user.role.name === 'admin'

    let query = EquipmentRequisition.query()

    if (!isAdmin) {
      query = query.where('createdById', user.id)
    }

    if (request.input('status')) {
      query = query.where('status', request.input('status'))
    }

    const requisitions = await query
      .preload('items')
      .preload('createdBy')
      .orderBy('createdAt', 'desc')
      .paginate(request.input('page', 1), 10)

    return response.json(requisitions)
  }

  // ONLY ADMIN can approve/send requisitions
  async approve({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    await bouncer.authorize('approveRequisition', user)

    const requisitionId = request.param('id')
    const requisition = await EquipmentRequisition.findOrFail(requisitionId)

    const result = await this.requisitionService.approve(requisition, user)

    return response.json(result)
  }

  // ONLY ADMIN can send requisitions
  async send({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    await bouncer.authorize('sendRequisition', user)

    const requisitionId = request.param('id')
    const requisition = await EquipmentRequisition.findOrFail(requisitionId)

    const result = await this.requisitionService.send(requisition, user)

    return response.json(result)
  }

  // ONLY ADMIN can reject
  async reject({ request, response, auth, bouncer }: HttpContext) {
    const user = auth.user!
    await bouncer.authorize('rejectRequisition', user)

    const { remarks } = request.only(['remarks'])
    const requisitionId = request.param('id')
    const requisition = await EquipmentRequisition.findOrFail(requisitionId)

    const result = await this.requisitionService.reject(requisition, user, remarks)

    return response.json(result)
  }
}
```

---

## 🔧 Services

### RequisitionService
```typescript
// app/services/requisition_service.ts
import { randomUUID } from 'node:crypto'
import EquipmentRequisition from '#models/equipment_requisition'
import RequisitionGroup from '#models/requisition_group'
import User from '#models/user'
import NotificationService from './notification_service.js'
import db from '@adonisjs/lucid/services/db'

export default class RequisitionService {
  constructor(private notificationService: NotificationService) {}

  async create(data: any, user: User) {
    return db.transaction(async (trx) => {
      // Create requisition group
      const group = new RequisitionGroup()
      group.useTransaction(trx)

      const healthCenter = await user.related('healthCenter').query().first()

      await group.merge({
        id: randomUUID(),
        healthCenterId: healthCenter!.id,
        createdById: user.id,
        status: 'draft',
      }).save()

      // Create requisition
      const requisition = new EquipmentRequisition()
      requisition.useTransaction(trx)

      await requisition.merge({
        id: randomUUID(),
        groupId: group.id,
        healthCenterId: healthCenter!.id,
        createdById: user.id,
        status: 'pending',
      }).save()

      return requisition
    })
  }

  async addItem(requisitionId: string, itemData: any) {
    const requisition = await EquipmentRequisition.findOrFail(requisitionId)

    const item = await requisition.related('items').create({
      equipmentName: itemData.equipmentName,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      totalPrice: itemData.quantity * itemData.unitPrice,
      category: itemData.category,
      priority: itemData.priority || 'normal',
      specification: itemData.specification,
    })

    // Update total amount
    const items = await requisition.related('items').query()
    const totalAmount = items.reduce((sum, i) => sum + (i.totalPrice || 0), 0)
    await requisition.merge({ totalAmount }).save()

    return item
  }

  async approve(requisition: EquipmentRequisition, admin: User) {
    requisition.status = 'approved'
    await requisition.save()

    // Record history
    await requisition.updateHistory({
      status: 'approved',
      changedById: admin.id,
      remarks: 'Approved by admin',
    })

    // Send notification to health center staff
    await this.notificationService.sendRequisitionNotification(
      requisition,
      'Requisition Approved',
      `Your equipment requisition has been approved`
    )

    return requisition
  }

  async send(requisition: EquipmentRequisition, admin: User) {
    if (requisition.status !== 'approved') {
      throw new Error('Only approved requisitions can be sent')
    }

    requisition.status = 'sent'
    await requisition.save()

    // Record history
    await requisition.updateHistory({
      status: 'sent',
      changedById: admin.id,
      remarks: 'Sent to supplier',
    })

    // Send SMS notification
    const healthCenter = await requisition.related('healthCenter').query().first()
    await this.notificationService.sendSms(
      healthCenter!.phone,
      `Equipment requisition ${requisition.id.substring(0, 8)} has been sent to supplier. Amount: $${requisition.totalAmount}`
    )

    return requisition
  }

  async reject(requisition: EquipmentRequisition, admin: User, remarks: string) {
    requisition.status = 'rejected'
    requisition.remarks = remarks
    await requisition.save()

    // Record history
    await requisition.updateHistory({
      status: 'rejected',
      changedById: admin.id,
      remarks,
    })

    // Notify creator
    const creator = await requisition.related('createdBy').query().first()
    await this.notificationService.sendNotification(
      creator!,
      'Requisition Rejected',
      `Your equipment requisition was rejected: ${remarks}`
    )

    return requisition
  }
}
```

---

## 🛣️ API Routes

```typescript
// start/routes.ts
Route.group(() => {
  // ANY USER - Create and view own requisitions
  Route.post('requisitions', 'RequisitionsController.store')
    .middleware('auth')

  Route.get('requisitions', 'RequisitionsController.index')
    .middleware('auth')

  Route.post('requisitions/:id/items', 'RequisitionsController.addItem')
    .middleware('auth')

  Route.get('requisitions/:id', 'RequisitionsController.show')
    .middleware('auth')

  // ADMIN ONLY - Approve, send, reject
  Route.post('requisitions/:id/approve', 'RequisitionsController.approve')
    .middleware(['auth', 'isAdmin'])

  Route.post('requisitions/:id/send', 'RequisitionsController.send')
    .middleware(['auth', 'isAdmin'])

  Route.post('requisitions/:id/reject', 'RequisitionsController.reject')
    .middleware(['auth', 'isAdmin'])

  Route.delete('requisitions/:id', 'RequisitionsController.destroy')
    .middleware('auth')
}).prefix('/api')
```

---

## 🎨 PrimeVue Component

### EquipmentRequisitionForm
```vue
<template>
  <div class="equipment-requisition-container">
    <Card>
      <template #title>
        <i class="pi pi-plus mr-2"></i>
        New Equipment Requisition
      </template>

      <Form @submit="submitForm" :validation-schema="validationSchema" v-slot="{ errors }">
        <div class="space-y-4">
          <!-- Equipment Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Equipment Name</label>
              <InputText
                v-model="form.equipmentName"
                placeholder="e.g., Ultrasound Machine"
                class="w-full"
              />
              <small class="text-red-500" v-if="errors.equipmentName">
                {{ errors.equipmentName }}
              </small>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Category</label>
              <Dropdown
                v-model="form.category"
                :options="categories"
                placeholder="Select category"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Quantity</label>
              <InputNumber
                v-model="form.quantity"
                :min="1"
                placeholder="0"
                class="w-full"
              />
              <small class="text-red-500" v-if="errors.quantity">
                {{ errors.quantity }}
              </small>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Unit Price ($)</label>
              <InputNumber
                v-model="form.unitPrice"
                :min="0"
                mode="currency"
                currency="USD"
                placeholder="0.00"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Priority</label>
              <Dropdown
                v-model="form.priority"
                :options="['Low', 'Normal', 'High', 'Urgent']"
                placeholder="Select priority"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Total Price</label>
              <InputText
                :value="`$${(form.quantity * form.unitPrice).toFixed(2)}`"
                disabled
                class="w-full"
              />
            </div>
          </div>

          <!-- Specification -->
          <div>
            <label class="block text-sm font-medium mb-2">Specification (Optional)</label>
            <Textarea
              v-model="form.specification"
              rows="3"
              placeholder="Add detailed specifications, brand preference, etc."
              class="w-full"
            />
          </div>

          <!-- Items List -->
          <div v-if="items.length > 0">
            <h4 class="font-medium mb-2">Items in This Requisition</h4>
            <DataTable :value="items" striped-rows>
              <Column field="equipmentName" header="Equipment" />
              <Column field="quantity" header="Qty" />
              <Column field="unitPrice" header="Unit Price" />
              <Column field="totalPrice" header="Total" />
              <Column field="priority" header="Priority">
                <template #body="{ data }">
                  <Tag :value="data.priority" :severity="getPrioritySeverity(data.priority)" />
                </template>
              </Column>
              <Column>
                <template #body="{ data }">
                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger p-button-text"
                    @click="removeItem(data.id)"
                  />
                </template>
              </Column>
            </DataTable>
          </div>

          <!-- Submit -->
          <div class="flex justify-end gap-2">
            <Button label="Cancel" severity="secondary" />
            <Button label="Add to Requisition" @click="addItem" />
            <Button
              v-if="items.length > 0"
              label="Submit Requisition"
              type="submit"
              :loading="submitting"
            />
          </div>
        </div>
      </Form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form } from 'vee-validate'
import * as yup from 'yup'
import axios from 'axios'

const submitting = ref(false)
const items = ref([])

const form = ref({
  equipmentName: '',
  category: '',
  quantity: 1,
  unitPrice: 0,
  priority: 'Normal',
  specification: '',
})

const categories = [
  'Medical Equipment',
  'Furniture',
  'Office Supplies',
  'IT Equipment',
  'Laboratory',
  'Other',
]

const validationSchema = yup.object({
  equipmentName: yup.string().required('Equipment name is required'),
  quantity: yup.number().min(1).required('Quantity must be at least 1'),
  unitPrice: yup.number().min(0).required('Unit price is required'),
})

const addItem = () => {
  items.value.push({
    id: items.value.length + 1,
    ...form.value,
  })

  // Reset form
  form.value = {
    equipmentName: '',
    category: '',
    quantity: 1,
    unitPrice: 0,
    priority: 'Normal',
    specification: '',
  }
}

const removeItem = (id: number) => {
  items.value = items.value.filter(item => item.id !== id)
}

const submitForm = async () => {
  submitting.value = true
  try {
    const requisition = await axios.post('/api/requisitions', {})

    for (const item of items.value) {
      await axios.post(`/api/requisitions/${requisition.data.id}/items`, item)
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Requisition submitted successfully',
      life: 3000,
    })

    items.value = []
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to submit requisition',
      life: 3000,
    })
  } finally {
    submitting.value = false
  }
}

const getPrioritySeverity = (priority: string) => {
  const severities: Record<string, string> = {
    'Low': 'info',
    'Normal': 'secondary',
    'High': 'warning',
    'Urgent': 'danger',
  }
  return severities[priority] || 'info'
}
</script>

<style scoped>
.equipment-requisition-container {
  max-width: 1000px;
  margin: 0 auto;
}
</style>
```

---

## 🔐 Permissions

### RequisitionPolicy
```typescript
// app/policies/requisition_policy.ts
import User from '#models/user'
import EquipmentRequisition from '#models/equipment_requisition'

export default class RequisitionPolicy {
  // ANY USER can create
  create(user: User) {
    return true
  }

  // User can only edit own requisitions if not yet submitted
  edit(user: User, requisition: EquipmentRequisition) {
    return (
      requisition.createdById === user.id &&
      requisition.status === 'draft'
    )
  }

  // ONLY ADMIN can approve
  approve(user: User) {
    return user.role.name === 'admin'
  }

  // ONLY ADMIN can send
  send(user: User) {
    return user.role.name === 'admin'
  }

  // ONLY ADMIN can reject
  reject(user: User) {
    return user.role.name === 'admin'
  }
}
```

---

## 📋 Implementation Checklist

### Database
- [ ] Create requisition_groups table
- [ ] Create equipment_requisitions table
- [ ] Create requisition_items table
- [ ] Create requisition_history table
- [ ] Create all indexes
- [ ] Run migrations

### Models
- [ ] RequisitionGroup model
- [ ] EquipmentRequisition model
- [ ] RequisitionItem model
- [ ] RequisitionHistory model

### Controllers & Services
- [ ] RequisitionsController
- [ ] RequisitionService
- [ ] Permissions/Policy

### Frontend
- [ ] EquipmentRequisitionForm component
- [ ] RequisitionList component
- [ ] RequisitionAdmin component (approve/reject)
- [ ] Dashboard widgets

### Routes
- [ ] API routes with proper middleware
- [ ] Authentication checks
- [ ] Authorization checks

---

## 🚀 Usage Flow

### User Workflow (Any User)
1. Go to "Equipment Requisitions"
2. Click "New Requisition"
3. Add equipment items (name, qty, price, priority)
4. Submit requisition
5. Status: "Pending" (waiting for admin approval)

### Admin Workflow
1. View all pending requisitions
2. Review items and total amount
3. **Approve** → Changes status to "Approved"
4. **Send** → Changes status to "Sent" + SMS notification
5. **Reject** → Changes status to "Rejected" + notifies user

### Status Flow
```
draft → pending → approved → sent → received
                       ↓
                    rejected
```

---

**Status**: Implementation Ready
**Based On**: PMS Order Protocol
**Authorization**: Any user can create, Only admin can approve/send
