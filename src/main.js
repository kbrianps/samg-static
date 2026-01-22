import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueGtag from "vue-gtag";

// createApp(App).use(VueGtag, {
//     config: { id: "G-78EWKSVY2T" }
// }).mount("#app");

import './assets/main.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import { mdiEye, mdiEyeOff, mdiCheckCircle, mdiCheckboxBlankCircle, mdiSquare, mdiAlertCircle, mdiAlphaXCircle } from '@mdi/js'

const samgDark = {
    dark: true,
    colors: {
        background: '#0f1012',
        surface: '#1e1f24',
        primary: '#3b82f6',
        secondary: '#4b5563',
        error: '#ef4444',
        info: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
    }
}

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'samgDark',
        themes: {
            samgDark,
        }
    },
    icons: {
        defaultSet: 'mdi',
        aliases: {
            ...aliases,
            eye: mdiEye,
            offEye: mdiEyeOff,
            check: mdiCheckCircle,
            unCheck: mdiCheckboxBlankCircle,
            square: mdiSquare,
            alert: mdiAlertCircle,
            x: mdiAlphaXCircle
        },
        sets: {
            mdi,
        }
    }
})

const app = createApp(App)
app.use(VueGtag, { config: { id: "G-78EWKSVY2T" } });
app.use(vuetify)
app.use(router)

app.mount('#app')
