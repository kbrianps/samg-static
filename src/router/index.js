import { createRouter, createWebHistory } from 'vue-router'
import Migracao from '../views/Migracao.vue'
import Progresso from '../views/Progresso.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/migracao'
    },
    {
      path: '/migracao',
      name: 'migracao',
      component: Migracao
    },
    {
      path: '/progresso',
      name: 'progresso',
      component: Progresso
    },
    
  ]
})

export default router
