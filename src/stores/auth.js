import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import AuthService from '../services/AuthService'
import MotherAuthService from '../services/MotherAuthService'
import { getAvatarUrl } from '../utils/imageUtils'

const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

export const useAuthStore = defineStore('auth', () => {
  // MIGRACIÓN DE ALMACENAMIENTO (v3_prod: Borrado forzoso para evitar colisiones de caché)
  const STORAGE_VERSION = 'v3_prod'; 
  if (localStorage.getItem('yk_storage_version') !== STORAGE_VERSION) {
    // Borrado forzoso de todo el storage relacionado para arrancar limpio
    console.log("Detectada versión de sistema antigua. Realizando limpieza de seguridad...");
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('yk_storage_version', STORAGE_VERSION);
    
    // Forzar recarga si estamos en medio de una transición
    if (window.location.pathname !== '/callback') {
        window.location.reload();
    }
  }

  // --- STATE ---
  const user = ref(JSON.parse(sessionStorage.getItem('user_data') || localStorage.getItem('user_data') || 'null'))
  const token = ref(localStorage.getItem('access_token') || null)
  const processingSSO = ref(false)
  const isReady = ref(false)

  // --- GETTERS ---
  const userAvatar = computed(() => {
    return getAvatarUrl(user.value?.avatar)
  })

  // --- ACTIONS ---

  /**
   * Procesa la validación PKCE, el canje del código y la carga del usuario.
   */
  async function handlePKCECallback(code) {
    processingSSO.value = true;
    const verifier = sessionStorage.getItem('pkce_verifier')
    if (!verifier) throw new Error('No se encontró el verifier PKCE')

    try {
      const response = await axios.post(`${MOTHER_API_URL}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
        code: code
      });

      token.value = response.data.access_token;
      localStorage.setItem('access_token', token.value);
      sessionStorage.removeItem('pkce_verifier');

      // Configurar el header de Authorization para las siguientes peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;

      await fetchUser();
    } catch {
      console.error('Fallo al canjear PKCE o cargar usuario');
      throw new Error('PKCE_EXCHANGE_FAILED');
    } finally {
      processingSSO.value = false;
    }
  }

  /**
   * Inicia el flujo de redirección a la Madre con PKCE
   */
  async function login() {
    processingSSO.value = true
    await AuthService.login()
  }

  /**
   * Cierra sesión local y redirige al backend
   */
  function logout() {
    user.value = null
    token.value = null
    isReady.value = false
    AuthService.logout()
  }

  /**
   * Verifica si el token es válido y carga el usuario sincronizado con el Backend Hija
   */
  async function fetchUser() {
    if (!token.value) {
      isReady.value = true;
      return;
    }

    try {
      // Intentar obtener el perfil. 
      // Nota: MotherAuthService.getMyProfile debería usar el axios configurado o su propia instancia.
      const userData = await MotherAuthService.getMyProfile()
      user.value = userData
      sessionStorage.setItem('user_data', JSON.stringify(userData))
      localStorage.setItem('user_data', JSON.stringify(userData))
    } catch {
      console.warn('Sesión expirada o inválida al intentar refrescar usuario')
      logout()
    } finally {
      isReady.value = true
    }
  }

  /**
   * Helper estándar para verificar permisos
   */
  function can(permission) {
    if (!user.value) return false;
    
    // Super Admin siempre tiene acceso total
    if (user.value.roles && user.value.roles.includes('Super Admin')) return true;
    
    // Fallback: soportar tanto 'permissions' como 'permisos' por compatibilidad con el ecosistema
    const userPerms = user.value.permissions || user.value.permisos || [];
    return userPerms.includes(permission);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  function hasRole(role) {
    if (!user.value) return false
    return user.value.roles && user.value.roles.includes(role)
  }

  // Verificar autenticación al arrancar
  async function checkAuth() {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      await fetchUser()
    } else {
      isReady.value = true
    }
  }

  return {
    user,
    token,
    processingSSO,
    isReady,
    userAvatar,
    login,
    handlePKCECallback,
    logout,
    fetchUser,
    checkAuth,
    can,
    hasRole
  }
})
