import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Card from 'primevue/card'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Sidebar from 'primevue/sidebar'
import Menubar from 'primevue/menubar'
import Dropdown from 'primevue/dropdown'
import Avatar from 'primevue/avatar'
import AvatarGroup from 'primevue/avatargroup'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'
import router from './router'
import App from './App.vue'
import './index.css'
import 'primeflex/primeflex.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import { refreshUser, state } from './stores/appStore'

const app = createApp(App)
app.use(router)
app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(ConfirmationService)
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Card', Card)
app.component('Toast', Toast)
app.component('Sidebar', Sidebar)
app.component('Menubar', Menubar)
app.component('Dropdown', Dropdown)
app.component('Avatar', Avatar)
app.component('AvatarGroup', AvatarGroup)
app.component('Dialog', Dialog)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputNumber', InputNumber)
app.component('Calendar', Calendar)
app.component('Checkbox', Checkbox)
app.component('RadioButton', RadioButton)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Message', Message)
app.component('ProgressBar', ProgressBar)
app.component('Badge', Badge)
app.component('Tag', Tag)
app.component('ConfirmDialog', ConfirmDialog)
app.mount('#app')

if (state.token && !state.isAdmin) {
  refreshUser().catch(() => {})
}
