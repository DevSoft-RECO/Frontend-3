import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useColocacionesStore = defineStore('cartillaColocaciones', {
  state: () => ({
    pendientes: [],
    pagination: {
      currentPage: 1,
      lastPage: 1,
      total: 0
    },
    loading: false,
    importing: false,
    claiming: false,
  }),

  actions: {
    async fetchPendientes(params = {}) {
      this.loading = true
      try {
        const response = await api.get('/cartilla/colocaciones/pendientes', { params })
        this.pendientes = response.data.data
        this.pagination = {
          currentPage: response.data.current_page,
          lastPage: response.data.last_page,
          total: response.data.total
        }
        return response.data
      } catch (error) {
        console.error('Error al cargar pagos pendientes:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async importarCsv(file) {
      this.importing = true
      const formData = new FormData()
      formData.append('archivo_csv', file)

      try {
        const response = await api.post('/cartilla/colocaciones/importar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } catch (error) {
        console.error('Error al importar CSV de colocaciones:', error)
        throw error
      } finally {
        this.importing = false
      }
    },

    async reclamarPago(pagoId, data) {
      this.claiming = true
      try {
        const response = await api.post(`/cartilla/colocaciones/${pagoId}/reclamar`, data)
        await this.fetchPendientes({ page: this.pagination.currentPage })
        return response.data
      } catch (error) {
        console.error('Error al reclamar pago automático:', error)
        throw error
      } finally {
        this.claiming = false
      }
    }
  }
})
