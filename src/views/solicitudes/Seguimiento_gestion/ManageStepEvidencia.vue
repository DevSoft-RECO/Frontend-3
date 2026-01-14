<template>
  <div class="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-100 dark:border-purple-800">
      <h3 class="text-lg font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
         <span class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">4</span>
         Evidencias y Finalización
      </h3>

      <!-- PENDING OR EDITING -->
      <div v-if="isPending || isEditing" class="space-y-4">
          <p class="text-sm text-purple-700 dark:text-purple-300 mb-2">
              {{ isEditing ? 'Actualizar Evidencias' : 'Subir evidencias para finalizar el proceso:' }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                  <label class="block text-xs font-bold text-gray-500 mb-1">Documento Evidencia (PDF)</label>
                  <input @change="handleFile" type="file" accept="application/pdf" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:text-gray-300">
                  <p class="text-xs text-gray-400 mt-1">Máx. 5MB</p>
              </div>
          </div>

          <div v-if="loading" class="text-center text-purple-600 font-bold py-2">Subiendo archivos...</div>

          <div class="flex justify-end mt-4 gap-2">
               <button v-if="isEditing" @click="isEditing = false" class="px-4 py-2 text-gray-500">Cancelar</button>
               <button @click="save" :disabled="loading" class="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 shadow disabled:opacity-50">
                   {{ isEditing ? 'Guardar Cambios' : 'Finalizar Proceso' }}
               </button>
          </div>
      </div>

      <!-- VIEW HISTORY -->
      <div v-else-if="request.estado === 'FINALIZADO'">
           <div class="flex justify-between items-start">
               <div class="w-full">
                   <div class="mt-2 border rounded p-4 bg-white dark:bg-gray-800">
                       <p class="text-xs font-bold text-gray-500 mb-2 uppercase">Documento de Evidencia</p>
                       <SecureDoc
                            v-if="request.path_documento_evidencia"
                            :id="request.id"
                            type="evidencia"
                            customClass="flex items-center gap-2 text-purple-700 font-medium hover:underline p-3 bg-purple-50 rounded border border-purple-100 transition hover:bg-purple-100"
                       >
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Ver PDF Evidencia
                       </SecureDoc>
                       <p v-else class="text-xs text-gray-400 italic">No disponible</p>
                   </div>
               </div>
               <button v-if="canManage" @click="isEditing = true" class="text-xs text-purple-600 hover:underline ml-4 mt-2">Editar</button>
           </div>
      </div>
      <div v-else class="text-sm text-gray-500 italic p-4">
        Esperando Aprobación para subir evidencias.
      </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSolicitudesStore } from '@/stores/solicitudes'
import SecureDoc from '@/components/shared/SecureDoc.vue'

const props = defineProps({ request: Object })
const emit = defineEmits(['refresh'])

const authStore = useAuthStore()
const store = useSolicitudesStore()

const loading = ref(false)
const isEditing = ref(false)
const file = ref(null)

const isSuperAdmin = computed(() => authStore.hasRole('Super Admin'))
const canManage = computed(() => isSuperAdmin.value || authStore.can('gestionar_solicitudes'))
const isPending = computed(() => props.request.estado === 'APROBADO' && canManage.value)

const handleFile = (e) => file.value = e.target.files[0]

const save = async () => {
    loading.value = true
    try {
        const formData = new FormData()
        if(file.value) formData.append('documento_evidencia', file.value)

        if(isEditing.value) {
            // Update mode
            if(!file.value) return alert("Selecciona un archivo para actualizar")
            await store.updateSolicitud(props.request.id, formData)
            isEditing.value = false
            emit('refresh')
        } else {
            // Finalize mode
            if(!file.value) {
                loading.value = false
                return alert("El documento es requerido para finalizar")
            }
            await store.finalizarSolicitud(props.request.id, formData)
            emit('refresh')
        }
    } catch(e) { alert("Error: " + e.message) }
    finally { loading.value = false }
}


</script>
