import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useCartillaInventarioStore = defineStore('cartillaInventario', () => {
  const movimientos = ref([])
  const pagination = ref({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1
  })
  const stocks = ref({ central: [], agencias: {} })
  const balance = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchMovimientos(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/cartilla/inventario/movimientos', { params: filters })
      movimientos.value = response.data.data
      pagination.value = {
        total: response.data.total,
        per_page: response.data.per_page,
        current_page: response.data.current_page,
        last_page: response.data.last_page
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al obtener movimientos'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function crearMovimiento(data) {
    loading.value = true
    try {
      const response = await api.post('/cartilla/inventario/movimientos', data)
      return response.data
    } catch (err) {
      throw err.response?.data?.error || 'Error al registrar movimiento'
    } finally {
      loading.value = false
    }
  }

  async function editarMovimiento(id, data) {
    loading.value = true
    try {
      const response = await api.put(`/cartilla/inventario/movimientos/${id}`, data)
      return response.data
    } catch (err) {
      throw err.response?.data?.error || 'Error al editar movimiento'
    } finally {
      loading.value = false
    }
  }

  async function eliminarMovimiento(id) {
    loading.value = true
    try {
      await api.delete(`/cartilla/inventario/movimientos/${id}`)
    } catch (err) {
      throw err.response?.data?.error || 'Error al eliminar movimiento'
    } finally {
      loading.value = false
    }
  }

  async function fetchStocks() {
    loading.value = true
    try {
      const response = await api.get('/cartilla/inventario/stocks')
      stocks.value = response.data
    } catch (err) {
      console.error('Error fetching stocks:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBalance(filters = {}) {
    loading.value = true
    try {
      const cleanParams = {}
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          cleanParams[key] = filters[key]
        }
      })
      const response = await api.get('/cartilla/inventario/balance', { params: cleanParams })
      balance.value = response.data
      return response.data
    } catch (err) {
      console.error('Error fetching balance:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    movimientos,
    pagination,
    stocks,
    balance,
    loading,
    error,
    fetchMovimientos,
    crearMovimiento,
    editarMovimiento,
    eliminarMovimiento,
    fetchStocks,
    fetchBalance
  }
})
