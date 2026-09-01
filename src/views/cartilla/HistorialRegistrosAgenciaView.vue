<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Historial de Registros (Agencia)
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Auditoría de participaciones modificadas y eliminadas en su agencia
        </p>
      </div>

      <button
        @click="cargar"
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm cursor-pointer flex items-center gap-2"
      >
        <span>🔄</span> Refrescar Historial
      </button>
    </div>

    <!-- Filtros de Búsqueda -->
    <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Estado de Cambio</label>
          <select
            v-model="filtros.estado_cambio"
            @change="cargar"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los cambios</option>
            <option value="EDITADO">Editados</option>
            <option value="ELIMINADO">Eliminados</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Código Registro</label>
          <input
            v-model="filtros.registro_codigo"
            @keyup.enter="cargar"
            type="text"
            placeholder="Ej. REG-0000001..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>

    <!-- Tabla de Historial -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <BaseTable
        :columns="tableHeaders"
        :rows="historialStore.historialRegistros"
        :loading="historialStore.loading"
      >
        <template #cell-registro="{ row }">
          <span class="font-mono text-gray-700 dark:text-gray-300 font-bold text-xs">
            {{ row.registro?.codigo || row.snapshot?.codigo || 'Sin Código' }}
          </span>
        </template>

        <template #cell-estado_cambio="{ row }">
          <span
            class="px-2 py-0.5 rounded text-xs font-bold font-mono"
            :class="row.estado_cambio === 'EDITADO' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'"
          >
            {{ row.estado_cambio }}
          </span>
        </template>

        <template #cell-nombre_usuario="{ row }">
          <span class="text-xs text-gray-700 dark:text-gray-300 font-medium">{{ row.nombre_usuario }}</span>
        </template>

        <template #cell-ejecutado_en="{ row }">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ new Date(row.ejecutado_en).toLocaleString('es-GT') }}
          </span>
        </template>

        <template #cell-acciones="{ row }">
          <button
            @click="verDetalle(row)"
            class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-lg text-xs cursor-pointer"
          >
            👁️ Ver Snapshot
          </button>
        </template>
      </BaseTable>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <BasePagination
          :current_page="historialStore.paginationRegistros?.current_page"
          :last_page="historialStore.paginationRegistros?.last_page"
          @change-page="cambiarPagina"
        />
      </div>
    </div>

    <!-- Modal Snapshot -->
    <HistorialDetalleModal
      v-if="modalDetalleShow && itemSeleccionado"
      :snapshot="itemSeleccionado.snapshot || itemSeleccionado"
      @close="modalDetalleShow = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartillaHistorialStore } from '@/stores/cartilla/historial'
import BaseTable from '@/components/ui/BaseTable.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import HistorialDetalleModal from './components/HistorialDetalleModal.vue'

const historialStore = useCartillaHistorialStore()

const modalDetalleShow = ref(false)
const itemSeleccionado = ref(null)

const filtros = ref({
  estado_cambio: '',
  registro_codigo: '',
  page: 1
})

const tableHeaders = [
  { key: 'registro', label: 'Registro' },
  { key: 'estado_cambio', label: 'Estado' },
  { key: 'nombre_usuario', label: 'Usuario Modificador' },
  { key: 'ejecutado_en', label: 'Fecha Cambio' },
  { key: 'acciones', label: 'Acciones', class: 'text-right' }
]

onMounted(() => {
  cargar()
})

const cargar = () => {
  historialStore.fetchHistorialRegistros(filtros.value)
}

const cambiarPagina = (page) => {
  filtros.value.page = page
  cargar()
}

const verDetalle = (item) => {
  itemSeleccionado.value = item
  modalDetalleShow.value = true
}
</script>
