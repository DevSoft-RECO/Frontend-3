<template>
  <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-inner">
    <div class="flex justify-between items-start mb-6">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
            Detalles de la Solicitud
        </h3>
        <button
            v-if="isSuperAdmin && !isEditing"
            @click="startEdit"
            class="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200"
        >
            Editar Datos
        </button>
    </div>

    <!-- VIEW MODE -->
    <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Solicitante</p>
            <p class="dark:text-white font-medium text-base">{{ request.nombre_solicitante }}</p>
        </div>
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Teléfono</p>
            <p class="dark:text-white font-medium text-base">{{ request.telefono }}</p>
        </div>
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Nombre Contacto</p>
            <p class="dark:text-white font-medium text-base">{{ request.nombre_contacto || '-' }}</p>
        </div>
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Comunidad</p>
            <p class="dark:text-white font-medium text-base">{{ request.comunidad?.nombre || request.comunidad_id }}</p>
        </div>
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Fecha Solicitud</p>
            <p class="dark:text-white font-medium text-base">{{ formatDate(request.fecha_solicitud) }}</p>
        </div>
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Fecha Evento</p>
            <p class="dark:text-white font-medium text-base">{{ formatDate(request.fecha_evento) }}</p>
        </div>
        <div class="col-span-1 md:col-span-2">
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Comentario</p>
            <div class="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 italic text-gray-600 dark:text-gray-300">
                "{{ request.comentario_solicitud }}"
            </div>
        </div>
        <div class="col-span-1 md:col-span-2">
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Documento</p>
             <button v-if="request.path_documento_adjunto" @click="openDoc('adjunto')" class="text-indigo-600 hover:underline flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                Ver PDF Actual
            </button>
            <span v-else class="text-gray-400">Sin archivo</span>
        </div>
    </div>

    <!-- EDIT MODE -->
    <div v-else class="space-y-4 bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-bold text-gray-500">Nombre Solicitante</label>
                <input v-model="form.nombre_solicitante" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500">Teléfono</label>
                <input v-model="form.telefono" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
            </div>
             <div>
                <label class="block text-xs font-bold text-gray-500">Nombre Contacto</label>
                <input v-model="form.nombre_contacto" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
            </div>
             <div>
                <label class="block text-xs font-bold text-gray-500">Fecha Solicitud</label>
                <input v-model="form.fecha_solicitud" type="date" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
            </div>
             <div>
                <label class="block text-xs font-bold text-gray-500">Fecha Evento</label>
                <input v-model="form.fecha_evento" type="date" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
            </div>
        </div>

        <!-- LOCATIONS -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
             <div>
                <label class="block text-xs font-bold text-gray-500 flex justify-between">
                    Departamento
                    <span v-if="loadingDeptos" class="text-indigo-500">...</span>
                </label>
                <select v-model="selectedDepto" @change="loadMunicipios" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
                    <option :value="null">Selecciona</option>
                    <option v-for="d in localidadesStore.departamentos" :key="d.id" :value="d.id">{{ d.nombre }}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 flex justify-between">
                    Municipio
                    <span v-if="loadingMunis" class="text-indigo-500">...</span>
                </label>
                <select v-model="selectedMuni" @change="loadComunidades" :disabled="!selectedDepto" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
                    <option :value="null">Selecciona</option>
                    <option v-for="m in localidadesStore.municipios" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 flex justify-between">
                    Comunidad
                    <span v-if="loadingComs" class="text-indigo-500">...</span>
                </label>
                <select v-model="form.comunidad_id" :disabled="!selectedMuni" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
                    <option value="">Selecciona</option>
                     <option v-for="c in localidadesStore.comunidades" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                </select>
            </div>
        </div>

        <div>
             <label class="block text-xs font-bold text-gray-500">Comentario</label>
             <textarea v-model="form.comentario_solicitud" rows="3" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"></textarea>
        </div>

        <div>
             <label class="block text-xs font-bold text-gray-500 mb-1">Actualizar Documento (Opcional)</label>
             <input @change="handleFile" type="file" accept="application/pdf" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:text-gray-300">
        </div>

        <div class="flex justify-end gap-3 pt-2">
            <button @click="isEditing = false" class="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Cancelar</button>
            <button @click="save" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Guardar Cambios</button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSolicitudesStore } from '@/stores/solicitudes'
import { useLocalidadesStore } from '@/stores/localidades'

const props = defineProps({ request: Object })
const emit = defineEmits(['refresh'])

const authStore = useAuthStore()
const store = useSolicitudesStore()
const localidadesStore = useLocalidadesStore()

const isSuperAdmin = computed(() => authStore.hasRole('Super Admin'))
const isEditing = ref(false)
const file = ref(null)

const selectedDepto = ref(null)
const selectedMuni = ref(null)

const loadingDeptos = ref(false)
const loadingMunis = ref(false)
const loadingComs = ref(false)

const form = reactive({
    nombre_solicitante: '',
    telefono: '',
    nombre_contacto: '',
    comunidad_id: '',
    fecha_solicitud: '',
    fecha_evento: '',
    comentario_solicitud: ''
})

const formatDate = (d) => d ? d.split('T')[0] : '-'

const startEdit = () => {
    // 1. Populate form instantly
    Object.assign(form, {
        nombre_solicitante: props.request.nombre_solicitante,
        telefono: props.request.telefono,
        nombre_contacto: props.request.nombre_contacto || '',
        comunidad_id: props.request.comunidad_id,
        fecha_solicitud: props.request.fecha_solicitud?.split('T')[0],
        fecha_evento: props.request.fecha_evento?.split('T')[0],
        comentario_solicitud: props.request.comentario_solicitud
    })

    // 2. Open Mode immediately
    isEditing.value = true

    // 3. Load Locations in background
    loadLocationsBackground()
}

const loadLocationsBackground = async () => {
    try {
        // Load Deptos
        loadingDeptos.value = true
        await localidadesStore.fetchDepartamentos()
        loadingDeptos.value = false

        // If we have existing location info, load tree
        if (props.request.comunidad && props.request.comunidad.municipio) {
            const muni = props.request.comunidad.municipio
            selectedDepto.value = muni.departamento_id

            loadingMunis.value = true
            await localidadesStore.fetchMunicipios(selectedDepto.value)
            loadingMunis.value = false

            selectedMuni.value = muni.id

            loadingComs.value = true
            await localidadesStore.fetchComunidades(selectedMuni.value)
            loadingComs.value = false
        }
    } catch(e) { console.error("Error loading locations", e) }
}

const loadMunicipios = async () => {
    selectedMuni.value = null
    form.comunidad_id = ''
    if(selectedDepto.value) {
        loadingMunis.value = true
        await localidadesStore.fetchMunicipios(selectedDepto.value)
        loadingMunis.value = false
    }
}

const loadComunidades = async () => {
    form.comunidad_id = ''
    if(selectedMuni.value) {
        loadingComs.value = true
        await localidadesStore.fetchComunidades(selectedMuni.value)
        loadingComs.value = false
    }
}

const handleFile = (e) => file.value = e.target.files[0]

const save = async () => {
    try {
        const formData = new FormData()
        Object.keys(form).forEach(k => {
            if(form[k]) formData.append(k, form[k])
        })
        if(file.value) formData.append('documento_adjunto', file.value)

        await store.updateSolicitud(props.request.id, formData)

        isEditing.value = false
        emit('refresh')
    } catch(e) { alert("Error: " + e.message) }
}

const openDoc = async (type) => {
    const url = await store.getFileUrl(props.request.id, type)
    if(url) window.open(url, '_blank')
}
</script>
