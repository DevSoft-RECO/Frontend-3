<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Inventario Central
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Libro de Kárdex y asignación de existencias a agencias
        </p>
      </div>

      <button
        @click="abrirNuevo"
        class="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
               text-white font-bold rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
      >
        ➕ Registrar Movimiento Manual
      </button>
    </div>

    <!-- Stocks Panel -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider">Stickers en Central</span>
          <h2 class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ getCentralQty('STICKERS') }}</h2>
        </div>
        <div class="text-3xl">🎫</div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider">Cartillas en Central</span>
          <h2 class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ getCentralQty('CARTILLAS') }}</h2>
        </div>
        <div class="text-3xl">📖</div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span class="text-xs font-bold text-gray-550 dark:text-gray-400 uppercase tracking-wider">Total Promocionales</span>
          <h2 class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ getCentralPromoTotal() }}</h2>
        </div>
        <div class="text-3xl">🎁</div>
      </div>
    </div>

    <!-- Filtros de Kárdex -->
    <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Recurso -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Recurso</label>
          <select
            v-model="filtros.recurso"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los recursos</option>
            <option value="STICKERS">Stickers</option>
            <option value="CARTILLAS">Cartillas</option>
            <option value="PROMOCIONAL">Promocionales</option>
          </select>
        </div>

        <!-- Tipo Movimiento -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipo Movimiento</label>
          <select
            v-model="filtros.tipo_movimiento"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos</option>
            <option value="INGRESO">Ingreso (Entrada)</option>
            <option value="EGRESO">Egreso (Traslado/Consumo)</option>
          </select>
        </div>

        <!-- Agencia Destino -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Agencia Destino</label>
          <select
            v-model="filtros.agencia_id"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las agencias</option>
            <option v-for="ag in catalogosStore.agencias" :key="ag.id" :value="ag.id">
              {{ ag.nombre }}
            </option>
          </select>
        </div>

        <!-- Botones Filtros -->
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

    <!-- Tabla Kárdex -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <BaseTable
        :columns="tableHeaders"
        :rows="inventarioStore.movimientos"
        :loading="inventarioStore.loading"
      >
        <template #cell-agencia="{ row }">
          <span class="text-gray-700 dark:text-gray-300 font-semibold">
            {{ row.agencia?.nombre || 'Mercadeo Central' }}
          </span>
        </template>

        <template #cell-tipo_movimiento="{ row }">
          <span
            class="px-2.5 py-1 text-xs font-bold rounded-lg"
            :class="row.tipo_movimiento === 'INGRESO' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-650 dark:text-red-400'"
          >
            {{ row.tipo_movimiento }}
          </span>
        </template>

        <template #cell-recurso="{ row }">
          <span class="text-gray-900 dark:text-white font-medium">
            {{ row.recurso }}
            <span v-if="row.nombre_promocional" class="text-gray-500 dark:text-gray-400 text-xs block">
              ({{ row.nombre_promocional }})
            </span>
          </span>
        </template>

        <template #cell-cantidad="{ row }">
          <span class="font-bold text-gray-900 dark:text-white">
            {{ row.tipo_movimiento === 'INGRESO' ? '+' : '-' }}{{ row.cantidad }}
          </span>
        </template>

        <template #cell-alcance="{ row }">
          <span class="text-xs uppercase font-mono tracking-wider" :class="getAlcanceClass(row.alcance)">
            {{ row.alcance }}
          </span>
        </template>

        <template #cell-fecha="{ row }">
          <span class="text-gray-550 dark:text-gray-400 text-xs">
            {{ formatDate(row.created_at) }}
          </span>
        </template>

        <template #cell-acciones="{ row }">
          <div v-if="row.es_manual" class="flex items-center gap-2">
            <button
              @click="abrirEditar(row)"
              class="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              title="Editar"
            >
              ✏️
            </button>
            <button
              @click="confirmarEliminar(row.id)"
              class="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
          <span v-else class="text-xs text-gray-400 dark:text-gray-650 font-mono select-none">SISTEMA</span>
        </template>
      </BaseTable>

      <div class="px-6 py-4 border-t border-gray-800">
        <BasePagination
          :current-page="inventarioStore.pagination.current_page"
          :last-page="inventarioStore.pagination.last_page"
          @change-page="cambiarPagina"
        />
      </div>
    </div>

    <!-- Modales -->
    <MovimientoModal
      v-if="modalAbierto"
      :movimiento="movimientoActivo"
      @close="cerrarModal"
      @saved="alGuardar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import BaseTable from '@/components/ui/BaseTable.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import MovimientoModal from './components/MovimientoModal.vue'
import { useCartillaInventarioStore } from '@/stores/cartilla/inventario'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'

const inventarioStore = useCartillaInventarioStore()
const catalogosStore = useCartillaCatalogosStore()

const filtros = ref({
  recurso: '',
  tipo_movimiento: '',
  agencia_id: '',
  page: 1
})

const tableHeaders = [
  { key: 'codigo', label: 'Código' },
  { key: 'tipo_movimiento', label: 'Tipo' },
  { key: 'recurso', label: 'Recurso' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'agencia', label: 'Ubicación' },
  { key: 'alcance', label: 'Alcance' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'acciones', label: 'Acciones', class: 'text-right' }
]

const modalAbierto = ref(false)
const movimientoActivo = ref(null)

onMounted(() => {
  catalogosStore.fetchAgencias()
  inventarioStore.fetchStocks()
  cargar()
})

const cargar = () => {
  inventarioStore.fetchMovimientos(filtros.value)
}

const filtrar = () => {
  filtros.value.page = 1
  cargar()
}

const limpiar = () => {
  filtros.value = {
    recurso: '',
    tipo_movimiento: '',
    agencia_id: '',
    page: 1
  }
  cargar()
}

const cambiarPagina = (p) => {
  filtros.value.page = p
  cargar()
}

const abrirNuevo = () => {
  movimientoActivo.value = null
  modalAbierto.value = true
}

const abrirEditar = (item) => {
  movimientoActivo.value = item
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const alGuardar = () => {
  cerrarModal()
  cargar()
  inventarioStore.fetchStocks()
}

const confirmarEliminar = async (id) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción restará del inventario el stock correspondiente. No se puede revertir si el stock actual quedaría en negativo.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#1f2937',
    color: '#fff'
  })

  if (result.isConfirmed) {
    try {
      await inventarioStore.eliminarMovimiento(id)
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El movimiento ha sido borrado del Kárdex.',
        icon: 'success',
        background: '#1f2937',
        color: '#fff'
      })
      cargar()
      inventarioStore.fetchStocks()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err || 'No se pudo eliminar el movimiento',
        icon: 'error',
        background: '#1f2937',
        color: '#fff'
      })
    }
  }
}

// Helpers de stock
const getCentralQty = (recurso) => {
  const central = inventarioStore.stocks.central || []
  const stock = central.find(s => s.recurso === recurso)
  return stock ? stock.cantidad : 0
}

const getCentralPromoTotal = () => {
  const central = inventarioStore.stocks.central || []
  return central
    .filter(s => s.recurso === 'PROMOCIONAL')
    .reduce((sum, current) => sum + current.cantidad, 0)
}

const getAlcanceClass = (a) => {
  const classes = {
    'central': 'text-cyan-400',
    'traslado': 'text-amber-400',
    'consumo-registro': 'text-emerald-400',
    'reposicion': 'text-red-400'
  }
  return classes[a] || 'text-white'
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
