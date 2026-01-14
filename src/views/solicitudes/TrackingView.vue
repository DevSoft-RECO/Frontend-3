<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Bandeja de Entrada Solicitudes</h1>

    <!-- FILTROS -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
        <div class="w-full md:w-auto">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Buscar por ID</label>
            <div class="flex gap-2">
                <input v-model="filters.id" type="number" placeholder="#" class="mt-1 block w-24 rounded-md border-gray-300 dark:bg-gray-700 dark:text-white" @keyup.enter="loadData(1)">
                <button @click="loadData(1)" class="mt-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded text-gray-600 dark:text-gray-300 transition" title="Buscar ID">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
            </div>
        </div>
        <div class="hidden md:block w-px bg-gray-300 h-10 mx-2"></div>

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">De fecha evento</label>
            <input v-model="filters.fecha_inicio" type="date" class="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">A fecha evento</label>
            <input v-model="filters.fecha_fin" type="date" class="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white">
        </div>
        <div>
             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
             <select v-model="filters.estado" class="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:text-white">
                 <option value="">Todos</option>
                 <option value="SOLICITADO">Solicitado</option>
                 <option value="EN_GESTION">En Gestión</option>
                 <option value="APROBADO">Aprobado</option>
                 <option value="FINALIZADO">Finalizado</option>
                 <option value="RECHAZADO">Denegado</option>
             </select>
        </div>
        <button @click="loadData(1)" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            Filtrar
        </button>
        <button @click="refreshData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Actualizar Lista
        </button>
        <button @click="exportCsv" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Exportar CSV
        </button>
    </div>

    <!-- TABLA COMPONENTE -->
    <BaseTable
        :columns="columns"
        :rows="requests"
        :loading="loading"
        :pagination="pagination"
        @change-page="changePage"
    >
        <template #cell-id="{ value }">
            <span class="font-medium dark:text-white">#{{ value }}</span>
        </template>

        <template #cell-fecha_evento_inicio="{ row }">
            <div class="flex flex-col text-xs">
                <span class="dark:text-gray-300 font-medium">Del: {{ row.fecha_evento_inicio ? new Date(row.fecha_evento_inicio).toLocaleDateString() : '-' }}</span>
                <span class="dark:text-gray-400">Al: {{ row.fecha_evento_fin ? new Date(row.fecha_evento_fin).toLocaleDateString() : '-' }}</span>
            </div>
        </template>

        <template #cell-nombre_solicitante="{ value }">
             <span class="dark:text-gray-300">{{ value }}</span>
        </template>

        <template #cell-estado="{ value }">
             <span :class="getStatusClass(value)" class="px-2 text-xs font-semibold rounded-full">{{ value === 'RECHAZADO' ? 'DENEGADO' : value }}</span>
        </template>

        <template #cell-actions="{ row }">
             <div class="flex justify-end">
                 <button @click="openModal(row)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 font-bold">
                    {{ row.estado === 'SOLICITADO' ? 'Gestionar' : (row.estado === 'EN_GESTION' ? 'Aprobar/Revisar' : 'Ver Detalle') }}
                 </button>
             </div>
        </template>
    </BaseTable>

    <!-- MANAGEMENT MODAL (NUEVO) -->
    <ManagementModal
        :show="showManagementModal"
        :request="selectedItem"
        @close="closeModal"
        @refresh="handleModalRefresh"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'
import BaseTable from '@/components/ui/BaseTable.vue'
import ManagementModal from './Seguimiento_gestion/ManagementModal.vue'
import Swal from 'sweetalert2'

const store = useSolicitudesStore()
const requests = ref([])
const filters = reactive({ id: '', fecha_inicio: '', fecha_fin: '', estado: '' })
const loading = ref(false)

// COLUMNAS BASE TABLE
const columns = [
    { key: 'id', label: 'ID', truncate: true },
    { key: 'agencia_id', label: 'Agenc.', truncate: true },
    { key: 'fecha_evento_inicio', label: 'Evento', truncate: true },
    { key: 'nombre_solicitante', label: 'Solicitante', truncate: true },
    { key: 'estado', label: 'Estado', truncate: false },
    { key: 'actions', label: 'Acciones', align: 'right', truncate: false }
]

const pagination = ref({
    current_page: 1,
    last_page: 1
})

// Modal State
const showManagementModal = ref(false)
const selectedItem = ref(null)

// Auto-refresh every 10 minutes
let refreshInterval = null

onMounted(async () => {
    await loadData()
    // Set up auto-refresh every 10 minutes (600000ms)
    refreshInterval = setInterval(() => {
        loadData(pagination.value.current_page || 1, true) // Force refresh on auto-update
    }, 600000)
})

onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
})

const loadData = async (page = 1, forceRefresh = false) => {
    loading.value = true
    try {
        const res = await store.fetchSolicitudes({ ...filters, page }, forceRefresh)
        if (res.data && Array.isArray(res.data)) {
             requests.value = res.data

             // Re-sync selectedItem if open to ensure modal updates
             if (selectedItem.value) {
                 const updated = requests.value.find(r => r.id === selectedItem.value.id)
                 if (updated) selectedItem.value = updated
             }

             if (res.meta) {
                 pagination.value = { current_page: res.meta.current_page, last_page: res.meta.last_page }
             } else if (res.current_page) {
                 pagination.value = { current_page: res.current_page, last_page: res.last_page }
             }
        } else {
             requests.value = res.data || []
        }
    } catch(e) { console.error(e) }
    finally { loading.value = false }
}

const changePage = (page) => { loadData(page) }

const refreshData = () => {
    loadData(pagination.value.current_page || 1, true) // Force refresh
}

const handleModalRefresh = () => {
    loadData(pagination.value.current_page || 1, true)
}

const getStatusClass = (status) => {
    return status === 'SOLICITADO' ? 'bg-blue-100 text-blue-800' :
           status === 'EN_GESTION' ? 'bg-yellow-100 text-yellow-800' :
           status === 'APROBADO' ? 'bg-green-100 text-green-800' :
           status === 'FINALIZADO' ? 'bg-gray-100 text-gray-800' :
           status === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
}

const openModal = (item) => {
    selectedItem.value = item
    showManagementModal.value = true
}


const closeModal = () => {
    showManagementModal.value = false
    selectedItem.value = null
}

const exportCsv = () => {
    const token = localStorage.getItem('access_token')
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const url = `${baseUrl}/api/solicitudes/export/csv`

    // Create a temporary link to trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '')
    link.style.display = 'none'

    // Add authorization header via fetch and blob
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.blob())
    .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob)
        link.href = blobUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
    })
    .catch(error => {
        console.error('Error downloading CSV:', error)
        Swal.fire({
            icon: 'error',
            title: 'Error de Exportación',
            text: 'Hubo un problema al descargar el archivo CSV.'
        })
    })
}

</script>
