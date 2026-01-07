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

    const createMunicipio = async (departamentoId, nombre) => {
        try {
            const { data } = await axios.post('/municipios', { departamento_id: departamentoId, nombre })
            // Si estamos viendo el depto actual, agregarlo
            // Para simplificar, pusheamos si coincide o recargamos:
            if (municipios.value.some(m => m.departamento_id == departamentoId) || municipios.value.length === 0) {
                municipios.value.push(data)
            }
            return data
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

    return {
        departamentos,
        municipios,
        comunidades,
        fetchDepartamentos,
        fetchMunicipios,
        fetchComunidades,
        createDepartamento,
        createMunicipio,
        createComunidad
    }
})
