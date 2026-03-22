import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

// --- CONTROL DE CACHÉ AGRESIVO (PRODUCCIÓN) ---
// Forzar recarga si detectamos código JS obsoleto en el navegador
const APP_VERSION = '1.0.1_pkce_final_v5';
if (localStorage.getItem('app_version') !== APP_VERSION) {
    console.log("Actualizando aplicación a versión crítica:", APP_VERSION);
    
    // Limpiar TODO el rastro del navegador relacionado a este origen
    localStorage.clear();
    sessionStorage.clear();
    
    // Registrar la nueva versión ANTES de recargar
    localStorage.setItem('app_version', APP_VERSION);
    
    // Forzar recarga desde el servidor saltando la caché (hard reload virtual)
    window.location.reload(true);
}

import App from './App.vue';
import router from './router';

// 1. Importamos el Store
import { useLayoutStore } from '@/stores/layout';
import { startSessionGuards } from './utils/sessionGuards';

const app = createApp(App);
const pinia = createPinia(); // Creamos la instancia explícitamente

// 2. Activamos Pinia y Router
app.use(pinia);
app.use(router);

// 3. AHORA podemos usar el Store (porque Pinia ya está activo)
// Esto ejecutará la lógica de hora/sistema inmediatamente antes de montar
const layoutStore = useLayoutStore();
layoutStore.initTheme();

// 4. (Opcional) Detectar cambios del sistema en tiempo real
// Si la PC cambia de día a noche mientras la app está abierta, actualizamos
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    // Solo reaccionamos si el usuario no tiene una preferencia manual guardada
    if (!localStorage.getItem('theme')) {
        layoutStore.initTheme();
    }
});

// 5. Iniciar guardianes de sesión
startSessionGuards();

app.mount('#app');