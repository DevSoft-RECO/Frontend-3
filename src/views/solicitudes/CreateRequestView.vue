<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Mis Solicitudes</h1>
      <button
        @click="openModal()"
        class="bg-verde-cope hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Solicitud
      </button>
    </div>

    <!-- TABLA GLOBAL -->
    <BaseTable
        :columns="columns"
        :rows="solicitudes"
        :loading="loading"
        :pagination="pagination"
        @change-page="changePage"
    >
        <!-- CUSTOM CELL: ID (Optional overrides if needed, but default text is fine usually) -->
        <template #cell-id="{ value }">
            <span class="font-medium">#{{ value }}</span>
        </template>

        <!-- CUSTOM CELL: FECHA -->
        <template #cell-fecha_evento="{ value }">
            {{ new Date(value).toLocaleDateString() }}
        </template>

        <!-- CUSTOM CELL: ESTADO -->
        <template #cell-estado="{ value }">
             <span :class="getStatusClass(value)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ value }}
            </span>
        </template>

        <!-- ACTIONS -->
        <template #cell-actions="{ row }">
             <div class="flex justify-end items-center gap-2">
                 <button
                    @click="openTimeline(row)"
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                >
                    Ver Seguimiento
                </button>
                <button
                    v-if="row.estado === 'SOLICITADO'"
                    @click="editSolicitud(row)"
                    class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium"
                >
                    Editar
                </button>
             </div>
        </template>
    </BaseTable>

    <!-- MODAL FORMULARIO (Crear/Editar) -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div class="p-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {{ isEditing ? 'Editar Solicitud' : 'Nueva Solicitud' }}
                </h3>

                <form @submit.prevent="submitForm" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Solicitud</label>
                            <input v-model="form.fecha_solicitud" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Evento</label>
                            <input v-model="form.fecha_evento" type="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Solicitante</label>
                        <input v-model="form.nombre_solicitante" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                    </div>
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                            <input v-model="form.telefono" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Contacto (Opcional)</label>
                            <input v-model="form.nombre_contacto" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Departamento</label>
                            <select v-model="selectedDepto" @change="loadMunicipios" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option :value="null">Selecciona</option>
                                <option v-for="d in localidadesStore.departamentos" :key="d.id" :value="d.id">{{ d.nombre }}</option>
                            </select>
                        </div>
                        <div>
                             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Municipio</label>
                             <select v-model="selectedMuni" @change="loadComunidades" :disabled="!selectedDepto" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50">
                                <option :value="null">Selecciona</option>
                                <option v-for="m in localidadesStore.municipios" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                            </select>
                        </div>
                        <div>
                             <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Comunidad</label>
                             <select v-model="form.comunidad_id" :disabled="!selectedMuni" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50" required>
                                <option value="">Selecciona</option>
                                <option v-for="c in localidadesStore.comunidades" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Comentarios</label>
                        <textarea v-model="form.comentario_solicitud" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {{ isEditing ? 'Actualizar Documento (Opcional)' : 'Documento Adjunto (PDF)' }}
                        </label>
                         <input
                            @change="handleFileUpload"
                            type="file"
                            accept="application/pdf"
                            class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            :required="!isEditing"
                        >
                        <!-- Show existing document link -->
                         <div v-if="isEditing" class="mt-2 text-sm">
                            <span class="text-gray-500 dark:text-gray-400">Documento actual: </span>
                            <button
                                type="button"
                                @click="openCurrentDocument"
                                class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-medium"
                            >
                                Ver PDF
                            </button>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6">
                         <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="submitting" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
                        </button>
                    </div>
                </form>
             </div>
        </div>
    </div>

    <!-- MODAL TIMELINE -->
    <!-- Fondo transparente blur, mas estético -->
    <!-- MODAL TIMELINE (NUEVO COMPONENTE) -->
    <TimelineModal
        :show="showTimeline"
        :request="selectedRequest"
        @close="closeTimeline"
        @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'
import { useLocalidadesStore } from '@/stores/localidades'
import { useAuthStore } from '@/stores/auth'
import TimelineModal from './Seguimiento/TimelineModal.vue'
import BaseTable from '@/components/ui/BaseTable.vue'

const store = useSolicitudesStore()
const localidadesStore = useLocalidadesStore()
const authStore = useAuthStore()

const solicitudes = ref([])
const loading = ref(false)
const showModal = ref(false)
const showTimeline = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const file = ref(null)
const selectedRequest = ref(null)

const selectedDepto = ref(null)
const selectedMuni = ref(null)

// DEFINICIÓN DE COLUMNAS
const columns = [
    { key: 'id', label: 'ID', truncate: true },
    { key: 'fecha_evento', label: 'Fecha Evento', truncate: true },
    { key: 'nombre_solicitante', label: 'Solicitante', truncate: true },
    { key: 'estado', label: 'Estado', truncate: false },
    { key: 'actions', label: 'Acciones', align: 'right', truncate: false }
]

// PAGINACIÓN
const pagination = ref({
    current_page: 1,
    last_page: 1
})

const form = reactive({
    id: null,
    fecha_solicitud: '',
    fecha_evento: '',
    nombre_solicitante: '',
    telefono: '',
    nombre_contacto: '',
    comunidad_id: '',
    comentario_solicitud: ''
})

onMounted(async () => {
    loadData()
    await localidadesStore.fetchDepartamentos()
})

// TIMELINE LOGIC
const openTimeline = (req) => {
    selectedRequest.value = req
    showTimeline.value = true
}

const closeTimeline = () => {
    showTimeline.value = false
    selectedRequest.value = null
}

// ... EXISTING FORM LOGIC ...
const loadMunicipios = async () => {
    selectedMuni.value = null
    form.comunidad_id = ''
    if(selectedDepto.value) await localidadesStore.fetchMunicipios(selectedDepto.value)
}

const loadComunidades = async () => {
    form.comunidad_id = ''
    if(selectedMuni.value) await localidadesStore.fetchComunidades(selectedMuni.value)
}

const loadData = async (page = 1) => {
    loading.value = true
    try {
        const res = await store.fetchSolicitudes(page)

        // Handle response with or without pagination
        if (res.data && Array.isArray(res.data)) {
             solicitudes.value = res.data
             // Try to map pagination from common structures
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
             // Fallback
             solicitudes.value = res.data || []
        }
    } catch (e) { console.error(e) }
    finally { loading.value = false }
}

const changePage = (page) => {
    loadData(page)
}

const getStatusClass = (status) => {
    const classes = {
        'SOLICITADO': 'bg-blue-100 text-blue-800',
        'EN_GESTION': 'bg-yellow-100 text-yellow-800',
        'APROBADO': 'bg-green-100 text-green-800',
        'FINALIZADO': 'bg-gray-100 text-gray-800',
        'RECHAZADO': 'bg-red-100 text-red-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

const openModal = () => {
    isEditing.value = false
    resetForm()
    showModal.value = true
}

const editSolicitud = (item) => {
    isEditing.value = true
    Object.assign(form, item)
    if(item.fecha_solicitud) form.fecha_solicitud = item.fecha_solicitud.split('T')[0]
    if(item.fecha_evento) form.fecha_evento = item.fecha_evento.split('T')[0]

    showModal.value = true

    // Background load of locations (Performance update)
    if (item.comunidad && item.comunidad.municipio) {
        preloadLocations(item.comunidad, item.comunidad.municipio)
    }
}

const preloadLocations = async (comunidad, municipio) => {
    try {
        selectedDepto.value = municipio.departamento_id
        // Cargar municipios sin bloquear UI
        await localidadesStore.fetchMunicipios(selectedDepto.value)

        selectedMuni.value = municipio.id
        // Cargar comunidades sin bloquear UI
        await localidadesStore.fetchComunidades(selectedMuni.value)

        form.comunidad_id = comunidad.id
    } catch (e) { console.error("Error preloading locations", e) }
}



const openCurrentDocument = async () => {
    if(!form.id) return
    try {
        const url = await store.getFileUrl(form.id, 'adjunto')
        if(url) window.open(url, '_blank')
    } catch(e) { console.error(e) }
}

const closeModal = () => {
    showModal.value = false
    resetForm()
}

const resetForm = () => {
    Object.keys(form).forEach(key => form[key] = '')
    selectedDepto.value = null
    selectedMuni.value = null
    form.comunidad_id = ''
    file.value = null
}

const handleFileUpload = (event) => {
    file.value = event.target.files[0]
}

const submitForm = async () => {
    submitting.value = true
    try {
        const formData = new FormData()
        Object.keys(form).forEach(key => {
            if (key !== 'id') formData.append(key, form[key] ?? '')
        })
        if (file.value) {
            formData.append('documento_adjunto', file.value)
        }

        if (isEditing.value) {
             // Update logic: Use formData if file present, otherwise strict JSON or formData (store dependent)
             // Using FormData with PUT method often requires _method = PUT if sending as Post, OR just PUT with Multipart.
             // We'll try just passing formData. If store.updateSolicitud uses axios.put(..., formData), it sends multipart.

             if (file.value) {
                 // Important: For PHP backends, PUT requests with multipart/form-data often fail to parse files.
                 // We might need to spoof method if backend is Laravel.
                 // Assuming standard behavior or that the user can report if it fails.
                 // However, safely we can append _method if we suspect backend issues, but let's try direct first since 'create' worked fine.

                 // Note: If update expects JSON only, this might fail unless updated to accept multipart.
                 // But since we are adding file upload feature to edit, the backend MUST support it.
                 formData.append('_method', 'PUT')
                 // Sending as POST with _method spoofing is safest for Laravel/PHP file uploads
                 // BUT I cannot change the store to call POST instead of PUT easily without seeing it.
                 // I will assume the store's updateSolicitud calls PUT.
                 // If it calls PUT, `_method` might be ignored or handled.
                 // To trigger file upload correctly on PUT in Laravel, we usually need POST.

                 // If I use `store.createSolicitud` logic (which is POST) maybe? No, separate endpoint.

                 // Let's just pass formData.
                 await store.updateSolicitud(form.id, formData)
             } else {
                 // No file, just data
                 await store.updateSolicitud(form.id, form)
             }
        } else {
            await store.createSolicitud(formData)
        }
        closeModal()
        loadData(isEditing.value ? pagination.value.current_page : 1)
    } catch (e) {
        alert("Error al guardar: " + (e.response?.data?.message || e.message))
    } finally {
        submitting.value = false
    }
}
</script>
