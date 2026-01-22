<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <v-layout>
    <v-app-bar class="app-bar" elevation="2">
      <div class="nav-container">
        <ul class="navigation">
          <li><RouterLink to="/" class="nav-link">Migração</RouterLink></li>
          <li><RouterLink to="/progresso" class="nav-link">Progresso</RouterLink></li>
        </ul>
      </div>
      <v-spacer></v-spacer>
      <div class="app-title-container">
        <v-card-title class="app-title non-mobile">Sistema de Apoio à Migração de Grade de BSI</v-card-title>
        <v-card-title class="app-title mobile">SAMG BSI</v-card-title>
      </div>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-main>
      <RouterView />
      <footer class="app-footer">
        <p>
          💙 Baseado no TCC de 
          <a href="https://github.com/Jowjowjowjowjow/samg" target="_blank" rel="noopener">Jow</a>
          - Agora, 100% client-side, sem necessidade de servidor.
        </p>
      </footer>
    </v-main>
  </v-layout>
</template>

<style scoped>
.app-bar {
  background: #1e1f24 !important; /* Cor surface do tema dark */
  border-bottom: 1px solid #2e3036;
}

.nav-container {
  padding-left: 16px;
}

.navigation {
  list-style-type: none;
  display: flex;
  gap: 16px;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-link {
  color: #9aa0a6 !important; /* Cor secundária */
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #e0e2e6 !important;
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-link.router-link-exact-active {
  color: #3b82f6 !important; /* Cor primária */
  background-color: rgba(59, 130, 246, 0.1);
}

.app-title-container {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none; /* Permite clicar nos links abaixo */
  display: flex;
  justify-content: center;
  align-items: center;
}

.app-title {
  color: #e0e2e6 !important;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.app-footer {
  text-align: center;
  padding: 24px 16px;
  margin-top: auto; /* Empurra footer para baixo */
  background: #1e1f24; /* Cor surface */
  border-top: 1px solid #2e3036;
}

.app-footer p {
  margin: 0;
  color: #9aa0a6;
  font-size: 14px;
}

.app-footer a {
  color: #3b82f6;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.app-footer a:hover {
  color: #60a5fa;
  text-decoration: underline;
}

@media (min-width: 768px) {
  .non-mobile {
    display: block !important;
  }
  .mobile {
    display: none;
  }
}

@media (max-width: 767px) {
  .non-mobile {
    display: none;
  }
  .mobile {
    display: block !important;
  }
  .app-title {
    font-size: 16px;
  }
  .nav-link {
    font-size: 14px;
    padding: 6px 10px;
  }
  .app-title-container {
      position: static;
      justify-content: flex-end;
      padding-right: 16px;
  }
}
</style>
