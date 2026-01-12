import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/api/axios'

export const useLocalidadesStore = defineStore('localidades', () => {

    const departamentos = ref([])
    const municipios = ref([]) // Puede ser una sola lista o cacheada por depto
    const comunidades = ref([])

    // --- LOADERS ---
    const fetchDepartamentos = async () => {
        try {
            const { data } = await axios.get('/departamentos')
            departamentos.value = data
            return data
        } catch (e) { throw e }
    }

    const fetchMunicipios = async (departamentoId) => {
        try {
            const { data } = await axios.get(`/municipios?departamento_id=${departamentoId}`)
            municipios.value = data // Reemplaza lista actual para selects en cascada
            return data
        } catch (e) { throw e }
    }

    const fetchComunidades = async (municipioId) => {
        try {
            const { data } = await axios.get(`/comunidades?municipio_id=${municipioId}`)
            comunidades.value = data
            return data
        } catch (e) { throw e }
    }

    // --- CREATORS ---
    const createDepartamento = async (nombre) => {
        try {
            const { data } = await axios.post('/departamentos', { nombre })
            departamentos.value.push(data)
            return data
        } catch (e) { throw e }
    }

    const updateDepartamento = async (id, nombre) => {
        try {
            const { data } = await axios.put(`/departamentos/${id}`, { nombre })
            const idx = departamentos.value.findIndex(d => d.id === id)
            if (idx !== -1) departamentos.value[idx] = data
            return data
        } catch (e) { throw e }
    }

    const deleteDepartamento = async (id) => {
        try {
            await axios.delete(`/departamentos/${id}`)
            departamentos.value = departamentos.value.filter(d => d.id !== id)
        } catch (e) { throw e }
    }

    const createMunicipio = async (departamentoId, nombre) => {
        try {
            const { data } = await axios.post('/municipios', { departamento_id: departamentoId, nombre })
            if (municipios.value.some(m => m.departamento_id == departamentoId) || municipios.value.length === 0) {
                municipios.value.push(data)
            }
            return data
        } catch (e) { throw e }
    }

    const updateMunicipio = async (id, nombre) => {
        try {
            const { data } = await axios.put(`/municipios/${id}`, { nombre })
            const idx = municipios.value.findIndex(m => m.id === id)
            if (idx !== -1) municipios.value[idx] = data
            return data
        } catch (e) { throw e }
    }

    const deleteMunicipio = async (id) => {
        try {
            await axios.delete(`/municipios/${id}`)
            municipios.value = municipios.value.filter(m => m.id !== id)
        } catch (e) { throw e }
    }

    const createComunidad = async (municipioId, nombre) => {
        try {
            const { data } = await axios.post('/comunidades', { municipio_id: municipioId, nombre })
            if (comunidades.value.some(c => c.municipio_id == municipioId) || comunidades.value.length === 0) {
                comunidades.value.push(data)
            }
            return data
        } catch (e) { throw e }
    }

    const updateComunidad = async (id, nombre) => {
        try {
            const { data } = await axios.put(`/comunidades/${id}`, { nombre })
            const idx = comunidades.value.findIndex(c => c.id === id)
            if (idx !== -1) comunidades.value[idx] = data
            return data
        } catch (e) { throw e }
    }

    const deleteComunidad = async (id) => {
        try {
            await axios.delete(`/comunidades/${id}`)
            comunidades.value = comunidades.value.filter(c => c.id !== id)
        } catch (e) { throw e }
    }

    return {
        departamentos,
        municipios,
        comunidades,
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
