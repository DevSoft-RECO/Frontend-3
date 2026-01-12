<template>
  <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-100 dark:border-blue-800">
      <h3 class="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
         <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
         Gestión / Revisión Inicial
      </h3>

      <!-- REJECTED STATE -->
      <div v-if="request.estado === 'RECHAZADO'" class="bg-red-100 dark:bg-red-900/30 p-4 rounded text-red-800 dark:text-red-200 flex justify-between items-center">
          <div>
              <p class="font-bold">Solicitud Denegada</p>
              <div class="text-sm">
                  <p class="font-bold">{{ formatDate(request.updated_at) }}</p>
                  Denegado por: <span class="font-bold">{{ request.nombre_usuario_rechazo || 'Desconocido' }}</span>
              </div>
              <p class="text-xs mt-2 opacity-75" v-if="request.nombre_usuario_rechazo || request.fecha_rechazo">
                  Denegado por: <span class="font-bold">{{ request.nombre_usuario_rechazo || 'Desconocido' }}</span>
                  el {{ formatDate(request.fecha_rechazo) }}
              </p>
          </div>
          <button v-if="canManage" @click="reactivate" class="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 shadow border border-indigo-500">
              Reactivar Solicitud
          </button>
      </div>

      <!-- EDIT/ACTION STATE -->
      <div v-else-if="isPending || isEditing">
          <p class="text-sm text-blue-600 dark:text-blue-400 mb-2">
            {{ isEditing ? 'Editar Comentario de Gestión' : 'Ingrese el comentario para iniciar la gestión:' }}
          </p>
          <p v-if="!isEditing" class="text-xs text-gray-500 mb-2 italic">
              (Nota: Si va a denegar la solicitud, puede dejar este campo vacío. Se solicitará el motivo en la siguiente ventana).
          </p>
          <textarea v-model="comment" class="w-full border rounded p-3 dark:bg-gray-700 dark:text-white" rows="3"></textarea>

          <div class="flex justify-end mt-4 gap-2">
               <button v-if="isEditing" @click="isEditing = false" class="px-4 py-2 text-gray-500">Cancelar</button>
               <button v-if="!isEditing" @click="openRechazo" class="px-4 py-2 text-red-600 font-bold border border-red-200 rounded hover:bg-red-50">Denegar</button>
               <button @click="save" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 shadow">
                   {{ isEditing ? 'Guardar Cambios' : 'Iniciar Gestión' }}
               </button>
          </div>
      </div>

       <!-- VIEW HISTORY STATE -->
       <div v-else>
           <div class="flex justify-between items-start">
               <div>
                   <p class="text-sm text-gray-500 font-bold uppercase">Comentario de Gestión</p>
                   <p class="mt-1 text-gray-800 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
                       "{{ request.comentario_gestion }}"
                   </p>
                    <p class="mt-2 text-xs text-gray-400">
                        Iniciado por <span class="font-bold text-gray-600 dark:text-gray-300">{{ request.nombre_usuario_gestion || 'Desconocido' }}</span>
                        el {{ formatDate(request.fecha_inicio_gestion) }}
                    </p>
                </div>
               <button v-if="canManage" @click="startEdit" class="text-xs text-blue-600 hover:underline">Editar</button>
           </div>
       </div>

       <!-- Modal Rechazo Local -->
       <div v-if="showRechazo" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
           <div class="bg-white p-6 rounded w-full max-w-sm">
               <p class="text-sm text-gray-600 mb-4">Por favor, indique el motivo por el cual deniega esta solicitud.</p>
               <textarea v-model="rechazoReason" class="w-full border rounded p-2 mb-4" rows="3" placeholder="Motivo..."></textarea>
               <div class="flex justify-end gap-2">
                   <button @click="showRechazo = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                   <button @click="submitRechazo" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Confirmar Denegación</button>
               </div>
           </div>
       </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSolicitudesStore } from '@/stores/solicitudes'

const props = defineProps({ request: Object })
const emit = defineEmits(['refresh', 'next'])

const authStore = useAuthStore()
const store = useSolicitudesStore()

const comment = ref('')
const isEditing = ref(false)
const showRechazo = ref(false)
const rechazoReason = ref('')

const isSuperAdmin = computed(() => authStore.hasRole('Super Admin'))
const canManage = computed(() => isSuperAdmin.value || authStore.can('editar_gestiones'))
const isPending = computed(() => props.request.estado === 'SOLICITADO' && canManage.value)

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-'

const startEdit = () => {
    comment.value = props.request.comentario_gestion
    isEditing.value = true
}

const save = async () => {
    if(!comment.value) return alert("Comentario requerido")
    try {
        if(isEditing.value) {
            await store.updateSolicitud(props.request.id, { comentario_gestion: comment.value })
            isEditing.value = false
            emit('refresh')
        } else {
            await store.gestionarSolicitud(props.request.id, comment.value, authStore.user?.name || 'Desconocido')
            emit('refresh')
            emit('next')
        }
    } catch(e) { alert("Error: " + e.message) }
}

const openRechazo = () => showRechazo.value = true
const submitRechazo = async () => {
    if(!rechazoReason.value) return alert("Motivo requerido")
    try {
        await store.rechazarSolicitud(props.request.id, rechazoReason.value, authStore.user?.name || 'Desconocido')
        showRechazo.value = false
        emit('refresh')
    } catch(e) { alert("Error: " + e.message) }
}

const reactivate = async () => {
    if(!confirm("¿Seguro que desea reactivar esta solicitud? Volverá al estado SOLICITADO.")) return;
    try {
        await store.reactivarSolicitud(props.request.id)
        emit('refresh')
    } catch(e) { alert("Error: " + e.message) }
}
</script>
