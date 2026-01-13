<template>
  <div class="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800">
      <h3 class="text-lg font-bold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
         <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
         Aprobación
      </h3>

      <div v-if="isPending || isEditing" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label class="block text-xs font-bold text-gray-500">Tipo de Apoyo</label>
                  <select v-model="form.tipo_apoyo_id" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
                      <option value="">Selecciona...</option>
                      <option v-for="t in store.tiposApoyo" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                  </select>
              </div>
              <div>
                  <label class="block text-xs font-bold text-gray-500">Responsable Asignado</label>
                  <input v-model="form.responsable_asignado" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                  <label class="block text-xs font-bold text-gray-500">Monto (Q)</label>
                  <input v-model="form.monto" type="number" step="0.01" class="w-full border rounded p-2 dark:bg-gray-700 dark:text-white">
              </div>
              <div>
                  <label class="block text-xs font-bold text-gray-500">Documento Firmado PDF</label>
                   <input @change="handleFile" type="file" accept="application/pdf" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:text-gray-300">
              </div>
          </div>

          <div v-if="loading" class="text-center text-green-600 font-bold py-2">Procesando archivo, por favor espere...</div>

          <div class="flex justify-end mt-4 gap-2">
               <button v-if="isEditing" @click="isEditing = false" class="px-4 py-2 text-gray-500">Cancelar</button>
               <button @click="save" :disabled="loading" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 shadow disabled:opacity-50">
                   {{ isEditing ? 'Guardar Cambios' : 'Aprobar Solicitud' }}
               </button>
          </div>
      </div>

      <!-- VIEW HISTORY -->
      <div v-else>
           <div class="flex justify-between items-start">
               <div class="space-y-2 text-sm">
                   <p><span class="font-bold text-gray-500">Tipo Apoyo:</span> {{ request.tipo_apoyo?.nombre || request.tipo_apoyo_id }}</p>
                   <p><span class="font-bold text-gray-500">Responsable:</span> {{ request.responsable_asignado }}</p>
                   <p><span class="font-bold text-gray-500">Monto:</span> Q{{ request.monto }}</p>
                   <p>
                       <span class="font-bold text-gray-500">Aprobado por:</span> {{ request.nombre_usuario_aprobacion || 'Sistema' }}
                       <span class="text-xs text-gray-400">({{ formatDate(request.fecha_aprobacion) }})</span>
                   </p>

                   <button v-if="request.path_documento_firmado" @click="openDoc" class="text-green-600 hover:underline flex items-center gap-1 font-medium mt-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Ver Documento Firmado
                   </button>
               </div>
               <button v-if="canEditHistory" @click="startEdit" class="text-xs text-green-600 hover:underline">Editar</button>
           </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSolicitudesStore } from '@/stores/solicitudes'

const props = defineProps({ request: Object })
const emit = defineEmits(['refresh', 'next'])

const authStore = useAuthStore()
const store = useSolicitudesStore()

const loading = ref(false)
const isEditing = ref(false)
const file = ref(null)
const form = reactive({ tipo_apoyo_id: '', responsable_asignado: '', monto: '' })

const isSuperAdmin = computed(() => authStore.hasRole('Super Admin'))
const canManage = computed(() => isSuperAdmin.value || authStore.can('admin_mercadeo'))
const canEditHistory = computed(() => isSuperAdmin.value)
const isPending = computed(() => props.request.estado === 'EN_GESTION' && canManage.value)

onMounted(() => {
    store.fetchTiposApoyo()
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-'

const startEdit = () => {
    Object.assign(form, {
        tipo_apoyo_id: props.request.tipo_apoyo_id,
        responsable_asignado: props.request.responsable_asignado,
        monto: props.request.monto
    })
    isEditing.value = true
}

const handleFile = (e) => file.value = e.target.files[0]

const save = async () => {
    if(!form.tipo_apoyo_id || !form.responsable_asignado) return alert("Campos requeridos")

    loading.value = true
    try {
        const formData = new FormData()
        formData.append('tipo_apoyo_id', form.tipo_apoyo_id)
        formData.append('responsable_asignado', form.responsable_asignado)
        formData.append('monto', form.monto)
        if(file.value) formData.append('documento_firmado', file.value)
        formData.append('nombre_usuario', authStore.user?.name || 'Desconocido')

        if(isEditing.value) {
            await store.updateSolicitud(props.request.id, formData)
            isEditing.value = false
            emit('refresh')
        } else {
            if(!file.value) { loading.value = false; return alert("Archivo requerido"); }
            await store.aprobarSolicitud(props.request.id, formData)
            emit('refresh')
            emit('next')
        }
    } catch(e) { alert("Error: " + e.message) }
    finally { loading.value = false }
}

const openDoc = async () => {
    const url = await store.getFileUrl(props.request.id, 'firmado')
    if(url) window.open(url, '_blank')
}
</script>
