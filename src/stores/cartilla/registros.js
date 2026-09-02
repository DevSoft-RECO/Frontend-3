import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

// Estructura de caché en memoria con TTL de 10 minutos para optimizar lecturas
const cacheMap = new Map()
const CACHE_DURATION = 10 * 60 * 1000

function stableStringify(obj) {
  if (!obj) return ''
  return JSON.stringify(Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = obj[key]
    return acc
  }, {}))
}

export const useCartillaRegistrosStore = defineStore('cartillaRegistros', () => {
  const registros = ref([])
  const pagination = ref({
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1
  })
  const loading = ref(false)
  const error = ref(null)

  async function fetchRegistros(filters = {}, forceRefresh = false) {
    const cacheKey = stableStringify(filters)
    const cached = cacheMap.get(cacheKey)

    if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      registros.value = cached.data
      pagination.value = cached.pagination
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/cartilla/registros', { params: filters })
      const data = response.data.data
      const pag = {
        total: response.data.total,
        per_page: response.data.per_page,
        current_page: response.data.current_page,
        last_page: response.data.last_page
      }

      registros.value = data
      pagination.value = pag

      cacheMap.set(cacheKey, {
        timestamp: Date.now(),
        data,
        pagination: pag
      })
    } catch (err) {
      console.error('Error fetching cartilla registros:', err)
      error.value = err.response?.data?.error || 'Error al obtener registros'
    } finally {
      loading.value = false
    }
  }

  async function crearRegistro(formData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/cartilla/registros', formData)
      cacheMap.clear() // Limpia caché al insertar
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al crear el registro'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function editarRegistro(id, formData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/cartilla/registros/${id}`, formData)
      cacheMap.clear()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al editar el registro'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function eliminarRegistro(id) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/cartilla/registros/${id}`)
      cacheMap.clear()
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al eliminar el registro'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function calcularStickersPreview(params) {
    try {
      const response = await api.get('/cartilla/registros/calcular-stickers', { params })
      return response.data
    } catch (err) {
      console.error('Error calculando stickers:', err)
      return { stickers: 0, mensaje: '', ya_registro_plazo_fijo: false, detalle_existente: null }
    }
  }

  function clearCache() {
    cacheMap.clear()
  }

  return {
    registros,
    pagination,
    loading,
    error,
    fetchRegistros,
    crearRegistro,
    editarRegistro,
    eliminarRegistro,
    calcularStickersPreview,
    clearCache
  }
})
