<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Carga de Evidencias</h1>

    <!-- Toggle: Pendientes vs Historico -->
    <div class="mb-4">
        <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="showFinished" @change="loadData" class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {{ showFinished ? 'Ver Finalizadas' : 'Ver Pendientes (Aprobadas)' }}
            </span>
        </label>
    </div>

    <!-- TABLA -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="loading" class="text-center"><td colspan="5" class="py-4">Cargando...</td></tr>
                <tr v-else-if="requests.length === 0" class="text-center"><td colspan="5" class="py-4 text-gray-500">No hay solicitudes en este estado</td></tr>
                <tr v-for="req in requests" :key="req.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-6 py-4 text-sm dark:text-white">#{{ req.id }}</td>
                    <td class="px-6 py-4 text-sm dark:text-gray-300">{{ req.nombre_solicitante }}</td>
                    <td class="px-6 py-4 text-sm dark:text-gray-300">{{ req.responsable_asignado }}</td>
                    <td class="px-6 py-4">
                        <span :class="req.estado === 'FINALIZADO' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'" class="px-2 text-xs font-semibold rounded-full">
                            {{ req.estado }}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <button
                            v-if="req.estado === 'APROBADO'"
                            @click="openUpload(req)"
                            class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs transition"
                         >
                            Subir Evidencias
                         </button>
                         <span v-else class="text-gray-400 text-xs">Completado</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- MODAL FINALIZAR -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
            <h3 class="text-lg font-bold mb-4 dark:text-white">Cargar Evidencias - Solicitud #{{ selectedItem?.id }}</h3>
            <form @submit.prevent="submitEvidence" class="space-y-4">

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Entrega</label>
                    <input @change="e => handleFile(e, 'entrega')" type="file" accept="image/*" class="mt-1 w-full dark:text-white" required>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Carta Conocimiento</label>
                    <input @change="e => handleFile(e, 'conocimiento')" type="file" accept="image/*" class="mt-1 w-full dark:text-white" required>
                </div>

                <div class="flex justify-end mt-6 gap-2">
                    <button type="button" @click="closeModal" class="px-3 py-2 border rounded dark:text-white">Cancelar</button>
                    <button type="submit" :disabled="submitting" class="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
                        {{ submitting ? 'Subiendo...' : 'Finalizar Proceso' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'

const store = useSolicitudesStore()
const requests = ref([])
const loading = ref(false)
const showFinished = ref(false)
const showModal = ref(false)
const submitting = ref(false)
const selectedItem = ref(null)

const files = {
    entrega: null,
    conocimiento: null
}

onMounted(() => loadData())

const loadData = async () => {
    loading.value = true
    try {
        const status = showFinished.value ? 'FINALIZADO' : 'APROBADO'
        const res = await store.fetchSolicitudes({ estado: status })
        requests.value = res.data
    } catch(e) { console.error(e) }
    finally { loading.value = false }
}

const openUpload = (item) => {
    selectedItem.value = item
    files.entrega = null
    files.conocimiento = null
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedItem.value = null
}

const handleFile = (event, type) => {
    files[type] = event.target.files[0]
}

const submitEvidence = async () => {
    if(!files.entrega || !files.conocimiento) return alert("Ambas fotos son requeridas")

    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('foto_entrega', files.entrega)
        formData.append('foto_conocimiento', files.conocimiento)

        await store.finalizarSolicitud(selectedItem.value.id, formData)
        closeModal()
        loadData() // Refrescar lista (item desaparecerá de pendientes)
    } catch (e) {
        alert("Error: " + (e.response?.data?.message || e.message))
    } finally {
        submitting.value = false
    }
}
</script>
