import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useCartillaConfiguracionStore = defineStore('cartillaConfiguracion', () => {
  const configuraciones = ref({})
  const historial = ref([])
  const pagination = ref({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1
  })
  const loading = ref(false)
  const error = ref(null)

  async function fetchConfiguraciones() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/cartilla/configuracion')
      configuraciones.value = response.data
    } catch (err) {
      error.value = 'Error al cargar configuraciones'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function actualizarConfiguracion(clave, valor) {
    loading.value = true
    try {
      await api.put('/cartilla/configuracion', { clave, valor })
      await fetchConfiguraciones()
    } catch (err) {
      throw err.response?.data?.error || 'Error al actualizar configuración'
    } finally {
      loading.value = false
    }
  }

  async function fetchHistorial(filters = {}) {
    loading.value = true
    try {
      const response = await api.get('/cartilla/configuracion/historial', { params: filters })
      historial.value = response.data.data
      pagination.value = {
        total: response.data.total,
        per_page: response.data.per_page,
        current_page: response.data.current_page,
        last_page: response.data.last_page
      }
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    configuraciones,
    historial,
    pagination,
    loading,
    error,
    fetchConfiguraciones,
    actualizarConfiguracion,
    fetchHistorial
  }
})
