import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/api/axios' // Asumo que existe un cliente axios configurado

export const useSolicitudesStore = defineStore('solicitudes', () => {

  // --- STATE ---
  const solicitudes = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Cache management (Map for multiple filter states)
  // Key: JSON.stringify(filters), Value: { data, meta, timestamp }
  const requestCache = new Map()
  const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  // Catalogos
  const tiposApoyo = ref([])

  // --- ACTIONS ---

  // 1. Cargas Catalogos
  // 1. Cargas Catalogos
  const fetchTiposApoyo = async () => {
    try {
      const { data } = await axios.get('/tipos-apoyo')
      tiposApoyo.value = data
      return data
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const createTipoApoyo = async (nombre) => {
    const { data } = await axios.post('/tipos-apoyo', { nombre, activo: true })
    tiposApoyo.value.push(data)
    return data
  }

  const updateTipoApoyoAction = async (id, nombre, activo = true) => {
    // Action: Update Tipo Apoyo
    const { data } = await axios.put(`/tipos-apoyo/${id}`, { nombre, activo })
    const idx = tiposApoyo.value.findIndex(t => t.id === id)
    if (idx !== -1) tiposApoyo.value[idx] = data
    return data
  }

  const deleteTipoApoyo = async (id) => {
    await axios.delete(`/tipos-apoyo/${id}`)
    tiposApoyo.value = tiposApoyo.value.filter(t => t.id !== id)
  }


  // Helper for stable cache keys (sorts object keys)
  const stableStringify = (obj) => {
    if (typeof obj !== 'object' || obj === null) return String(obj)
    return JSON.stringify(Object.keys(obj).sort().reduce((result, key) => {
      result[key] = obj[key]
      return result
    }, {}))
  }

  // 2. CRUD Solicitudes
  const fetchSolicitudes = async (filters = {}, forceRefresh = false) => {
    // Create a cache key based on filters using stable stringify
    const cacheKey = stableStringify(filters)

    // Check if we have valid cached data for THIS specific filter set
    const now = Date.now()

    if (!forceRefresh && requestCache.has(cacheKey)) {
      const cachedEntry = requestCache.get(cacheKey)
      if ((now - cachedEntry.timestamp) < CACHE_DURATION) {
        console.log('📦 [CACHE HIT] Solicitudes:', cacheKey)
        return {
          data: cachedEntry.data,
          ...cachedEntry.pagination
        }
      } else {
        console.log('⌛ [CACHE EXPIRED] Solicitudes:', cacheKey)
        requestCache.delete(cacheKey)
      }
    } else {
      if (forceRefresh) console.log('🔄 [FORCE REFRESH] Solicitudes')
    }

    console.log('🌐 [API FETCH] Solicitudes:', cacheKey)
    loading.value = true
    try {
      // Remove null/undefined/empty string params to keep URL clean and consistent
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      )
      const params = new URLSearchParams(cleanFilters).toString()

      const { data } = await axios.get(`/solicitudes?${params}`)

      // Cache the response
      requestCache.set(cacheKey, {
        data: data.data,
        pagination: {
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total,
          meta: data.meta
        },
        timestamp: now
      })

      solicitudes.value = data.data // Paginado
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar solicitudes'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getSolicitud = async (id) => {
    loading.value = true
    try {
      const { data } = await axios.get(`/solicitudes/${id}`)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createSolicitud = async (formData) => {
    const { data } = await axios.post('/solicitudes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }

  const updateSolicitud = async (id, formData) => {
    // Si es FormData, enviamos como POST para soportar archivos (method chaining)
    if (formData instanceof FormData) {
      // Asegurar que _method existe si el usuario no lo puso (aunque la vista lo pone)
      if (!formData.has('_method')) formData.append('_method', 'PUT')

      const { data } = await axios.post(`/solicitudes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data
    } else {
      // JSON normal
      const { data } = await axios.put(`/solicitudes/${id}`, formData)
      return data
    }
  }

  const deleteSolicitud = async (id) => {
    await axios.delete(`/solicitudes/${id}`)
    // Remover de la lista local
    solicitudes.value = solicitudes.value.filter(s => s.id !== id)
  }

  // 3. Workflow Actions
  const gestionarSolicitud = async (id, comentario, userName) => {
    const { data } = await axios.put(`/solicitudes/${id}/gestionar`, {
      comentario_gestion: comentario,
      nombre_usuario: userName
    })
    return data
  }

  const aprobarSolicitud = async (id, formData) => {
    // Nota: formData ya debe incluir 'nombre_usuario' si se agregó en la vista
    const { data } = await axios.post(`/solicitudes/${id}/aprobar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }

  const finalizarSolicitud = async (id, formData) => {
    const { data } = await axios.post(`/solicitudes/${id}/finalizar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }

  const rechazarSolicitud = async (id, motivo, userName) => {
    const res = await axios.put(`/solicitudes/${id}/rechazar`, {
      motivo_rechazo: motivo,
      nombre_usuario: userName
    })
    return res.data
  }

  const reactivarSolicitud = async (id) => {
    const res = await axios.put(`/solicitudes/${id}/reactivar`)
    return res.data
  }

  const getFileUrl = async (id, type) => {
    try {
      const { data } = await axios.get(`/solicitudes/${id}/file-url`, { params: { type } })
      return data.url
    } catch (err) {
      console.error("Error fetching file URL:", err)
      throw err
    }
  }

  return {
    solicitudes,
    loading,
    error,
    tiposApoyo,
    fetchTiposApoyo,
    createTipoApoyo,
    fetchSolicitudes,
    getSolicitud,
    createSolicitud,
    updateSolicitud,
    deleteSolicitud,
    gestionarSolicitud,
    aprobarSolicitud,
    finalizarSolicitud,
    rechazarSolicitud,
    reactivarSolicitud,
    getFileUrl,
    updateTipoApoyoAction,
    deleteTipoApoyo
  }
})
