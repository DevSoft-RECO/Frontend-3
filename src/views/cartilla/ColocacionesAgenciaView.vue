<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Pagos Automáticos (Agencia)
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Bandeja de créditos bancarios automáticos correspondientes a su agencia para reclamar como participación puntual
        </p>
      </div>
      <button
        @click="buscar"
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm cursor-pointer flex items-center gap-2"
      >
        <span>🔄</span> Refrescar Datos
      </button>
    </div>

    <!-- Filtros de Búsqueda -->
    <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">ID Asociado</label>
          <input
            v-model="filtros.codigo_cliente"
            @keyup.enter="buscar"
            type="text"
            placeholder="Buscar por ID..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Número de Cuenta</label>
          <input
            v-model="filtros.numero_cuenta"
            @keyup.enter="buscar"
            type="text"
            placeholder="Buscar por cuenta..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Fecha Pago</label>
          <input
            v-model="filtros.fecha_pago"
            @change="buscar"
            type="date"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        <button
          @click="limpiarFiltros"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          Limpiar Filtros
        </button>
        <button
          @click="buscar"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          Buscar
        </button>
      </div>
    </div>

    <!-- Tabla de Pagos Pendientes -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <BaseTable
        :columns="tableColumns"
        :rows="colocacionesStore.pendientes"
        :loading="colocacionesStore.loading"
      >
        <template #cell-agencia="{ row }">
          <span class="font-bold text-gray-900 dark:text-white text-xs">{{ row.agencia?.nombre || '-' }}</span>
        </template>

        <template #cell-codigo_cliente="{ row }">
          <span class="font-mono text-gray-700 dark:text-gray-300 font-bold text-xs">{{ row.codigo_cliente }}</span>
        </template>

        <template #cell-numero_cuenta="{ row }">
          <span class="font-mono text-gray-600 dark:text-gray-400 text-xs">{{ row.numero_cuenta }}</span>
        </template>

        <template #cell-monto="{ row }">
          <span class="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
            Q {{ Number(row.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}
          </span>
        </template>

        <template #cell-fecha_pago="{ row }">
          <span class="text-xs text-gray-600 dark:text-gray-400">{{ formatearFechaTabla(row.fecha_pago) }}</span>
        </template>

        <template #cell-acciones="{ row }">
          <button
            @click="abrirReclamo(row)"
            class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
          >
            <span>✨</span> Reclamar
          </button>
        </template>
      </BaseTable>

      <!-- Paginador -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <BasePagination
          :current_page="colocacionesStore.pagination?.currentPage"
          :last_page="colocacionesStore.pagination?.lastPage"
          @change-page="cambiarPagina"
        />
      </div>
    </div>

    <!-- Modal Reclamar Pago -->
    <ReclamarModal
      :show="modalReclamoShow"
      :pago="pagoSeleccionado"
      @close="modalReclamoShow = false"
      @success="buscar"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useColocacionesStore } from '@/stores/cartilla/colocaciones'
import BaseTable from '@/components/ui/BaseTable.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import ReclamarModal from './components/ReclamarModal.vue'

const colocacionesStore = useColocacionesStore()

const modalReclamoShow = ref(false)
const pagoSeleccionado = ref(null)

const filtros = reactive({
  codigo_cliente: '',
  numero_cuenta: '',
  fecha_pago: '',
})

const tableColumns = [
  { key: 'fecha_pago', label: 'Fecha Pago' },
  { key: 'agencia', label: 'Agencia' },
  { key: 'codigo_cliente', label: 'ID Asociado' },
  { key: 'numero_cuenta', label: 'No. Cuenta' },
  { key: 'monto', label: 'Monto' },
  { key: 'acciones', label: 'Acciones', class: 'text-right' },
]

onMounted(() => {
  buscar()
})

const formatearFechaTabla = (str) => {
  if (!str) return '-'
  return str.split('T')[0].split(' ')[0]
}

const buscar = () => {
  colocacionesStore.fetchPendientes({ ...filtros, page: 1 })
}

const cambiarPagina = (page) => {
  colocacionesStore.fetchPendientes({ ...filtros, page })
}

const limpiarFiltros = () => {
  filtros.codigo_cliente = ''
  filtros.numero_cuenta = ''
  filtros.fecha_pago = ''
  buscar()
}

const abrirReclamo = (pago) => {
  pagoSeleccionado.value = pago
  modalReclamoShow.value = true
}
</script>
