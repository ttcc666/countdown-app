import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import AppRoot from './AppRoot.vue'
import router from './router'

const app = createApp(AppRoot)
app.use(ElementPlus)
app.use(router)
app.mount('#app')