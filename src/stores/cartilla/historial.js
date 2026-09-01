import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useCartillaHistorialStore = defineStore('cartillaHistorial', () => {
  const historialRegistros = ref([])
  const historialInventario = ref([])
  const paginationRegistros = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1 })
  const paginationInventario = ref({ total: 0, per_page: 15, current_page: 1, last_page: 1 })
  const loading = ref(false)

  async function fetchHistorialRegistros(filters = {}) {
    loading.value = true
    try {
      const response = await api.get('/cartilla/historial/registros', { params: filters })
      historialRegistros.value = response.data.data
      paginationRegistros.value = {
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

  async function fetchHistorialInventario(filters = {}) {
    loading.value = true
    try {
      const response = await api.get('/cartilla/historial/inventario', { params: filters })
      historialInventario.value = response.data.data
      paginationInventario.value = {
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

  async function restaurarMovimiento(historialId) {
    loading.value = true
    try {
      const response = await api.post(`/cartilla/historial/inventario/${historialId}/restaurar`)
      return response.data
    } catch (err) {
      throw err.response?.data?.error || 'Error al restaurar movimiento'
    } finally {
      loading.value = false
    }
  }

  return {
    historialRegistros,
    historialInventario,
    paginationRegistros,
    paginationInventario,
    loading,
    fetchHistorialRegistros,
    fetchHistorialInventario,
    restaurarMovimiento
  }
})
