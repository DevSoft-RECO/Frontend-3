<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-8">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            Reposición de Cartilla
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Registra el egreso de 1 cartilla por deterioro o extravío.
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
            ID del Asociado *
          </label>
          <input
            v-model="form.codigo_cliente"
            type="text"
            placeholder="5 a 7 dígitos..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
            Motivo / Detalle *
          </label>
          <textarea
            v-model="form.detalle"
            rows="3"
            placeholder="Ej. Cartilla mojada o extraviada por el asociado..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          ></textarea>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="ejecutarReposicion"
            :disabled="guardando"
            class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span v-if="guardando" class="animate-spin text-xs">⌛</span>
            Registrar Reposición
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'success'])

const guardando = ref(false)
const form = reactive({
  codigo_cliente: '',
  detalle: ''
})

watch(() => props.show, (val) => {
  if (val) {
    form.codigo_cliente = ''
    form.detalle = ''
  }
})

const ejecutarReposicion = async () => {
  if (!/^\d{5,7}$/.test(form.codigo_cliente.trim())) {
    Swal.fire({
      icon: 'warning',
      title: 'ID Inválido',
      text: 'El ID del asociado debe contener entre 5 y 7 dígitos.',
      background: '#1f2937',
      color: '#fff'
    })
    return
  }

  if (!form.detalle.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Detalle Requerido',
      text: 'Escriba la razón de la reposición de cartilla.',
      background: '#1f2937',
      color: '#fff'
    })
    return
  }

  guardando.value = true
  try {
    await api.post('/cartilla/inventario/movimientos', {
      recurso: 'CARTILLAS',
      tipo_movimiento: 'EGRESO',
      cantidad: 1,
      codigo_cliente: form.codigo_cliente.trim(),
      detalle: `REPOSICIÓN DE CARTILLA: ${form.detalle.trim()}`
    })

    Swal.fire({
      icon: 'success',
      title: 'Reposición Registrada',
      text: 'Se descontó 1 cartilla del inventario de la agencia.',
      timer: 2000,
      showConfirmButton: false,
      background: '#1f2937',
      color: '#fff'
    })

    emit('success')
    emit('close')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error de Reposición',
      text: error.response?.data?.error || error.response?.data?.message || 'No se pudo registrar la reposición.',
      background: '#1f2937',
      color: '#fff'
    })
  } finally {
    guardando.value = false
  }
}
</script>
