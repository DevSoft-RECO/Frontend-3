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
                    <input v-model="newDepto" :placeholder="editingDepto ? 'Editar Departamento' : 'Nuevo Departamento'" class="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm py-1.5" required>
                     <button v-if="editingDepto" type="button" @click="cancelEditDepto" class="bg-gray-400 text-white rounded-md px-3 text-sm hover:bg-gray-500">x</button>
                    <button type="submit" class="bg-indigo-600 text-white rounded-md px-3 text-sm hover:bg-indigo-700">
                        {{ editingDepto ? 'Ok' : '+' }}
                    </button>
                </form>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                <div
                    v-for="d in store.departamentos" :key="d.id"
                    class="p-2 rounded-lg transition-colors flex justify-between items-center group cursor-pointer"
                    :class="selectedDepto?.id === d.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'"
                     @click="selectDepto(d)"
                >
                    <span class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ d.nombre }}</span>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button @click.stop="editDepto(d)" class="text-blue-500 hover:text-blue-700 text-xs py-1">✏️</button>
                         <button @click.stop="removeDepto(d)" class="text-red-500 hover:text-red-700 text-xs py-1">🗑️</button>
                    </div>
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
                    <input v-model="newMuni" :placeholder="editingMuni ? 'Editar Municipio' : 'Nuevo Municipio'" class="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm py-1.5" required>
                    <button v-if="editingMuni" type="button" @click="cancelEditMuni" class="bg-gray-400 text-white rounded-md px-3 text-sm hover:bg-gray-500">x</button>
                    <button type="submit" class="bg-indigo-600 text-white rounded-md px-3 text-sm hover:bg-indigo-700">
                         {{ editingMuni ? 'Ok' : '+' }}
                    </button>
                </form>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                <div v-if="!selectedDepto" class="text-center p-4 text-gray-400 text-sm">Selecciona un departamento</div>
                <div v-else-if="store.municipios.length === 0" class="text-center p-4 text-gray-400 text-sm">Sin municipios</div>
                <div
                    v-for="m in store.municipios" :key="m.id"
                    @click="selectMuni(m)"
                    class="p-2 rounded-lg cursor-pointer transition-colors flex justify-between items-center group"
                    :class="selectedMuni?.id === m.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'"
                >
                     <span class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ m.nombre }}</span>
                     <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button @click.stop="editMuni(m)" class="text-blue-500 hover:text-blue-700 text-xs py-1">✏️</button>
                         <button @click.stop="removeMuni(m)" class="text-red-500 hover:text-red-700 text-xs py-1">🗑️</button>
                    </div>
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
                    <input v-model="newComu" :placeholder="editingComu ? 'Editar Comunidad' : 'Nueva Comunidad'" class="flex-1 rounded-md border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm py-1.5" required>
                    <button v-if="editingComu" type="button" @click="cancelEditComu" class="bg-gray-400 text-white rounded-md px-3 text-sm hover:bg-gray-500">x</button>
                    <button type="submit" class="bg-indigo-600 text-white rounded-md px-3 text-sm hover:bg-indigo-700">
                        {{ editingComu ? 'Ok' : '+' }}
                    </button>
                </form>
            </div>
            <div class="flex-1 overflow-y-auto p-2 space-y-1">
                 <div v-if="!selectedMuni" class="text-center p-4 text-gray-400 text-sm">Selecciona un municipio</div>
                 <div v-else-if="store.comunidades.length === 0" class="text-center p-4 text-gray-400 text-sm">Sin comunidades</div>
                 <div
                    v-for="c in store.comunidades" :key="c.id"
                    class="p-2 rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center group"
                >
                     <span class="font-medium text-gray-700 dark:text-gray-200 truncate">{{ c.nombre }}</span>
                     <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button @click.stop="editComu(c)" class="text-blue-500 hover:text-blue-700 text-xs py-1">✏️</button>
                         <button @click.stop="removeComu(c)" class="text-red-500 hover:text-red-700 text-xs py-1">🗑️</button>
                    </div>
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

// Editing States
const editingDepto = ref(null)
const editingMuni = ref(null)
const editingComu = ref(null)

onMounted(() => {
    store.fetchDepartamentos()
})

const selectDepto = async (depto) => {
    if(editingDepto.value) return // Don't switch if editing
    selectedDepto.value = depto
    selectedMuni.value = null
    store.municipios = []
    store.comunidades = []
    await store.fetchMunicipios(depto.id)
}

const selectMuni = async (muni) => {
    if(editingMuni.value) return
    selectedMuni.value = muni
    store.comunidades = []
    await store.fetchComunidades(muni.id)
}

// --- DEPARTAMENTOS ---
const addDepto = async () => {
    if(!newDepto.value) return
    if(editingDepto.value) {
        await store.updateDepartamento(editingDepto.value.id, newDepto.value)
        editingDepto.value = null
    } else {
        await store.createDepartamento(newDepto.value)
    }
    newDepto.value = ''
}
const editDepto = (d) => {
    editingDepto.value = d
    newDepto.value = d.nombre
}
const cancelEditDepto = () => {
    editingDepto.value = null
    newDepto.value = ''
}
const removeDepto = async (d) => {
    if(!confirm(`¿Eliminar ${d.nombre}?`)) return
    try {
        await store.deleteDepartamento(d.id)
        if(selectedDepto.value?.id === d.id) {
            selectedDepto.value = null
            store.municipios = []
            store.comunidades = []
        }
    } catch(e) { alert(e.response?.data?.error || "Error al eliminar") }
}

// --- MUNICIPIOS ---
const addMuni = async () => {
    if(!newMuni.value || !selectedDepto.value) return
    if(editingMuni.value) {
        await store.updateMunicipio(editingMuni.value.id, newMuni.value)
        editingMuni.value = null
    } else {
        await store.createMunicipio(selectedDepto.value.id, newMuni.value)
    }
    newMuni.value = ''
}
const editMuni = (m) => {
    editingMuni.value = m
    newMuni.value = m.nombre
}
const cancelEditMuni = () => {
    editingMuni.value = null
    newMuni.value = ''
}
const removeMuni = async (m) => {
    if(!confirm(`¿Eliminar ${m.nombre}?`)) return
    try {
        await store.deleteMunicipio(m.id)
        if(selectedMuni.value?.id === m.id) {
            selectedMuni.value = null
            store.comunidades = []
        }
    } catch(e) { alert(e.response?.data?.error || "Error al eliminar") }
}

// --- COMUNIDADES ---
const addComu = async () => {
    if(!newComu.value || !selectedMuni.value) return
    if(editingComu.value) {
        await store.updateComunidad(editingComu.value.id, newComu.value)
        editingComu.value = null
    } else {
        await store.createComunidad(selectedMuni.value.id, newComu.value)
    }
    newComu.value = ''
}
const editComu = (c) => {
    editingComu.value = c
    newComu.value = c.nombre
}
const cancelEditComu = () => {
    editingComu.value = null
    newComu.value = ''
}
const removeComu = async (c) => {
    if(!confirm(`¿Eliminar ${c.nombre}?`)) return
    try {
        await store.deleteComunidad(c.id)
    } catch(e) { alert(e.response?.data?.error || "Error al eliminar") }
}
</script>
