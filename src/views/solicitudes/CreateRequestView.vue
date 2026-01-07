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
    <div v-if="showTimeline" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div class="p-6">
                 <div class="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
                    <div>
                         <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
                            Seguimiento Solicitud #{{ selectedRequest?.id }}
                        </h3>
                        <span class="text-sm text-gray-500">{{ selectedRequest?.nombre_solicitante }}</span>
                    </div>

                    <button @click="closeTimeline" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="flex flex-col md:flex-row gap-6">

                    <!-- COLUMNA IZQUIERDA: HISTORIAL VERTICAL COMPLETO -->
                    <div class="md:w-1/2 space-y-8 relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 ml-2">

                        <!-- PASO 1: SOLICITADO -->
                        <div class="relative">
                            <div class="absolute -left-[25px] top-0 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-blue-500 text-white text-xs font-bold">1</div>
                            <h4 class="font-bold text-gray-900 dark:text-white mb-2">Solicitud Creada</h4>
                            <div class="bg-gray-50 dark:bg-gray-900/50 p-3 rounded text-sm space-y-2">
                                <p><span class="font-bold">Fecha:</span> {{ selectedRequest?.fecha_solicitud?.split('T')[0] }}</p>
                                <p><span class="font-bold">Comentario:</span> "{{ selectedRequest?.comentario_solicitud }}"</p>
                                <SecureDoc
                                    v-if="selectedRequest?.path_documento_adjunto"
                                    :id="selectedRequest.id"
                                    type="adjunto"
                                    customClass="text-indigo-600 hover:underline flex items-center gap-1 text-xs font-bold"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Ver Solicitud Original (PDF)
                                </SecureDoc>
                            </div>
                        </div>

                         <!-- PASO 2: EN GESTION -->
                        <div class="relative" :class="{'opacity-50': ['SOLICITADO'].includes(selectedRequest?.estado)}">
                            <div class="absolute -left-[25px] top-0 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-yellow-500 text-white text-xs font-bold">2</div>
                            <h4 class="font-bold text-gray-900 dark:text-white mb-2">En Gestión</h4>
                            <div v-if="selectedRequest?.comentario_gestion" class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm">
                                <p><span class="font-bold text-yellow-800 dark:text-yellow-400">Comentario Admin:</span> {{ selectedRequest.comentario_gestion }}</p>
                            </div>
                            <p v-else class="text-xs text-gray-400 italic">Pendiente de revisión administrativa...</p>
                        </div>

                         <!-- PASO 3: APROBADO -->
                         <div class="relative" :class="{'opacity-50': ['SOLICITADO', 'EN_GESTION'].includes(selectedRequest?.estado)}">
                            <div class="absolute -left-[25px] top-0 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-green-500 text-white text-xs font-bold">3</div>
                            <h4 class="font-bold text-gray-900 dark:text-white mb-2">Aprobación</h4>
                            <div v-if="['APROBADO', 'FINALIZADO'].includes(selectedRequest?.estado)" class="bg-green-50 dark:bg-green-900/20 p-3 rounded text-sm space-y-2">
                                <p><span class="font-bold">Responsable:</span> {{ selectedRequest?.responsable_asignado }}</p>
                                <p><span class="font-bold">Monto:</span> Q{{ selectedRequest?.monto }}</p>
                                <p v-if="selectedRequest?.tipo_apoyo"><span class="font-bold">Tipo:</span> {{ selectedRequest.tipo_apoyo.nombre }}</p>
                                 <a v-if="selectedRequest?.path_documento_firmado" @click.prevent="getFileUrl(selectedRequest.id, 'firmado')" href="#" class="text-green-700 dark:text-green-400 hover:underline flex items-center gap-1 text-xs font-bold">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    Ver Aprobación Firmada
                                </a>
                            </div>
                            <p v-else class="text-xs text-gray-400 italic">Pendiente de aprobación...</p>
                        </div>

                         <!-- PASO 4: FINALIZADO / EVIDENCIAS -->
                         <div class="relative" :class="{'opacity-50': !['FINALIZADO'].includes(selectedRequest?.estado)}">
                            <div class="absolute -left-[25px] top-0 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gray-800 text-white text-xs font-bold">4</div>
                            <h4 class="font-bold text-gray-900 dark:text-white mb-2">Finalización & Evidencias</h4>

                            <div v-if="selectedRequest?.estado === 'FINALIZADO'" class="grid grid-cols-2 gap-2 mt-2">
                                <div class="text-center">
                                    <span class="text-xs font-bold block mb-1 dark:text-gray-300">Entrega</span>
                                    <SecureImage
                                        :id="selectedRequest.id"
                                        type="entrega"
                                        imageClass="w-full h-24 object-cover rounded border hover:opacity-75 transition-opacity"
                                    />
                                </div>
                                <div class="text-center">
                                    <span class="text-xs font-bold block mb-1 dark:text-gray-300">Carta Conocimiento</span>
                                    <SecureImage
                                        :id="selectedRequest.id"
                                        type="conocimiento"
                                        imageClass="w-full h-24 object-cover rounded border hover:opacity-75 transition-opacity"
                                    />
                                </div>
                            </div>
                             <p v-else-if="selectedRequest?.estado !== 'APROBADO'" class="text-xs text-gray-400 italic">Pendiente de entrega...</p>
                        </div>

                    </div>

                    <!-- COLUMNA DERECHA: ACCIONES PENDIENTES -->
                    <div class="md:w-1/2">
                        <div class="sticky top-6">
                            <h4 class="font-bold text-lg mb-4 text-gray-800 dark:text-white border-b pb-2">Tu Acción Requerida</h4>

                            <!-- SI ESTA APROBADO, TOCA SUBIR EVIDENCIAS -->
                            <div v-if="selectedRequest?.estado === 'APROBADO'" class="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-lg border border-indigo-100 dark:border-indigo-800 shadow-lg">
                                <h5 class="font-bold text-indigo-700 dark:text-indigo-300 mb-2">¡Solicitud Aprobada!</h5>
                                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">La solicitud ha sido aprobada. Por favor carga las evidencias de la entrega para finalizar el proceso.</p>

                                <form @submit.prevent="submitEvidence" class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto Entrega</label>
                                        <input @change="e => handleEvidenceFile(e, 'entrega')" type="file" accept="image/*" class="w-full text-sm dark:text-white file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" required>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto Carta Conocimiento</label>
                                        <input @change="e => handleEvidenceFile(e, 'conocimiento')" type="file" accept="image/*" class="w-full text-sm dark:text-white file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" required>
                                    </div>
                                    <button type="submit" :disabled="submittingEvidence" class="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50">
                                        {{ submittingEvidence ? 'Subiendo...' : 'Finalizar Entrega' }}
                                    </button>
                                </form>
                            </div>

                            <div v-else-if="selectedRequest?.estado === 'FINALIZADO'" class="bg-green-100 dark:bg-green-900/30 p-5 rounded-lg text-center">
                                <svg class="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <h5 class="font-bold text-green-800 dark:text-green-300">Proceso Completado</h5>
                                <p class="text-sm text-green-600 dark:text-green-400">Gracias por completar el ciclo de ayuda.</p>
                            </div>

                             <div v-else-if="selectedRequest?.estado === 'RECHAZADO'" class="bg-red-100 dark:bg-red-900/30 p-5 rounded-lg">
                                <h5 class="font-bold text-red-800 dark:text-red-300 mb-1">Solicitud Rechazada</h5>
                                <p class="text-sm dark:text-gray-200 mb-2">Motivo: "{{ selectedRequest.motivo_rechazo }}"</p>
                                <p class="text-xs text-red-600 dark:text-red-400">Contacta con administración para más detalles.</p>
                            </div>

                            <div v-else class="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg dashed border-2 border-gray-200">
                                <p class="text-gray-400 text-sm">No hay acciones requeridas por tu parte en este momento. Espera a que el estado cambie.</p>
                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'
import { useLocalidadesStore } from '@/stores/localidades'
import { useAuthStore } from '@/stores/auth'
import SecureImage from '@/components/shared/SecureImage.vue'
import SecureDoc from '@/components/shared/SecureDoc.vue'

const store = useSolicitudesStore()
const localidadesStore = useLocalidadesStore()
const authStore = useAuthStore()

const solicitudes = ref([])
const loading = ref(false)
const showModal = ref(false)
const showTimeline = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const submittingEvidence = ref(false)
const file = ref(null)
const evidenceFiles = reactive({ entrega: null, conocimiento: null })
const selectedRequest = ref(null)

const steps = ['Solicitado', 'En Gestión', 'Aprobacion', 'Finalizado']

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

const getFileUrl = async (id, type) => {
    try {
        const url = await store.getFileUrl(id, type)
        if(url) window.open(url, '_blank')
    } catch(e) { alert("Error al abrir archivo") }
}

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

const previewUrls = reactive({ entrega: '', conocimiento: '' })

// TIMELINE LOGIC
const openTimeline = async (req) => {
    selectedRequest.value = req
    evidenceFiles.entrega = null
    evidenceFiles.conocimiento = null
    previewUrls.entrega = ''
    previewUrls.conocimiento = ''

    // Si ya estan finalizados, cargar URLs para preview
    if(req.estado === 'FINALIZADO') {
        try {
            if(req.path_foto_entrega) previewUrls.entrega = await store.getFileUrl(req.id, 'entrega')
            if(req.path_foto_conocimiento) previewUrls.conocimiento = await store.getFileUrl(req.id, 'conocimiento')
        } catch(e) { console.error('Error loading previews', e) }
    }

    showTimeline.value = true
}
const closeTimeline = () => {
    showTimeline.value = false
    selectedRequest.value = null
}

const getStepColor = (index, currentStatus) => {
    // Ya no se usa tanto en el nuevo diseño vertical, pero por compatibilidad...
    return ''
}

const handleEvidenceFile = (e, type) => {
    evidenceFiles[type] = e.target.files[0]
}

const submitEvidence = async () => {
    if(!evidenceFiles.entrega || !evidenceFiles.conocimiento) return alert("Ambas fotos son requeridas")
    submittingEvidence.value = true
    try {
        const formData = new FormData()
        formData.append('foto_entrega', evidenceFiles.entrega)
        formData.append('foto_conocimiento', evidenceFiles.conocimiento)

        await store.finalizarSolicitud(selectedRequest.value.id, formData)
        alert('Evidencias subidas exitosamente')
        closeTimeline()
        loadData()
    } catch (e) {
        alert("Error: " + (e.response?.data?.message || e.message))
    } finally {
        submittingEvidence.value = false
    }
}

// ... EXISTING FORM LOGIC ...
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
