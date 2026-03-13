<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Auditoría General de Solicitudes</h1>
        <button @click="refreshData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Refrescar
        </button>
    </div>

    <!-- FILTROS -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <!-- ID -->
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">ID Solicitud</label>
                <input v-model="filters.id" type="number" placeholder="#" class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-blue-500" @keyup.enter="loadData(1)">
            </div>
            
            <!-- Agencia -->
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Agencia</label>
                <select v-model="filters.agencia_id" class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-blue-500">
                    <option value="">Todas las Agencias</option>
                    <option v-for="agencia in agencias" :key="agencia.agencia_id" :value="agencia.agencia_id">
                        Agencia #{{ agencia.agencia_id }}
                    </option>
                </select>
            </div>

            <!-- Estado -->
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Estado / Etapa</label>
                <select v-model="filters.estado" class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-blue-500">
                    <option value="">Cualquier Estado</option>
                    <option value="SOLICITADO">Solicitado</option>
                    <option value="EN_GESTION">En Gestión</option>
                    <option value="APROBADO">Aprobado</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="RECHAZADO">Denegado</option>
                </select>
            </div>

            <!-- Fechas -->
            <div class="lg:col-span-2 grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Desde (Evento)</label>
                    <input v-model="filters.fecha_inicio" type="date" class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta (Evento)</label>
                    <input v-model="filters.fecha_fin" type="date" class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:text-white focus:ring-blue-500">
                </div>
            </div>

            <!-- Botones -->
            <div class="lg:col-span-5 flex justify-end gap-2 mt-2">
                <button @click="resetFilters" class="text-gray-500 hover:text-gray-700 px-4 py-2 font-medium">
                    Limpiar Filtros
                </button>
                <button @click="loadData(1)" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-bold shadow-md">
                    Aplicar Filtros
                </button>
            </div>
        </div>
    </div>

    <!-- TABLA AUDITORIA -->
    <BaseTable
        :columns="columns"
        :rows="requests"
        :loading="loading"
        :pagination="pagination"
        @change-page="changePage"
    >
        <template #cell-id="{ value }">
            <span class="font-mono font-bold text-blue-600 dark:text-blue-400">#{{ value }}</span>
        </template>

        <template #cell-agencia_id="{ value }">
             <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold">Agencia {{ value }}</span>
        </template>

        <template #cell-fecha_evento_inicio="{ row }">
             <div class="flex flex-col text-xs">
                <span class="dark:text-gray-300">Del {{ formatDate(row.fecha_evento_inicio) }}</span>
                <span class="text-gray-400 font-medium">Al {{ formatDate(row.fecha_evento_fin) }}</span>
            </div>
        </template>

        <template #cell-estado="{ value }">
             <span :class="getStatusClass(value)" class="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider">
                 {{ value === 'RECHAZADO' ? 'DENEGADO' : value }}
             </span>
        </template>

        <template #cell-actions="{ row }">
             <button @click="openTracking(row)" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                Ver Seguimiento
             </button>
        </template>
    </BaseTable>

    <!-- TIMELINE MODAL (READ ONLY) -->
    <TimelineModal
        :show="showTimeline"
        :request="selectedItem"
        :readOnly="true"
        @close="closeTimeline"
    />

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'
import BaseTable from '@/components/ui/BaseTable.vue'
import TimelineModal from './Seguimiento/TimelineModal.vue'

const store = useSolicitudesStore()
const requests = ref([])
const agencias = ref([])
const loading = ref(false)
const filters = reactive({ id: '', agencia_id: '', estado: '', fecha_inicio: '', fecha_fin: '' })

const columns = [
    { key: 'id', label: 'ID', truncate: true },
    { key: 'agencia_id', label: 'Agencia', truncate: true },
    { key: 'nombre_solicitante', label: 'Solicitante', truncate: false },
    { key: 'fecha_evento_inicio', label: 'Fechas Evento', truncate: false },
    { key: 'estado', label: 'Estado', truncate: false },
    { key: 'actions', label: 'Acciones', align: 'right', truncate: false }
]

const pagination = ref({ current_page: 1, last_page: 1 })

// Modal State
const showTimeline = ref(false)
const selectedItem = ref(null)

onMounted(async () => {
    loadData()
    loadAgencias()
})

const loadData = async (page = 1) => {
    loading.value = true
    try {
        const res = await store.fetchAuditSolicitudes({ ...filters, page })
        if (res.data) {
            requests.value = res.data
            pagination.value = { current_page: res.current_page, last_page: res.last_page }
        }
    } catch (e) { console.error(e) }
    finally { loading.value = false }
}

const loadAgencias = async () => {
    try {
        agencias.value = await store.fetchAgenciasCatalog()
    } catch (e) { console.error(e) }
}

const changePage = (page) => { loadData(page) }

const refreshData = () => { loadData(pagination.value.current_page) }

const resetFilters = () => {
    Object.keys(filters).forEach(k => filters[k] = '')
    loadData(1)
}

const openTracking = (row) => {
    selectedItem.value = row
    showTimeline.value = true
}

const closeTimeline = () => {
    showTimeline.value = false
    selectedItem.value = null
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
}

const getStatusClass = (status) => {
    return status === 'SOLICITADO' ? 'bg-blue-100 text-blue-800' :
           status === 'EN_GESTION' ? 'bg-yellow-100 text-yellow-800' :
           status === 'APROBADO' ? 'bg-green-100 text-green-800' :
           status === 'FINALIZADO' ? 'bg-gray-100 text-gray-800' :
           status === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
}
</script>
