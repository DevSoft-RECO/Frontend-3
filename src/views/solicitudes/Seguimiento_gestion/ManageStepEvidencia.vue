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
              <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1">Foto Entrega</label>
                  <input @change="handleFileEntrega" type="file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:text-gray-300">
              </div>
              <div>
                  <label class="block text-xs font-bold text-gray-500 mb-1">Foto Acta/Conocimiento</label>
                  <input @change="handleFileConocimiento" type="file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:text-gray-300">
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
                   <div class="grid grid-cols-2 gap-4 mt-2">
                       <div class="border rounded p-2 bg-white dark:bg-gray-800">
                           <p class="text-xs font-bold text-gray-500 mb-2">Evidencia Entrega</p>
                           <SecureImage
                                v-if="request.path_foto_entrega"
                                :id="request.id"
                                type="entrega"
                                imageClass="w-full h-32 object-cover rounded border hover:opacity-90 transition cursor-pointer"
                                @click="openDoc('entrega')"
                           />
                           <p v-else class="text-xs text-gray-400 italic">No disponible</p>
                       </div>
                       <div class="border rounded p-2 bg-white dark:bg-gray-800">
                           <p class="text-xs font-bold text-gray-500 mb-2">Evidencia Conocimiento</p>
                           <SecureImage
                                v-if="request.path_foto_conocimiento"
                                :id="request.id"
                                type="conocimiento"
                                imageClass="w-full h-32 object-cover rounded border hover:opacity-90 transition cursor-pointer"
                                @click="openDoc('conocimiento')"
                           />
                           <p v-else class="text-xs text-gray-400 italic">No disponible</p>
                       </div>
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
import SecureImage from '@/components/shared/SecureImage.vue'

const props = defineProps({ request: Object })
const emit = defineEmits(['refresh'])

const authStore = useAuthStore()
const store = useSolicitudesStore()

const loading = ref(false)
const isEditing = ref(false)
const fileEntrega = ref(null)
const fileConocimiento = ref(null)

const isSuperAdmin = computed(() => authStore.hasRole('Super Admin'))
const canManage = computed(() => isSuperAdmin.value) // Step 4 edits usually admin only or specific role
const isPending = computed(() => props.request.estado === 'APROBADO' || (props.request.estado === 'FINALIZADO' && false))
// If Aprobado -> Pending Finalization. If Finalized -> Not Pending (History).

const handleFileEntrega = (e) => fileEntrega.value = e.target.files[0]
const handleFileConocimiento = (e) => fileConocimiento.value = e.target.files[0]

const save = async () => {
    loading.value = true
    try {
        const formData = new FormData()
        if(fileEntrega.value) formData.append('foto_entrega', fileEntrega.value)
        if(fileConocimiento.value) formData.append('foto_conocimiento', fileConocimiento.value)

        if(isEditing.value) {
            // Update mode
            if(!fileEntrega.value && !fileConocimiento.value) return alert("Selecciona al menos un archivo para actualizar")
            await store.updateSolicitud(props.request.id, formData)
            isEditing.value = false
            emit('refresh')
        } else {
            // Finalize mode
            if(!fileEntrega.value || !fileConocimiento.value) {
                loading.value = false
                return alert("Ambas fotos son requeridas para finalizar")
            }
            await store.finalizarSolicitud(props.request.id, formData)
            emit('refresh')
        }
    } catch(e) { alert("Error: " + e.message) }
    finally { loading.value = false }
}

const openDoc = async (type) => {
    const url = await store.getFileUrl(props.request.id, type)
    if(url) window.open(url, '_blank')
}
</script>
