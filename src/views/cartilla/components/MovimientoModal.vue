<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ isEdit ? 'Editar Movimiento de Inventario' : 'Registrar Movimiento de Inventario' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer">✕</button>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-4">
        <div v-if="errorMsg" class="p-4 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-sm font-semibold">
          ⚠️ {{ errorMsg }}
        </div>

        <!-- Tipo Movimiento -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Tipo Movimiento</label>
          <div class="grid grid-cols-2 gap-4">
            <button
              @click="form.tipo_movimiento = 'INGRESO'"
              :disabled="isEdit"
              class="py-2.5 rounded-xl font-bold text-sm border transition-all duration-200 cursor-pointer"
              :class="form.tipo_movimiento === 'INGRESO'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              📥 Ingreso (Entrada)
            </button>
            <button
              @click="form.tipo_movimiento = 'EGRESO'"
              :disabled="isEdit"
              class="py-2.5 rounded-xl font-bold text-sm border transition-all duration-200 cursor-pointer"
              :class="form.tipo_movimiento === 'EGRESO'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                : 'bg-gray-50 dark:bg-gray-850 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
            >
              📤 Traslado (Egreso)
            </button>
          </div>
        </div>

        <!-- Recurso -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Recurso</label>
          <select
            v-model="form.recurso"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Seleccione Recurso...</option>
            <option value="STICKERS">Stickers</option>
            <option value="CARTILLAS">Cartillas</option>
            <option value="PROMOCIONAL">Promocional</option>
          </select>
        </div>

        <!-- Nombre Promocional -->
        <div v-if="form.recurso === 'PROMOCIONAL'">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Artículo Promocional</label>
          <select
            v-model="form.nombre_promocional"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Seleccione Artículo...</option>
            <option v-for="pr in catalogosStore.promocionales" :key="pr.id" :value="pr.nombre" :disabled="!pr.activo">
              {{ pr.nombre }} {{ !pr.activo ? '(Inactivo)' : '' }}
            </option>
          </select>
        </div>

        <!-- Agencia Destino (Solo si es EGRESO/Traslado) -->
        <div v-if="form.tipo_movimiento === 'EGRESO'">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Agencia Destino</label>
          <select
            v-model="form.agencia_destino_id"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Seleccione Agencia Destino...</option>
            <option v-for="ag in catalogosStore.agencias" :key="ag.id" :value="ag.id">
              {{ ag.nombre }}
            </option>
          </select>
        </div>

        <!-- Cantidad -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Cantidad</label>
          <input
            type="number"
            v-model="form.cantidad"
            placeholder="Ingrese cantidad..."
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
          />
        </div>

        <!-- Detalle -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Detalle / Notas</label>
          <textarea
            v-model="form.detalle"
            rows="2"
            placeholder="Anotación..."
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="guardar"
          :disabled="inventarioStore.loading"
          class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer"
        >
          <span v-if="inventarioStore.loading" class="animate-spin text-xs">⌛</span>
          {{ isEdit ? 'Actualizar' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useCartillaInventarioStore } from '@/stores/cartilla/inventario'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'

const props = defineProps({
  movimiento: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const inventarioStore = useCartillaInventarioStore()
const catalogosStore = useCartillaCatalogosStore()

const errorMsg = ref('')
const isEdit = computed(() => !!props.movimiento)

const form = ref({
  recurso: '',
  nombre_promocional: '',
  tipo_movimiento: 'INGRESO',
  cantidad: '',
  agencia_destino_id: '',
  detalle: ''
})

onMounted(() => {
  catalogosStore.fetchPromocionales()
  catalogosStore.fetchAgencias()

  if (isEdit.value && props.movimiento) {
    form.value = {
      recurso: props.movimiento.recurso,
      nombre_promocional: props.movimiento.nombre_promocional || '',
      tipo_movimiento: props.movimiento.tipo_movimiento,
      cantidad: props.movimiento.cantidad,
      agencia_destino_id: props.movimiento.agencia_destino_id || '',
      detalle: props.movimiento.detalle || ''
    }
  }
})

const guardar = async () => {
  errorMsg.value = ''

  if (!form.value.recurso) return errorMsg.value = 'Debe seleccionar un recurso.'
  if (form.value.recurso === 'PROMOCIONAL' && !form.value.nombre_promocional) return errorMsg.value = 'Debe seleccionar un artículo promocional.'
  if (!form.value.cantidad || parseInt(form.value.cantidad) <= 0) return errorMsg.value = 'Debe ingresar una cantidad mayor a cero.'
  if (form.value.tipo_movimiento === 'EGRESO' && !form.value.agencia_destino_id) return errorMsg.value = 'Debe seleccionar la agencia destino para el traslado.'

  try {
    if (isEdit.value) {
      await inventarioStore.editarMovimiento(props.movimiento.id, form.value)
    } else {
      await inventarioStore.crearMovimiento(form.value)
    }

    Swal.fire({
      title: '¡Operación Exitosa!',
      text: 'El movimiento ha sido asentado en el Kárdex central.',
      icon: 'success',
      background: '#1f2937',
      color: '#fff'
    })
    emit('saved')
  } catch (err) {
    errorMsg.value = err || 'Ocurrió un error al registrar el movimiento'
  }
}
</script>
