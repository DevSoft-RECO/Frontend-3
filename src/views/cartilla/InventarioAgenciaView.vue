<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Inventario (Agencia)
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Consulta de existencias y movimientos correspondientes a su agencia
        </p>
      </div>

      <div class="flex gap-3">
        <button
          @click="cargar"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer flex items-center gap-2"
        >
          <span>🔄</span> Refrescar Datos
        </button>
        <button
          @click="modalReposicionShow = true"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-900/20"
        >
          <span>📇</span> Reposición de Cartilla
        </button>
      </div>
    </div>

    <!-- TARJETAS DE STOCK ACTUAL EN LA AGENCIA -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Cartillas Stock -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <p class="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Cartillas Disponibles</p>
          <h3 class="text-3xl font-black text-gray-900 dark:text-white mt-1">{{ stockCartillas }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Existencia en agencia</p>
        </div>
        <div class="p-3.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
          <span class="text-3xl">📇</span>
        </div>
      </div>

      <!-- Stickers Stock -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <p class="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Stickers Disponibles</p>
          <h3 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{{ stockStickers }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Existencia en agencia</p>
        </div>
        <div class="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
          <span class="text-3xl">⭐</span>
        </div>
      </div>

      <!-- Promocionales Stock -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <p class="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Promocionales Disponibles</p>
          <h3 class="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{{ stockPromocionalesTotal }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Total artículos en stock</p>
        </div>
        <div class="p-3.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
          <span class="text-3xl">🎁</span>
        </div>
      </div>
    </div>

    <!-- DESGLOSE DE ARTÍCULOS PROMOCIONALES SI EXISTEN -->
    <div v-if="promocionalesLista.length" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl space-y-3">
      <h3 class="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-2">
        <span>📦</span> Detalle de Artículos Promocionales en Agencia
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          v-for="p in promocionalesLista"
          :key="p.id"
          class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center"
        >
          <span class="text-xs font-bold text-gray-900 dark:text-white truncate">{{ p.nombre_promocional }}</span>
          <span class="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            {{ p.cantidad }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tabla de Kárdex -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-955">
        <h3 class="font-bold text-gray-900 dark:text-white text-sm">
          Movimientos Registrados en Agencia
        </h3>
      </div>

      <BaseTable
        :columns="tableHeaders"
        :rows="inventarioStore.movimientos"
        :loading="inventarioStore.loading"
      >
        <template #cell-codigo="{ row }">
          <span class="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{{ row.codigo }}</span>
        </template>

        <template #cell-recurso="{ row }">
          <span class="font-bold text-xs text-gray-900 dark:text-white">
            {{ row.recurso === 'PROMOCIONAL' ? row.nombre_promocional : row.recurso }}
          </span>
        </template>

        <template #cell-tipo_movimiento="{ row }">
          <span
            class="px-2 py-0.5 rounded text-xs font-extrabold"
            :class="row.tipo_movimiento === 'INGRESO' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'"
          >
            {{ row.tipo_movimiento }}
          </span>
        </template>

        <template #cell-cantidad="{ row }">
          <span class="font-bold text-xs text-gray-900 dark:text-white">{{ row.cantidad }}</span>
        </template>

        <template #cell-detalle="{ row }">
          <span class="text-xs text-gray-600 dark:text-gray-400">{{ row.detalle || '-' }}</span>
        </template>

        <template #cell-fecha="{ row }">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ new Date(row.created_at).toLocaleString('es-GT') }}
          </span>
        </template>
      </BaseTable>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <BasePagination
          :current_page="inventarioStore.pagination?.current_page"
          :last_page="inventarioStore.pagination?.last_page"
          @change-page="cambiarPagina"
        />
      </div>
    </div>

    <!-- Modal Reposición de Cartilla -->
    <ReposicionCartillaModal
      :show="modalReposicionShow"
      @close="modalReposicionShow = false"
      @success="cargar"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartillaInventarioStore } from '@/stores/cartilla/inventario'
import { useAuthStore } from '@/stores/auth'
import BaseTable from '@/components/ui/BaseTable.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import ReposicionCartillaModal from './components/ReposicionCartillaModal.vue'

const inventarioStore = useCartillaInventarioStore()
const authStore = useAuthStore()

const modalReposicionShow = ref(false)

const tableHeaders = [
  { key: 'codigo', label: 'Código' },
  { key: 'recurso', label: 'Recurso' },
  { key: 'tipo_movimiento', label: 'Tipo' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'detalle', label: 'Detalle' },
  { key: 'fecha', label: 'Fecha' }
]

const miStockAgencia = computed(() => {
  const userCode = authStore.user?.agencia_id || authStore.user?.idagencia
  const agenciasObj = inventarioStore.stocks?.agencias || {}

  // Buscar por codigo o id de agencia
  for (const [code, items] of Object.entries(agenciasObj)) {
    if (code === userCode || items.some(i => i.agencia_id == userCode || i.agencia?.codigo === userCode)) {
      return items
    }
  }

  // Fallback si es admin o primera agencia
  const keys = Object.keys(agenciasObj)
  return keys.length ? agenciasObj[keys[0]] : []
})

const stockCartillas = computed(() => {
  const item = miStockAgencia.value.find(i => i.recurso === 'CARTILLAS')
  return item ? item.cantidad : 0
})

const stockStickers = computed(() => {
  const item = miStockAgencia.value.find(i => i.recurso === 'STICKERS')
  return item ? item.cantidad : 0
})

const stockPromocionalesTotal = computed(() => {
  return miStockAgencia.value
    .filter(i => i.recurso === 'PROMOCIONAL')
    .reduce((acc, i) => acc + (i.cantidad || 0), 0)
})

const promocionalesLista = computed(() => {
  return miStockAgencia.value.filter(i => i.recurso === 'PROMOCIONAL')
})

onMounted(() => {
  cargar()
})

const cargar = () => {
  inventarioStore.fetchMovimientos({ page: 1 })
  inventarioStore.fetchStocks()
}

const cambiarPagina = (page) => {
  inventarioStore.fetchMovimientos({ page })
}
</script>
