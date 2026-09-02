<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Historial de Inventario
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Trazabilidad y restauración de movimientos manuales (Kárdex)
      </p>
    </div>

    <!-- Filtros -->
    <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Estado Cambio -->
        <div>
          <label class="block text-xs font-bold text-gray-555 dark:text-gray-400 uppercase tracking-wider mb-2">Operación</label>
          <select
            v-model="filtros.estado_cambio"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas</option>
            <option value="EDITADO">Editados</option>
            <option value="ELIMINADO">Eliminados</option>
          </select>
        </div>

        <!-- Botones -->
        <div class="flex items-end gap-2 col-span-2">
          <button
            @click="filtrar"
            class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
          >
            Filtrar
          </button>
          <button
            @click="limpiar"
            class="px-4 py-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-500 dark:text-gray-400 font-medium rounded-xl text-sm cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <BaseTable
        :columns="tableHeaders"
        :rows="historialStore.historialInventario"
        :loading="historialStore.loading"
      >
        <template #cell-movimiento="{ row }">
          <span class="font-mono text-gray-700 dark:text-gray-300 font-bold">
            {{ row.movimiento?.codigo || row.snapshot?.codigo || 'Sin Código' }}
          </span>
        </template>

        <template #cell-estado_cambio="{ row }">
          <span
            class="px-2 py-0.5 rounded text-xs font-bold font-mono"
            :class="row.estado_cambio === 'EDITADO' ? 'bg-amber-500/10 text-amber-605 dark:text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20'"
          >
            {{ row.estado_cambio }}
          </span>
        </template>

        <template #cell-nombre_usuario="{ row }">
          <span class="text-gray-700 dark:text-gray-300 text-sm">{{ row.nombre_usuario }}</span>
        </template>

        <template #cell-restaurado="{ row }">
          <span
            class="px-2 py-0.5 rounded text-xs font-bold"
            :class="row.restaurado ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-450'"
          >
            {{ row.restaurado ? 'RESTAURADO' : 'PENDIENTE' }}
          </span>
        </template>

        <template #cell-fecha="{ row }">
          <span class="text-gray-550 dark:text-gray-400 text-xs">
            {{ formatDate(row.ejecutado_en) }}
          </span>
        </template>

        <template #cell-acciones="{ row }">
          <div class="flex items-center gap-2">
            <button
              @click="verDetalle(row)"
              class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-gray-750 dark:text-white rounded-lg transition-colors cursor-pointer"
            >
              🔎 Snapshot
            </button>
            <button
              v-if="!row.restaurado"
              @click="confirmarRestauracion(row.id)"
              class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
            >
              🔄 Restaurar
            </button>
          </div>
        </template>
      </BaseTable>

      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <BasePagination
          :current-page="historialStore.paginationInventario?.current_page"
          :last-page="historialStore.paginationInventario?.last_page"
          @change-page="cambiarPagina"
        />
      </div>
    </div>

    <!-- Modal Snapshot -->
    <HistorialDetalleModal
      v-if="modalAbierto"
      :snapshot="snapshotActivo"
      @close="cerrarModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import BaseTable from '@/components/ui/BaseTable.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import HistorialDetalleModal from './components/HistorialDetalleModal.vue'
import { useCartillaHistorialStore } from '@/stores/cartilla/historial'

const historialStore = useCartillaHistorialStore()

const filtros = ref({
  estado_cambio: '',
  page: 1
})

const tableHeaders = [
  { key: 'id', label: 'ID Cambio' },
  { key: 'movimiento', label: 'Movimiento' },
  { key: 'estado_cambio', label: 'Operación' },
  { key: 'nombre_usuario', label: 'Usuario Cambio' },
  { key: 'restaurado', label: 'Estado' },
  { key: 'fecha', label: 'Fecha Cambio' },
  { key: 'acciones', label: 'Acciones', class: 'text-right' }
]

const modalAbierto = ref(false)
const snapshotActivo = ref(null)

onMounted(() => {
  cargar()
})

const cargar = () => {
  historialStore.fetchHistorialInventario(filtros.value)
}

const filtrar = () => {
  filtros.value.page = 1
  cargar()
}

const limpiar = () => {
  filtros.value = {
    estado_cambio: '',
    page: 1
  }
  cargar()
}

const cambiarPagina = (p) => {
  filtros.value.page = p
  cargar()
}

const verDetalle = (item) => {
  snapshotActivo.value = item.snapshot
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const confirmarRestauracion = async (id) => {
  const result = await Swal.fire({
    title: '¿Deseas restaurar este movimiento?',
    text: 'Se revertirán las cantidades del inventario actual a los valores del snapshot. Se verificará que no quede stock negativo.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, restaurar',
    cancelButtonText: 'Cancelar',
    background: '#1f2937',
    color: '#fff'
  })

  if (result.isConfirmed) {
    try {
      await historialStore.restaurarMovimiento(id)
      Swal.fire({
        title: '¡Restaurado!',
        text: 'El movimiento de inventario ha sido revertido exitosamente.',
        icon: 'success',
        background: '#1f2937',
        color: '#fff'
      })
      cargar()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err || 'No se pudo completar la restauración',
        icon: 'error',
        background: '#1f2937',
        color: '#fff'
      })
    }
  }
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
