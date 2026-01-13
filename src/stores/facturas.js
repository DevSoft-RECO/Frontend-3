import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/api/axios'

export const useFacturasStore = defineStore('facturas', () => {

  // Cache management
  const requestCache = new Map()
  const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  // --- CATEGORIAS ---
  const fetchCategorias = async () => {
    const res = await axios.get('/categorias-facturas')
    return res.data
  }

  const createCategoria = async (form) => {
    const res = await axios.post('/categorias-facturas', form)
    return res.data
  }

  const updateCategoria = async (id, form) => {
    const res = await axios.put(`/categorias-facturas/${id}`, form)
    return res.data
  }

  const deleteCategoria = async (id) => {
    const res = await axios.delete(`/categorias-facturas/${id}`)
    return res.data
  }

  // Helper for stable cache keys
  const stableStringify = (obj) => {
    if (typeof obj !== 'object' || obj === null) return String(obj)
    return JSON.stringify(Object.keys(obj).sort().reduce((result, key) => {
      result[key] = obj[key]
      return result
    }, {}))
  }

  // --- FACTURAS ---
  const fetchFacturas = async (params = {}, forceRefresh = false) => {
    // Create a cache key based on params
    const cacheKey = stableStringify(params)
    const now = Date.now()

    // Check if we have valid cached data for THIS specific param set
    if (!forceRefresh && requestCache.has(cacheKey)) {
      const cachedEntry = requestCache.get(cacheKey)
      if ((now - cachedEntry.timestamp) < CACHE_DURATION) {
        console.log('📦 [CACHE HIT] Facturas:', cacheKey)
        return {
          data: cachedEntry.data,
          ...cachedEntry.pagination
        }
      } else {
        console.log('⌛ [CACHE EXPIRED] Facturas:', cacheKey)
        requestCache.delete(cacheKey)
      }
    } else {
      if (forceRefresh) console.log('🔄 [FORCE REFRESH] Facturas')
    }

    console.log('🌐 [API FETCH] Facturas:', cacheKey)
    // Clean params for Axios (remove empty strings)
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    )

    const res = await axios.get('/facturas', { params: cleanParams })

    // Cache the response
    requestCache.set(cacheKey, {
      data: res.data.data,
      pagination: {
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total
      },
      timestamp: now
    })

    return res.data
  }

  const createFactura = async (form) => {
    const res = await axios.post('/facturas', form)
    return res.data
  }

  const updateFactura = async (id, form) => {
    const res = await axios.put(`/facturas/${id}`, form)
    return res.data
  }

  const deleteFactura = async (id) => {
    const res = await axios.delete(`/facturas/${id}`)
    return res.data
  }

  const getExportUrl = (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    // Use environment variable directly or reconstruction
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002'
    return `${baseUrl}/facturas/export/csv?${queryString}`
  }

  const downloadFacturasCsv = async (params = {}) => {
    const res = await axios.get('/facturas/export/csv', {
      params,
      responseType: 'blob'
    })
    return res.data
  }

  return {
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    fetchFacturas,
    createFactura,
    updateFactura,
    deleteFactura,
    getExportUrl,
    downloadFacturasCsv
  }
})
