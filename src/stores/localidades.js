import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/api/axios'

/**
 * Store para gestionar el catálogo geográfico (Departamentos, Municipios, Comunidades)
 * Se encarga de la persistencia local y las llamadas al Backend 8002.
 */
export const useLocalidadesStore = defineStore('localidades', () => {

    const departamentos = ref([])
    const municipios = ref([]) // Lista activa (sincronizada con el depto seleccionado)
    const comunidades = ref([])
    const loading = ref(false)

    // --- LOADERS ---
    
    /**
     * Carga todos los departamentos disponibles
     */
    const fetchDepartamentos = async () => {
        loading.value = true
        try {
            const { data } = await axios.get('/departamentos')
            departamentos.value = data
            return data
        } finally {
            loading.value = false
        }
    }

    /**
     * Carga los municipios de un departamento específico
     */
    const fetchMunicipios = async (departamentoId) => {
        if (!departamentoId) return []
        loading.value = true
        try {
            const { data } = await axios.get(`/municipios?departamento_id=${departamentoId}`)
            municipios.value = data
            return data
        } finally {
            loading.value = false
        }
    }

    /**
     * Carga las comunidades de un municipio específico
     */
    const fetchComunidades = async (municipioId) => {
        if (!municipioId) return []
        loading.value = true
        try {
            const { data } = await axios.get(`/comunidades?municipio_id=${municipioId}`)
            comunidades.value = data
            return data
        } finally {
            loading.value = false
        }
    }

    // --- DEPARTAMENTOS ---
    
    const createDepartamento = async (nombre) => {
        const { data } = await axios.post('/departamentos', { nombre })
        departamentos.value.push(data)
        return data
    }

    const updateDepartamento = async (id, nombre) => {
        const { data } = await axios.put(`/departamentos/${id}`, { nombre })
        const idx = departamentos.value.findIndex(d => d.id === id)
        if (idx !== -1) departamentos.value[idx] = data
        return data
    }

    const deleteDepartamento = async (id) => {
        await axios.delete(`/departamentos/${id}`)
        departamentos.value = departamentos.value.filter(d => d.id !== id)
    }

    // --- MUNICIPIOS ---
    
    const createMunicipio = async (departamentoId, nombre) => {
        const { data } = await axios.post('/municipios', { 
            departamento_id: Number(departamentoId), 
            nombre 
        })
        // Solo agregar a la lista reactiva si el municipio pertenece al departamento cargado
        if (municipios.value.some(m => Number(m.departamento_id) === Number(departamentoId)) || municipios.value.length === 0) {
            municipios.value.push(data)
        }
        return data
    }

    const updateMunicipio = async (id, nombre) => {
        const { data } = await axios.put(`/municipios/${id}`, { nombre })
        const idx = municipios.value.findIndex(m => m.id === id)
        if (idx !== -1) municipios.value[idx] = data
        return data
    }

    const deleteMunicipio = async (id) => {
        await axios.delete(`/municipios/${id}`)
        municipios.value = municipios.value.filter(m => m.id !== id)
    }

    // --- COMUNIDADES ---
    
    const createComunidad = async (municipioId, nombre) => {
        const { data } = await axios.post('/comunidades', { 
            municipio_id: Number(municipioId), 
            nombre 
        })
        if (comunidades.value.some(c => Number(c.municipio_id) === Number(municipioId)) || comunidades.value.length === 0) {
            comunidades.value.push(data)
        }
        return data
    }

    const updateComunidad = async (id, nombre) => {
        const { data } = await axios.put(`/comunidades/${id}`, { nombre })
        const idx = comunidades.value.findIndex(c => c.id === id)
        if (idx !== -1) comunidades.value[idx] = data
        return data
    }

    const deleteComunidad = async (id) => {
        await axios.delete(`/comunidades/${id}`)
        comunidades.value = comunidades.value.filter(c => c.id !== id)
    }

    return {
        departamentos,
        municipios,
        comunidades,
        loading,
        fetchDepartamentos,
        fetchMunicipios,
        fetchComunidades,
        createDepartamento,
        updateDepartamento,
        deleteDepartamento,
        createMunicipio,
        updateMunicipio,
        deleteMunicipio,
        createComunidad,
        updateComunidad,
        deleteComunidad
    }
})
