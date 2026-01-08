<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Bandeja de Entrada Solicitudes</h1>

    <!-- FILTROS -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
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
             </select>
        </div>
        <button @click="loadData(1)" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
            Filtrar
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

        <template #cell-fecha_evento="{ value }">
            <span class="dark:text-gray-300">{{ value }}</span>
        </template>

        <template #cell-nombre_solicitante="{ value }">
             <span class="dark:text-gray-300">{{ value }}</span>
        </template>

        <template #cell-estado="{ value }">
             <span :class="getStatusClass(value)" class="px-2 text-xs font-semibold rounded-full">{{ value }}</span>
        </template>

        <template #cell-actions="{ row }">
             <div class="flex justify-end">
                 <button @click="openModal(row)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 font-bold">
                    {{ row.estado === 'SOLICITADO' ? 'Gestionar' : (row.estado === 'EN_GESTION' ? 'Aprobar/Revisar' : 'Ver Detalle') }}
                 </button>
             </div>
        </template>
    </BaseTable>

    <!-- MAIN ACTION MODAL -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">

            <!-- LEFT: DETALLE SOLICITUD -->
            <div class="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                    <span class="bg-indigo-600 text-white text-xs px-2 py-1 rounded">#{{ selectedItem?.id }}</span>
                    Detalle de Solicitud
                </h3>

                <div class="space-y-4 text-sm">
                    <div>
                        <span class="block text-gray-500 text-xs uppercase font-bold">Solicitante</span>
                        <p class="dark:text-gray-200 font-medium">{{ selectedItem?.nombre_solicitante }}</p>
                        <p class="dark:text-gray-400 text-xs">{{ selectedItem?.telefono }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <span class="block text-gray-500 text-xs uppercase font-bold">Fecha Solicitud</span>
                            <p class="dark:text-gray-200">{{ selectedItem?.fecha_solicitud?.split('T')[0] }}</p>
                        </div>
                        <div>
                            <span class="block text-gray-500 text-xs uppercase font-bold">Fecha Evento</span>
                            <p class="dark:text-gray-200">{{ selectedItem?.fecha_evento?.split('T')[0] }}</p>
                        </div>
                    </div>
                    <div>
                        <span class="block text-gray-500 text-xs uppercase font-bold">Comentario Inicial</span>
                         <div class="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                             <p class="dark:text-gray-300 italic">"{{ selectedItem?.comentario_solicitud }}"</p>
                         </div>
                    </div>
                     <div>
                        <span class="block text-gray-500 text-xs uppercase font-bold">Documento Adjunto</span>
                        <a v-if="selectedItem?.path_documento_adjunto" @click.prevent="getFileUrl(selectedItem.id, 'adjunto')" href="#" class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline mt-1 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Ver PDF Original
                        </a>
                        <span v-else class="text-gray-400 italic">No adjunto</span>
                    </div>

                    <!-- PREVIEW HISTORIAL -->
                    <div v-if="selectedItem?.comentario_gestion" class="pt-4 border-t dark:border-gray-700">
                        <span class="block text-gray-500 text-xs uppercase font-bold">Comentario Gestión</span>
                        <p class="dark:text-gray-300">{{ selectedItem.comentario_gestion }}</p>
                    </div>
                </div>
            </div>

            <!-- RIGHT: ACCIONES (WORKFLOW) -->
            <div class="p-6 md:w-1/2 flex flex-col">
                <div class="flex justify-between mb-4">
                     <h3 class="text-xl font-bold dark:text-white">Acciones</h3>
                     <button @click="closeModal" class="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div class="flex-1 overflow-y-auto pr-2">

                    <!-- ACCION 1: GESTIONAR (Si esta SOLICITADO) -->
                    <div v-if="selectedItem?.estado === 'SOLICITADO'" class="space-y-4">
                        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 class="font-bold text-blue-800 dark:text-blue-300 mb-2">Paso 1: Revisión Inicial</h4>
                            <p class="text-sm text-blue-600 dark:text-blue-400 mb-2">Revisa el documento adjunto. Si todo está correcto, agrega un comentario para pasar a estado "En Gestión".</p>

                            <textarea v-model="gestionComment" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500" placeholder="Ej. Solicitud revisada, se procede a cotizar..." rows="3"></textarea>

                            <div class="flex justify-end mt-2 gap-2">
                                <button @click="openRechazoModal" class="text-red-600 hover:text-red-800 text-sm font-medium px-2">Rechazar</button>
                                <button @click="submitGestion" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition shadow">
                                    Iniciar Gestión
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ACCION 2: APROBAR (Si esta EN_GESTION) -->
                    <div v-else-if="selectedItem?.estado === 'EN_GESTION'" class="space-y-4">
                         <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                            <h4 class="font-bold text-green-800 dark:text-green-300 mb-2">Paso 2: Aprobación y Formalización</h4>
                            <p class="text-sm text-green-600 dark:text-green-400 mb-4">Selecciona el tipo de apoyo y sube la carta firmada para aprobar la solicitud.</p>

                            <form @submit.prevent="submitAprobar" class="space-y-3">
                                <div>
                                    <label class="block text-sm font-medium dark:text-gray-300">Tipo de Apoyo</label>
                                    <select v-model="aprobarForm.tipo_apoyo_id" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
                                        <option value="">Selecciona...</option>
                                        <option v-for="t in store.tiposApoyo" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium dark:text-gray-300">Responsable Asignado</label>
                                    <input v-model="aprobarForm.responsable_asignado" type="text" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Nombre del responsable" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium dark:text-gray-300">Monto Aprobado (Q)</label>
                                    <input v-model="aprobarForm.monto" type="number" step="0.01" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="0.00">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium dark:text-gray-300">Carta/Nota Firmada (PDF)</label>
                                    <input @change="handleFileAprobar" type="file" accept="application/pdf" class="w-full text-sm dark:text-white" required>
                                </div>

                                <div class="flex justify-between items-center mt-4 pt-2 border-t dark:border-green-800/30">
                                    <button type="button" @click="openRechazoModal" class="text-red-600 hover:text-red-800 text-sm">Rechazar</button>
                                    <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition shadow flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                        Aprobar
                                    </button>
                                </div>
                            </form>
                         </div>
                    </div>

                    <!-- INFO ONLY -->
                    <div v-else class="text-center p-8 text-gray-500">
                        <p v-if="selectedItem?.estado === 'APROBADO'" class="text-green-600 font-bold mb-2">Solicitud Aprobada</p>
                        <p v-if="selectedItem?.estado === 'FINALIZADO'" class="text-gray-800 dark:text-white font-bold mb-2">Proceso Finalizado</p>
                        <p class="text-sm">No hay acciones pendientes para esta etapa.</p>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- MODAL RECHAZO -->
    <div v-if="showRechazoModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
         <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm shadow-2xl border-2 border-red-500">
            <h3 class="text-lg font-bold mb-4 text-red-600">Rechazar Solicitud</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Esta acción no se puede deshacer. Por favor indica el motivo.</p>
            <textarea v-model="rechazoReason" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white" placeholder="Motivo del rechazo..." rows="3"></textarea>
            <div class="flex justify-end mt-4 gap-2">
                <button @click="showRechazoModal = false" class="px-3 py-2 border rounded dark:text-white text-sm">Cancelar</button>
                <button @click="submitRechazo" class="px-3 py-2 bg-red-600 text-white rounded text-sm font-bold">Confirmar Rechazo</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'
import BaseTable from '@/components/ui/BaseTable.vue'

const store = useSolicitudesStore()
const requests = ref([])
const filters = reactive({ fecha_inicio: '', fecha_fin: '', estado: '' })
const loading = ref(false)

// COLUMNAS BASE TABLE
const columns = [
    { key: 'id', label: 'ID', truncate: true },
    { key: 'fecha_evento', label: 'Evento', truncate: true },
    { key: 'nombre_solicitante', label: 'Solicitante', truncate: true },
    { key: 'estado', label: 'Estado', truncate: false },
    { key: 'actions', label: 'Acciones', align: 'right', truncate: false }
]

const pagination = ref({
    current_page: 1,
    last_page: 1
})

// Modal State
const showDetailModal = ref(false)
const showRechazoModal = ref(false)
const selectedItem = ref(null)

// Actions State
const gestionComment = ref('')
const rechazoReason = ref('')
const aprobarForm = reactive({ responsable_asignado: '', monto: '', tipo_apoyo_id: '' })
const aprobarFile = ref(null)

onMounted(async () => {
    loadData()
    await store.fetchTiposApoyo() // Cargar catalogo
})

const loadData = async (page = 1) => {
    loading.value = true
    try {
        // Assuming filters is optional 2nd arg or merged
        const res = await store.fetchSolicitudes({ ...filters, page })

        if (res.data && Array.isArray(res.data)) {
             requests.value = res.data
             // Mapping pagination
             if (res.meta) {
                 pagination.value = {
                     current_page: res.meta.current_page,
                     last_page: res.meta.last_page
                 }
             } else if (res.current_page) {
                 pagination.value = {
                     current_page: res.current_page,
                     last_page: res.last_page
                 }
             }
        } else {
             requests.value = res.data || []
        }
    } catch(e) { console.error(e) }
    finally { loading.value = false }
}

const changePage = (page) => {
    loadData(page)
}

const getStatusClass = (status) => {
    return status === 'SOLICITADO' ? 'bg-blue-100 text-blue-800' :
           status === 'EN_GESTION' ? 'bg-yellow-100 text-yellow-800' :
           status === 'APROBADO' ? 'bg-green-100 text-green-800' :
           status === 'FINALIZADO' ? 'bg-gray-100 text-gray-800' :
           status === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
}

const getFileUrl = async (id, type) => {
    try {
        const url = await store.getFileUrl(id, type)
        if(url) window.open(url, '_blank')
    } catch(e) { alert("Error al abrir archivo") }
}

const openModal = (item) => {
    selectedItem.value = item
    showDetailModal.value = true
    // Reset forms
    gestionComment.value = ''
    rechazoReason.value = ''
    Object.assign(aprobarForm, { responsable_asignado: '', monto: '', tipo_apoyo_id: '' })
    aprobarFile.value = null
}

const closeModal = () => {
    showDetailModal.value = false
    selectedItem.value = null
}

const openRechazoModal = () => {
    rechazoReason.value = ''
    showRechazoModal.value = true
}

// SUBMITS
const submitGestion = async () => {
    if(!gestionComment.value) return alert("Escribe un comentario");
    try {
        await store.gestionarSolicitud(selectedItem.value.id, gestionComment.value)
        closeModal()
        loadData()
    } catch(e) { alert("Error: " + e.message) }
}

const submitRechazo = async () => {
    if(!rechazoReason.value) return alert("Escribe el motivo");
    try {
        await store.rechazarSolicitud(selectedItem.value.id, rechazoReason.value)
        showRechazoModal.value = false
        closeModal()
        loadData()
    } catch(e) { alert("Error: " + e.message) }
}

const handleFileAprobar = (e) => aprobarFile.value = e.target.files[0]
const submitAprobar = async () => {
    if(!aprobarFile.value || !aprobarForm.tipo_apoyo_id || !aprobarForm.responsable_asignado) return alert('Completa todos los campos obligatorios');

    try {
        const formData = new FormData()
        formData.append('responsable_asignado', aprobarForm.responsable_asignado)
        formData.append('monto', aprobarForm.monto || 0)
        formData.append('tipo_apoyo_id', aprobarForm.tipo_apoyo_id)
        formData.append('documento_firmado', aprobarFile.value)

        await store.aprobarSolicitud(selectedItem.value.id, formData)
        closeModal()
        loadData()
    } catch(e) { alert("Error: " + e.message) }
}
</script>
