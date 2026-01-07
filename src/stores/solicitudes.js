import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/api/axios' // Asumo que existe un cliente axios configurado

export const useSolicitudesStore = defineStore('solicitudes', () => {

    // --- STATE ---
    const solicitudes = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Catalogos
    const tiposApoyo = ref([])
    const departamentos = ref([])
    const municipios = ref([])
    const comunidades = ref([])

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
        try {
            const { data } = await axios.post('/tipos-apoyo', { nombre, activo: true })
            tiposApoyo.value.push(data)
            return data
        } catch (e) {
            throw e
        }
    }


    // 2. CRUD Solicitudes
    const fetchSolicitudes = async (filters = {}) => {
        loading.value = true
        try {
            const params = new URLSearchParams(filters).toString()
            const { data } = await axios.get(`/solicitudes?${params}`)
            solicitudes.value = data.data // Paginado
            return data
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al cargar solicitudes'
            throw err
        } finally {
            loading.value = false
        }
    }

    const createSolicitud = async (formData) => {
        try {
            const { data } = await axios.post('/solicitudes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return data
        } catch (err) {
            throw err
        }
    }

    const updateSolicitud = async (id, formData) => {
        try {
            // Nota: Si envias archivos usa POST con _method: PUT o maneja el backend
            // El backend soporta PUT directo para data json, pero si hay archivos mejor usar POST simulado
            // Para simplificar, el update del admin es JSON puro (según controlador).
            const { data } = await axios.put(`/solicitudes/${id}`, formData)
            return data
        } catch (err) {
            throw err
        }
    }

    const deleteSolicitud = async (id) => {
        try {
            await axios.delete(`/solicitudes/${id}`)
            // Remover de la lista local
            solicitudes.value = solicitudes.value.filter(s => s.id !== id)
        } catch (err) {
            throw err
        }
    }

    // 3. Workflow Actions
    const gestionarSolicitud = async (id, comentario) => {
        try {
            const { data } = await axios.put(`/solicitudes/${id}/gestionar`, { comentario_gestion: comentario })
            return data
        } catch (err) {
            throw err
        }
    }

    const aprobarSolicitud = async (id, formData) => {
        try {
            const { data } = await axios.post(`/solicitudes/${id}/aprobar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return data
        } catch (err) {
            throw err
        }
    }

    const finalizarSolicitud = async (id, formData) => {
        try {
            const { data } = await axios.post(`/solicitudes/${id}/finalizar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return data
        } catch (err) {
            throw err
        }
    }

    const rechazarSolicitud = async (id, motivo) => {
        try {
            const { data } = await axios.put(`/solicitudes/${id}/rechazar`, { motivo_rechazo: motivo })
            return data
        } catch (err) {
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
        createSolicitud,
        updateSolicitud,
        deleteSolicitud,
        gestionarSolicitud,
        aprobarSolicitud,
        finalizarSolicitud,
        rechazarSolicitud
    }
})
