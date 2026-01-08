<template>
  <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-inner">
     <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span class="bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
        Finalización y Evidencias
    </h3>

    <!-- CASO 1: FINALIZADO (Mostrar evidencias) -->
    <div v-if="request.estado === 'FINALIZADO'" class="space-y-6">
        <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg flex items-center gap-4">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
                 <h4 class="font-bold text-green-800 dark:text-green-300">Proceso Completado Exitosamente</h4>
                 <p class="text-sm text-green-600 dark:text-green-400">Se han cargado las evidencias de entrega y conocimiento.</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="text-center bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
                <span class="text-sm font-bold block mb-2 dark:text-gray-300 uppercase">Foto de Entrega</span>
                <SecureImage
                    :id="request.id"
                    type="entrega"
                    imageClass="w-full h-48 object-cover rounded-lg border hover:opacity-90 transition shadow-sm"
                />
            </div>
            <div class="text-center bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
                <span class="text-sm font-bold block mb-2 dark:text-gray-300 uppercase">Carta de Conocimiento</span>
                <SecureImage
                    :id="request.id"
                    type="conocimiento"
                    imageClass="w-full h-48 object-cover rounded-lg border hover:opacity-90 transition shadow-sm"
                />
            </div>
        </div>
    </div>

    <!-- CASO 2: APROBADO (Formulario para subir evidencias) -->
    <div v-else-if="request.estado === 'APROBADO'" class="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-lg border border-indigo-100 dark:border-indigo-800">
         <h5 class="font-bold text-indigo-700 dark:text-indigo-300 mb-2">Acción Requerida: Subir Evidencias</h5>
         <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Para finalizar el proceso, por favor sube las fotos que evidencian la entrega del apoyo.</p>

         <form @submit.prevent="submitEvidence" class="space-y-4 max-w-lg mx-auto">
            <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Foto de Entrega (Obligatorio)</label>
                <input @change="e => handleFile(e, 'entrega')" type="file" accept="image/*" class="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required>
            </div>
            <div>
                <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Foto Carta Conocimiento (Obligatorio)</label>
                <input @change="e => handleFile(e, 'conocimiento')" type="file" accept="image/*" class="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required>
            </div>

            <div class="pt-4">
                <button type="submit" :disabled="submitting" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                    <span v-if="submitting">Subiendo...</span>
                    <span v-else>Finalizar Entrega</span>
                </button>
            </div>
         </form>
    </div>

    <!-- CASO 3: RECHAZADO -->
    <div v-else-if="request.estado === 'RECHAZADO'" class="text-center py-8">
         <div class="inline-block p-4 bg-red-50 rounded-full mb-3">
             <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h4 class="font-bold text-red-600 mb-1">Solicitud Rechazada</h4>
        <p class="text-gray-600 dark:text-gray-300 text-sm">El proceso se detuvo porque la solicitud fue rechazada.</p>
        <p class="mt-2 text-red-800 bg-red-50 inline-block px-3 py-1 rounded text-sm font-medium">Motivo: {{ request.motivo_rechazo }}</p>
    </div>

    <!-- CASO 4: PENDIENTE (Pasos anteriores no completados) -->
    <div v-else class="text-center py-10 opacity-50">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <p class="text-gray-500">Este paso aún no está disponible.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSolicitudesStore } from '@/stores/solicitudes'
import SecureImage from '@/components/shared/SecureImage.vue'

const props = defineProps({
    request: { type: Object, required: true }
})

const emit = defineEmits(['refresh'])
const store = useSolicitudesStore()
const submitting = ref(false)
const files = reactive({ entrega: null, conocimiento: null })

const handleFile = (e, type) => {
    files[type] = e.target.files[0]
}

const submitEvidence = async () => {
    if(!files.entrega || !files.conocimiento) return alert("Ambos archivos son requeridos")

    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('foto_entrega', files.entrega)
        formData.append('foto_conocimiento', files.conocimiento)

        await store.finalizarSolicitud(props.request.id, formData)

        alert("¡Evidencias subidas correctamente! Proceso finalizado.")
        emit('refresh') // Recargar datos padre
    } catch (e) {
        alert("Error: " + (e.response?.data?.message || e.message))
    } finally {
        submitting.value = false
    }
}
</script>
