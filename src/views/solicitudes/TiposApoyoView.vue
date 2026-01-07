<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Tipos de Apoyo</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Lista de Tipos de Apoyo -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
             <div class="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h2 class="font-bold text-lg dark:text-white">Listado</h2>
            </div>
            <ul class="divide-y divide-gray-200 dark:divide-gray-700">
                <li v-if="loading" class="p-4 text-center text-gray-500">Cargando...</li>
                <li v-else-if="store.tiposApoyo.length === 0" class="p-4 text-center text-gray-500">No hay tipos de apoyo registrados.</li>
                <li v-for="tipo in store.tiposApoyo" :key="tipo.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center">
                    <span class="text-gray-900 dark:text-gray-100 font-medium">{{ tipo.nombre }}</span>
                    <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-800" v-if="tipo.activo">Activo</span>
                    <span class="text-xs px-2 py-1 rounded bg-red-100 text-red-800" v-else>Inactivo</span>
                </li>
            </ul>
        </div>

        <!-- Formulario Crear Registro -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow h-fit">
            <div class="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h2 class="font-bold text-lg dark:text-white">Nuevo Tipo de Apoyo</h2>
            </div>
            <div class="p-6">
                <form @submit.prevent="submitForm">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input v-model="nombre" type="text" class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required placeholder="Ej. Kit Escolar, Alimentos...">
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" :disabled="submitting" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50">
                            {{ submitting ? 'Guardando...' : 'Guardar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'

const store = useSolicitudesStore()
const loading = ref(false)
const submitting = ref(false)
const nombre = ref('')

onMounted(async () => {
    loading.value = true
    try {
        await store.fetchTiposApoyo()
    } finally {
        loading.value = false
    }
})

const submitForm = async () => {
    if(!nombre.value) return
    submitting.value = true
    try {
        await store.createTipoApoyo(nombre.value)
        nombre.value = ''
        alert('Tipo de apoyo creado correctamente')
    } catch(e) {
        alert("Error: " + (e.response?.data?.message || e.message))
    } finally {
        submitting.value = false
    }
}
</script>
