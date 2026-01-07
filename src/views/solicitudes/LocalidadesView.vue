<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Gestión de Localidades</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">

        <!-- COLUMNA 1: DEPARTAMENTOS -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-full">
            <div class="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                <h2 class="font-bold text-lg dark:text-white">1. Departamentos</h2>
            </div>
            <div class="p-4 border-b dark:border-gray-700">
                <form @submit.prevent="addDepto" class="flex gap-2">
                    <input v-model="newDepto" placeholder="Nuevo Departamento" class="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm py-1.5" required>
                    <button type="submit" class="bg-indigo-600 text-white rounded-md px-3 text-sm hover:bg-indigo-700">+</button>
                </form>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                <div
                    v-for="d in store.departamentos" :key="d.id"
                    @click="selectDepto(d)"
                    class="p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center"
                    :class="selectedDepto?.id === d.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'"
                >
                    <span class="font-medium text-gray-700 dark:text-gray-200">{{ d.nombre }}</span>
                    <span class="text-xs text-gray-400">ID: {{ d.id }}</span>
                </div>
            </div>
        </div>

        <!-- COLUMNA 2: MUNICIPIOS -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-full relative" :class="{'opacity-50 pointer-events-none': !selectedDepto}">
            <div class="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                <h2 class="font-bold text-lg dark:text-white">2. Municipios</h2>
                 <span v-if="selectedDepto" class="text-xs text-indigo-600 dark:text-indigo-400">De: {{ selectedDepto.nombre }}</span>
            </div>
            <div class="p-4 border-b dark:border-gray-700">
                <form @submit.prevent="addMuni" class="flex gap-2">
                    <input v-model="newMuni" placeholder="Nuevo Municipio" class="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm py-1.5" required>
                    <button type="submit" class="bg-indigo-600 text-white rounded-md px-3 text-sm hover:bg-indigo-700">+</button>
                </form>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                <div v-if="!selectedDepto" class="text-center p-4 text-gray-400 text-sm">Selecciona un departamento</div>
                <div v-else-if="store.municipios.length === 0" class="text-center p-4 text-gray-400 text-sm">Sin municipios</div>
                <div
                    v-for="m in store.municipios" :key="m.id"
                    @click="selectMuni(m)"
                    class="p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center"
                    :class="selectedMuni?.id === m.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'"
                >
                     <span class="font-medium text-gray-700 dark:text-gray-200">{{ m.nombre }}</span>
                </div>
            </div>
        </div>

        <!-- COLUMNA 3: COMUNIDADES -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-full relative" :class="{'opacity-50 pointer-events-none': !selectedMuni}">
            <div class="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                <h2 class="font-bold text-lg dark:text-white">3. Comunidades</h2>
                <span v-if="selectedMuni" class="text-xs text-indigo-600 dark:text-indigo-400">De: {{ selectedMuni.nombre }}</span>
            </div>
             <div class="p-4 border-b dark:border-gray-700">
                <form @submit.prevent="addComu" class="flex gap-2">
                    <input v-model="newComu" placeholder="Nueva Comunidad" class="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm py-1.5" required>
                    <button type="submit" class="bg-indigo-600 text-white rounded-md px-3 text-sm hover:bg-indigo-700">+</button>
                </form>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                 <div v-if="!selectedMuni" class="text-center p-4 text-gray-400 text-sm">Selecciona un municipio</div>
                 <div v-else-if="store.comunidades.length === 0" class="text-center p-4 text-gray-400 text-sm">Sin comunidades</div>
                 <div
                    v-for="c in store.comunidades" :key="c.id"
                    class="p-3 rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                     <span class="font-medium text-gray-700 dark:text-gray-200">{{ c.nombre }}</span>
                </div>
            </div>
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLocalidadesStore } from '@/stores/localidades'

const store = useLocalidadesStore()

const selectedDepto = ref(null)
const selectedMuni = ref(null)

const newDepto = ref('')
const newMuni = ref('')
const newComu = ref('')

onMounted(() => {
    store.fetchDepartamentos()
})

const selectDepto = async (depto) => {
    selectedDepto.value = depto
    selectedMuni.value = null
    store.municipios = [] // Clear old list visually before load
    store.comunidades = []
    await store.fetchMunicipios(depto.id)
}

const selectMuni = async (muni) => {
    selectedMuni.value = muni
    store.comunidades = []
    await store.fetchComunidades(muni.id)
}

const addDepto = async () => {
    if(!newDepto.value) return
    await store.createDepartamento(newDepto.value)
    newDepto.value = ''
}

const addMuni = async () => {
    if(!newMuni.value || !selectedDepto.value) return
    await store.createMunicipio(selectedDepto.value.id, newMuni.value)
    newMuni.value = ''
    // Reload items to ensure correct state if desired, or let store handle generic push
    // await store.fetchMunicipios(selectedDepto.value.id)
}

const addComu = async () => {
     if(!newComu.value || !selectedMuni.value) return
    await store.createComunidad(selectedMuni.value.id, newComu.value)
    newComu.value = ''
}
</script>
