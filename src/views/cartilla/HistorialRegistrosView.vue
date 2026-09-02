<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Historial de Registros
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Auditoría de cambios y eliminaciones de participaciones
      </p>
    </div>

    <!-- Filtros -->
    <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Estado Cambio -->
        <div>
          <label class="block text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Operación</label>
          <select
            v-model="filtros.estado_cambio"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas</option>
            <option value="EDITADO">Editado</option>
            <option value="ELIMINADO">Eliminado</option>
          </select>
        </div>

        <!-- Código Registro -->
        <div>
          <label class="block text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider mb-2">Código Registro</label>
          <input
            type="text"
            v-model="filtros.registro_codigo"
            placeholder="REG-0000000..."
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm font-mono"
          />
        </div>

        <!-- Botones -->
        <div class="flex items-end gap-2">
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
        :rows="historialStore.historialRegistros"
        :loading="historialStore.loading"
      >
        <template #cell-registro="{ row }">
          <span class="font-mono text-gray-700 dark:text-gray-300 font-bold">
            {{ row.registro?.codigo || row.snapshot?.codigo || 'Sin Código' }}
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

        <template #cell-fecha="{ row }">
          <span class="text-gray-550 dark:text-gray-400 text-xs">
            {{ formatDate(row.ejecutado_en) }}
          </span>
        </template>

        <template #cell-acciones="{ row }">
          <button
            @click="verDetalle(row)"
            class="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-bold text-gray-750 dark:text-white rounded-lg transition-colors cursor-pointer"
          >
            🔎 Ver Snapshot
          </button>
        </template>
      </BaseTable>

      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <BasePagination
          :current-page="historialStore.paginationRegistros?.current_page"
          :last-page="historialStore.paginationRegistros?.last_page"
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
import BaseTable from '@/components/ui/BaseTable.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import HistorialDetalleModal from './components/HistorialDetalleModal.vue'
import { useCartillaHistorialStore } from '@/stores/cartilla/historial'

const historialStore = useCartillaHistorialStore()

const filtros = ref({
  estado_cambio: '',
  registro_codigo: '',
  page: 1
})

const tableHeaders = [
  { key: 'id', label: 'ID Cambio' },
  { key: 'registro', label: 'Registro' },
  { key: 'estado_cambio', label: 'Operación' },
  { key: 'nombre_usuario', label: 'Usuario Cambio' },
  { key: 'fecha', label: 'Fecha Cambio' },
  { key: 'acciones', label: 'Auditoría', class: 'text-right' }
]

const modalAbierto = ref(false)
const snapshotActivo = ref(null)

onMounted(() => {
  cargar()
})

const cargar = () => {
  historialStore.fetchHistorialRegistros(filtros.value)
}

const filtrar = () => {
  filtros.value.page = 1
  cargar()
}

const limpiar = () => {
  filtros.value = {
    estado_cambio: '',
    registro_codigo: '',
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
