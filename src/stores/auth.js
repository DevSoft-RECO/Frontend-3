import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import api from '../api/axios'
import AuthService from '../services/AuthService'
import { getAvatarUrl } from '../utils/imageUtils'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

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

  // --- VARIABLES REACTIVAS DE SOCKETS Y CONTROL DE INACTIVIDAD ---
  const echoInstance = ref(null)
  const showInactivityModal = ref(false)
  const inactivitySessionId = ref(null)
  const inactivityCountdown = ref(300)
  const isHeartbeatLoading = ref(false)
  let countdownTimerId = null

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
      
      // CRÍTICO: Inicializar WebSockets de inmediato tras obtener el token
      initSessionSocket()
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
    disconnectSessionSocket()
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
      const response = await api.get('/me')
      const userData = response.data
      
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

  // --- MÉTODOS DE SOCKETS Y CIERRE ---
  function initSessionSocket() {
    if (!token.value || !user.value) return
    if (echoInstance.value) return // Evitar conexiones duplicadas

    window.Pusher = Pusher

    echoInstance.value = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
      wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8082,
      wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8082,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${import.meta.env.VITE_MOTHER_API_URL}/api/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: 'application/json'
        }
      }
    })

    // Escuchar canal privado del usuario centralizado
    echoInstance.value.private(`user.${user.value.id}`)
      .listen('.InactivityExpiringSoon', (e) => {
        inactivitySessionId.value = e.sessionId
        inactivityCountdown.value = Math.round(e.remainingSeconds) || 300
        showInactivityModal.value = true
        startLocalCountdown()
      })
      .listen('.SessionForceClosed', () => {
        stopLocalCountdown()
        disconnectSessionSocket()
        AuthService.logoutLocal()
        const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
        window.location.href = `${motherAppUrl}/login?session_expired=true`
      })
  }

  function disconnectSessionSocket() {
    if (echoInstance.value) {
      echoInstance.value.disconnect()
      echoInstance.value = null
    }
    showInactivityModal.value = false
    inactivitySessionId.value = null
    stopLocalCountdown()
  }

  function startLocalCountdown() {
    if (countdownTimerId) clearInterval(countdownTimerId)
    countdownTimerId = setInterval(() => {
      if (inactivityCountdown.value > 0) {
        inactivityCountdown.value--
      } else {
        clearInterval(countdownTimerId)
        AuthService.logoutLocal()
        const motherAppUrl = import.meta.env.VITE_MOTHER_APP_URL || 'http://localhost:5173'
        window.location.href = `${motherAppUrl}/login?session_expired=true`
      }
    }, 1000)
  }

  function stopLocalCountdown() {
    if (countdownTimerId) {
      clearInterval(countdownTimerId)
      countdownTimerId = null
    }
  }

  async function sendHeartbeatPing() {
    if (!inactivitySessionId.value || isHeartbeatLoading.value) return
    isHeartbeatLoading.value = true
    try {
      const motherApiUrl = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000'
      await axios.post(`${motherApiUrl}/api/sso/heartbeat`, {
        session_id: inactivitySessionId.value
      }, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      showInactivityModal.value = false
      stopLocalCountdown()
    } catch (err) {
      console.error('Error al enviar ping de heartbeat a la Madre:', err)
      logout()
    } finally {
      isHeartbeatLoading.value = false
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
    hasRole,
    // Sockets e Inactividad
    echoInstance,
    showInactivityModal,
    inactivitySessionId,
    inactivityCountdown,
    isHeartbeatLoading,
    initSessionSocket,
    disconnectSessionSocket,
    sendHeartbeatPing
  }
})

