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
  // MIGRACIÓN DE ALMACENAMIENTO (v3_app3_clean: Borrado forzoso de localStorage antiguo)
  const STORAGE_VERSION = 'v3_app3_clean'; 

  if (localStorage.getItem('yk_storage_version') !== STORAGE_VERSION) {
    const keysToRemove = ['access_token', 'user_data', 'pkce_verifier'];
    keysToRemove.forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    localStorage.setItem('yk_storage_version', STORAGE_VERSION);
    if (window.location.pathname !== '/callback') window.location.reload();
  }

  // --- STATE ---
  // AHORA: Usamos preferentemente sessionStorage para seguridad (vuela al cerrar pestaña)
  const user = ref(JSON.parse(sessionStorage.getItem('user_data') || 'null'))
  const token = ref(sessionStorage.getItem('access_token') || null)
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
    if (!verifier) {
      throw new Error('No se encontró el verifier PKCE');
    }

    try {
      const response = await axios.post(`${MOTHER_API_URL}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
        code: code
      });

      token.value = response.data.access_token;
      
      sessionStorage.setItem('access_token', token.value);
      sessionStorage.removeItem('pkce_verifier');
      processingSSO.value = false;

      await fetchUser(true); 
    } catch {
      throw new Error('PKCE_EXCHANGE_FAILED');
    } finally {
      processingSSO.value = false;
    }
  }

  /**
   * Inicia el flujo de redirección a la Madre con PKCE
   */
  async function login(redirectTo = null) {
    if (processingSSO.value) return; 
    processingSSO.value = true;
    if (redirectTo) {
      sessionStorage.setItem('auth_redirect_to', redirectTo);
    }
    await AuthService.login();
  }

  /**
   * Cierra sesión local
   */
  function logout() {
    user.value = null
    token.value = null
    isReady.value = false
    AuthService.logout()
  }

  /**
   * Obtiene usuario desde Backend LOCAL (que sincroniza JIT con la Madre)
   * @param {Boolean} force Si es true, ignora la caché y descarga de nuevo
   */
  async function fetchUser(force = false) {
    
    if (!token.value) {
      isReady.value = true;
      return;
    }

    if (!force && user.value) {
      isReady.value = true;
      return;
    }

    try {
      const userData = await MotherAuthService.getMyProfile()
      
      user.value = userData
      sessionStorage.setItem('user_data', JSON.stringify(userData))
    } catch {
      logout() 
    } finally {
      isReady.value = true
    }
  }

  /**
   * Helper estándar para verificar permisos
   */
  function hasPermission(permission) {
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
    hasPermission,
    can: hasPermission,
    hasRole
  }
})

