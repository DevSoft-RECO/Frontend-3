<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Categorías de Facturas</h1>
      <button
        @click="openModal()"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
      >
        <span>+ Nueva Categoría</span>
      </button>
    </div>

    <!-- TABLA -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nombre</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="cat in categorias" :key="cat.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{{ cat.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ cat.nombre }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button @click="openModal(cat)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">Editar</button>
                        <button @click="deleteItem(cat)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Eliminar</button>
                    </td>
                </tr>
                <tr v-if="categorias.length === 0">
                    <td colspan="3" class="px-6 py-10 text-center text-gray-500">No hay categorías registradas.</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white">{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>

            <form @submit.prevent="save">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                    <input v-model="form.nombre" type="text" required class="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div class="flex justify-end gap-3">
                    <button type="button" @click="closeModal" class="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
                    <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {{ saving ? 'Guardando...' : 'Guardar' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useFacturasStore } from '@/stores/facturas'

const store = useFacturasStore()
const categorias = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const form = reactive({
    id: null,
    nombre: ''
})

onMounted(() => {
    loadData()
})

const loadData = async () => {
    try {
        const res = await store.fetchCategorias()
        categorias.value = Array.isArray(res) ? res : []
    } catch (e) {
        console.error(e)
        categorias.value = []
    }
}

const openModal = (item = null) => {
    if (item) {
        isEditing.value = true
        form.id = item.id
        form.nombre = item.nombre
    } else {
        isEditing.value = false
        form.id = null
        form.nombre = ''
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const save = async () => {
    if (!form.nombre.trim()) return
    saving.value = true
    try {
        if (isEditing.value) {
            await store.updateCategoria(form.id, { nombre: form.nombre })
        } else {
            await store.createCategoria({ nombre: form.nombre })
        }
        await loadData()
        closeModal()
    } catch (e) {
        alert("Error: " + (e.response?.data?.message || e.message))
    } finally {
        saving.value = false
    }
}

const deleteItem = async (item) => {
    if (!confirm(`¿Eliminar la categoría "${item.nombre}"?`)) return
    try {
        await store.deleteCategoria(item.id)
        loadData()
    } catch (e) {
        alert("Error: " + (e.response?.data?.error || e.message))
    }
}
</script>
