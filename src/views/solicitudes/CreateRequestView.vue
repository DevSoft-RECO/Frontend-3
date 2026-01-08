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

    <!-- TABLA -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Evento</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="text-center"><td colspan="5" class="py-4">Cargando...</td></tr>
            <tr v-else-if="solicitudes.length === 0" class="text-center"><td colspan="5" class="py-4 text-gray-500">No hay solicitudes creadas</td></tr>
            <tr v-for="solicitud in solicitudes" :key="solicitud.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">#{{ solicitud.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {{ new Date(solicitud.fecha_evento).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ solicitud.nombre_solicitante }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(solicitud.estado)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ solicitud.estado }}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                        @click="openTimeline(solicitud)"
                        class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                    >
                        Ver Seguimiento
                    </button>
                    <button
                        v-if="solicitud.estado === 'SOLICITADO'"
                        @click="editSolicitud(solicitud)"
                        class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        Editar
                    </button>
                </td>
            </tr>
        </tbody>
      </table>
    </div>

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

                    <div v-if="!isEditing">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Documento Adjunto (PDF)</label>
                         <input @change="handleFileUpload" type="file" accept="application/pdf" class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required>
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

const loadData = async () => {
    loading.value = true
    try {
        const res = await store.fetchSolicitudes()
        solicitudes.value = res.data
    } catch (e) { console.error(e) }
    finally { loading.value = false }
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
        if (isEditing.value) {
            await store.updateSolicitud(form.id, form)
        } else {
            const formData = new FormData()
            Object.keys(form).forEach(key => {
                if (key !== 'id') formData.append(key, form[key])
            })
            if (file.value) {
                formData.append('documento_adjunto', file.value)
            }
            await store.createSolicitud(formData)
        }
        closeModal()
        loadData()
    } catch (e) {
        alert("Error al guardar: " + (e.response?.data?.message || e.message))
    } finally {
        submitting.value = false
    }
}
</script>
