<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close"></div>
    <div class="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📞 Registrar Llamada
        </h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          ❌
        </button>
      </div>

      <div class="p-6 overflow-y-auto custom-scrollbar">
        <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-mono border border-gray-200 dark:border-gray-700">
          <p class="text-gray-500 dark:text-gray-400 font-bold mb-1">Detalles del Pago Asociado:</p>
          <p class="text-gray-800 dark:text-gray-200"><strong>Cuenta:</strong> {{ pago?.numero_cuenta }}</p>
          <p class="text-gray-800 dark:text-gray-200"><strong>Monto:</strong> Q {{ parseFloat(pago?.monto || 0).toLocaleString("es-GT", {minimumFractionDigits: 2}) }}</p>
          <p class="text-gray-800 dark:text-gray-200"><strong>Fecha Pago:</strong> {{ pago?.fecha_pago }}</p>
        </div>

        <div v-if="pago?.llamadas?.length" class="mb-6 space-y-3">
          <h4 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Historial de Intentos</h4>
          <div v-for="llamada in pago.llamadas" :key="llamada.id" class="p-3 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
            <div class="flex justify-between items-start mb-1">
              <span class="font-bold text-gray-900 dark:text-white" :class="{
                'text-amber-600': llamada.estado === 'Pendiente',
                'text-red-600': llamada.estado === 'No contesta',
                'text-emerald-600': llamada.estado === 'Completada'
              }">{{ llamada.estado }}</span>
              <span class="text-xs text-gray-400">{{ new Date(llamada.created_at).toLocaleString() }}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Por: {{ llamada.usuario?.name || llamada.usuario?.username || 'Usuario Desconocido' }}</p>
            <p v-if="llamada.notas" class="text-gray-700 dark:text-gray-300 italic text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">"{{ llamada.notas }}"</p>
          </div>
        </div>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Fecha Registro</label>
            <input type="text" :value="new Date().toLocaleDateString()" disabled class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-500 text-sm font-bold" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Estado Llamada</label>
            <select v-model="form.estado" required class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500">
              <option value="">Seleccione estado...</option>
              <option value="Pendiente">Pendiente</option>
              <option value="No contesta">No contesta</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notas / Observaciones</label>
            <textarea v-model="form.notas" rows="3" placeholder="Detalles de la llamada..." class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>

          <div v-if="error" class="p-3 bg-red-100 text-red-700 text-sm rounded-xl font-bold border border-red-200">{{ error }}</div>

          <div class="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
            <button type="button" @click="close" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors">Cancelar</button>
            <button type="submit" :disabled="loading" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2">
              <span v-if="loading">⏳</span>
              <span v-else>💾</span> Guardar Llamada
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import api from "@/api/axios"

const props = defineProps({
  show: Boolean,
  pago: Object
})
const emit = defineEmits(["close", "saved"])

const form = ref({
  estado: "",
  notas: ""
})
const loading = ref(false)
const error = ref("")

watch(() => props.show, (val) => {
  if (val) {
    form.value = { estado: "", notas: "" }
    error.value = ""
  }
})

const close = () => emit("close")

const submit = async () => {
  if (!form.value.estado) return error.value = "Seleccione un estado."
  loading.value = true
  error.value = ""
  try {
    await api.post(`/cartilla/colocaciones/${props.pago.id}/llamadas`, form.value)
    emit("saved")
    close()
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || "Error al registrar la llamada"
  } finally {
    loading.value = false
  }
}
</script>
