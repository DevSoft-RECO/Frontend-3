<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            Reclamar Pago Automático
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Convierte el crédito de colocación en un registro de participación formal.
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl cursor-pointer">
          ✕
        </button>
      </div>

      <!-- Resumen del Pago -->
      <div class="p-6 space-y-4">
        <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Agencia:</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ pago?.agencia?.nombre }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">ID Asociado:</span>
            <span class="font-bold font-mono text-gray-900 dark:text-white">{{ pago?.codigo_cliente }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Número de Cuenta:</span>
            <span class="font-bold font-mono text-gray-900 dark:text-white">{{ pago?.numero_cuenta }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Monto:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">Q {{ Number(pago?.monto || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Fecha Origen Pago:</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ formatearFecha(pago?.fecha_pago) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">Stickers asignados:</span>
            <span class="font-extrabold text-amber-500">⭐ 5 Stickers (Pago Puntual)</span>
          </div>
        </div>

        <!-- Formulario Opcionales (Promocional, Cartillas) -->
        <div class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Promocional Entregado (Opcional)
            </label>
            <select
              v-model="form.promocional_entregado"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Ninguno --</option>
              <option v-for="p in catalogosStore.promocionales" :key="p.id" :value="p.nombre">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <label class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer">
              <input type="checkbox" v-model="form.cartilla_nueva" class="rounded text-emerald-600 focus:ring-emerald-500" />
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Entrega Cartilla Nueva</span>
            </label>

            <label class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer">
              <input type="checkbox" v-model="form.cartilla_completada" class="rounded text-emerald-600 focus:ring-emerald-500" />
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Cartilla Completada</span>
            </label>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              Notas Adicionales
            </label>
            <textarea
              v-model="form.notas"
              rows="2"
              placeholder="Observación opcional para el registro..."
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>
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
            @click="ejecutarReclamo"
            :disabled="colocacionesStore.claiming"
            class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span v-if="colocacionesStore.claiming" class="animate-spin text-xs">⌛</span>
            Confirmar y Reclamar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useColocacionesStore } from '@/stores/cartilla/colocaciones'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'
import Swal from 'sweetalert2'

const props = defineProps({
  show: Boolean,
  pago: Object,
})

const emit = defineEmits(['close', 'success'])

const colocacionesStore = useColocacionesStore()
const catalogosStore = useCartillaCatalogosStore()

const formatearFecha = (str) => {
  if (!str) return '-'
  return str.split('T')[0].split(' ')[0]
}

const form = reactive({
  cartilla_nueva: false,
  cartilla_completada: false,
  promocional_entregado: '',
  notas: '',
})

watch(() => props.show, (val) => {
  if (val) {
    catalogosStore.fetchPromocionales()
    form.cartilla_nueva = false
    form.cartilla_completada = false
    form.promocional_entregado = ''
    form.notas = ''
  }
})

const ejecutarReclamo = async () => {
  if (!props.pago) return

  try {
    await colocacionesStore.reclamarPago(props.pago.id, { ...form })
    Swal.fire({
      icon: 'success',
      title: '¡Pago Reclamado!',
      text: 'Se creó el registro de participación formal y se aplicó el consumo de inventario.',
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
      title: 'Error de Reclamo',
      text: error.response?.data?.error || error.response?.data?.message || 'No se pudo reclamar este pago.',
      background: '#1f2937',
      color: '#fff'
    })
  }
}
</script>
