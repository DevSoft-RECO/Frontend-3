import { defineStore } from 'pinia'
import axios from '@/api/axios'

export const useFacturasStore = defineStore('facturas', () => {

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

  // --- FACTURAS ---
  const fetchFacturas = async (params = {}) => {
    // params expected: page, numero, serie, fecha_inicio, fecha_fin
    const res = await axios.get('/facturas', { params })
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
    return `${baseUrl}/api/facturas/export/csv?${queryString}`
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
    getExportUrl
  }
})
