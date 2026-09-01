import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useCartillaCatalogosStore = defineStore('cartillaCatalogos', () => {
  const promocionales = ref([])
  const notasRapidas = ref([])
  const recordatorios = ref([])
  const agencias = ref([])
  const loading = ref(false)

  async function fetchPromocionales() {
    try {
      const response = await api.get('/cartilla/promocionales')
      promocionales.value = response.data
    } catch (err) {
      console.error(err)
    }
  }

  async function crearPromocional(nombre) {
    loading.value = true
    try {
      await api.post('/cartilla/promocionales', { nombre })
      await fetchPromocionales()
    } catch (err) {
      throw err.response?.data?.error || 'Error al crear promocional'
    } finally {
      loading.value = false
    }
  }

  async function actualizarPromocional(id, data) {
    loading.value = true
    try {
      await api.put(`/cartilla/promocionales/${id}`, data)
      await fetchPromocionales()
    } catch (err) {
      throw err.response?.data?.error || 'Error al actualizar promocional'
    } finally {
      loading.value = false
    }
  }

  async function eliminarPromocional(id) {
    loading.value = true
    try {
      await api.delete(`/cartilla/promocionales/${id}`)
      promocionales.value = promocionales.value.filter(p => p.id !== id)
      await fetchPromocionales()
    } catch (err) {
      throw err.response?.data?.error || 'Error al eliminar promocional'
    } finally {
      loading.value = false
    }
  }

  async function fetchNotasRapidas() {
    try {
      const response = await api.get('/cartilla/notas-rapidas')
      notasRapidas.value = response.data
    } catch (err) {
      console.error(err)
    }
  }

  async function crearNotaRapida(texto) {
    try {
      await api.post('/cartilla/notas-rapidas', { texto })
      await fetchNotasRapidas()
    } catch (err) {
      throw err.response?.data?.error || 'Error'
    }
  }

  async function actualizarNotaRapida(id, data) {
    try {
      await api.put(`/cartilla/notas-rapidas/${id}`, data)
      await fetchNotasRapidas()
    } catch (err) {
      throw err.response?.data?.error || 'Error'
    }
  }

  async function eliminarNotaRapida(id) {
    try {
      await api.delete(`/cartilla/notas-rapidas/${id}`)
      await fetchNotasRapidas()
    } catch (err) {
      throw err.response?.data?.error || 'Error'
    }
  }

  async function reordenarNotasRapidas(ids) {
    try {
      await api.put('/cartilla/notas-rapidas/reordenar', { ids })
      await fetchNotasRapidas()
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchRecordatorios() {
    try {
      const response = await api.get('/cartilla/recordatorios')
      recordatorios.value = response.data
    } catch (err) {
      console.error(err)
    }
  }

  async function crearRecordatorio(texto) {
    try {
      await api.post('/cartilla/recordatorios', { texto })
      await fetchRecordatorios()
    } catch (err) {
      throw err.response?.data?.error || 'Error'
    }
  }

  async function actualizarRecordatorio(id, data) {
    try {
      await api.put(`/cartilla/recordatorios/${id}`, data)
      await fetchRecordatorios()
    } catch (err) {
      throw err.response?.data?.error || 'Error'
    }
  }

  async function eliminarRecordatorio(id) {
    try {
      await api.delete(`/cartilla/recordatorios/${id}`)
      await fetchRecordatorios()
    } catch (err) {
      throw err.response?.data?.error || 'Error'
    }
  }

  async function reordenarRecordatorios(ids) {
    try {
      await api.put('/cartilla/recordatorios/reordenar', { ids })
      await fetchRecordatorios()
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchAgencias() {
    try {
      const response = await api.get('/cartilla/agencias')
      agencias.value = response.data
    } catch (err) {
      console.error(err)
    }
  }

  return {
    promocionales,
    notasRapidas,
    recordatorios,
    agencias,
    loading,
    fetchPromocionales,
    crearPromocional,
    actualizarPromocional,
    eliminarPromocional,
    fetchNotasRapidas,
    crearNotaRapida,
    actualizarNotaRapida,
    eliminarNotaRapida,
    reordenarNotasRapidas,
    fetchRecordatorios,
    crearRecordatorio,
    actualizarRecordatorio,
    eliminarRecordatorio,
    reordenarRecordatorios,
    fetchAgencias
  }
})
