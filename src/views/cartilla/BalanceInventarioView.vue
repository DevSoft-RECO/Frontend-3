<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Balance de Inventario
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Resumen detallado de Entregado, Disponible y Total por recurso (Cartillas, Stickers y Promocionales)
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="imprimirReporte"
          class="px-4 py-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-bold rounded-xl text-sm cursor-pointer flex items-center gap-2"
        >
          <span>🖨️</span> Imprimir / Exportar PDF
        </button>
        <button
          @click="cargarBalance"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm cursor-pointer flex items-center gap-2"
        >
          <span>🔄</span> Refrescar
        </button>
      </div>
    </div>

    <!-- Filtros de Búsqueda -->
    <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4 print:hidden">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Agencia / Central</label>
          <select
            v-model="filtros.agencia_id"
            :disabled="!esAdminMercadeo"
            @change="cargarBalance"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <option value="" v-if="esAdminMercadeo">Almacén Central (Global)</option>
            <option v-for="ag in catalogosStore.agencias" :key="ag.id" :value="ag.id">
              {{ ag.nombre }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Fecha Inicio</label>
          <input
            v-model="filtros.fecha_inicio"
            @change="cargarBalance"
            type="date"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Fecha Fin</label>
          <input
            v-model="filtros.fecha_fin"
            @change="cargarBalance"
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
          @click="cargarBalance"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          Filtrar Balance
        </button>
      </div>
    </div>

    <!-- Banner Info Agencia -->
    <div class="p-4 bg-gray-900 text-white rounded-2xl flex justify-between items-center shadow-lg">
      <div>
        <span class="text-xs uppercase font-bold text-emerald-400 block">Ubicación del Balance:</span>
        <h2 class="text-lg font-extrabold">{{ inventarioStore.balance?.agencia?.nombre || 'Cargando...' }}</h2>
      </div>
      <div class="text-right">
        <span class="text-xs text-gray-400 block">Código:</span>
        <span class="font-mono text-sm font-bold bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
          {{ inventarioStore.balance?.agencia?.codigo || '-' }}
        </span>
      </div>
    </div>

    <!-- Tarjetas de Resumen General -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Tarjeta Cartillas -->
      <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📋</span> Balance de Cartillas Físicas
          </h3>
          <span class="text-xs font-bold px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
            Cartillas
          </span>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Entregadas</span>
            <span class="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {{ inventarioStore.balance?.balance?.cartillas?.entregado || 0 }}
            </span>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Disponible</span>
            <span class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {{ inventarioStore.balance?.balance?.cartillas?.disponible || 0 }}
            </span>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Total General</span>
            <span class="text-xl font-extrabold text-gray-900 dark:text-white">
              {{ inventarioStore.balance?.balance?.cartillas?.total || 0 }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tarjeta Stickers -->
      <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>⭐</span> Balance de Stickers (Planillas)
          </h3>
          <span class="text-xs font-bold px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
            Stickers
          </span>
        </div>

        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Entregados</span>
            <span class="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {{ inventarioStore.balance?.balance?.stickers?.entregado || 0 }}
            </span>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Disponible</span>
            <span class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {{ inventarioStore.balance?.balance?.stickers?.disponible || 0 }}
            </span>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">Total General</span>
            <span class="text-xl font-extrabold text-gray-900 dark:text-white">
              {{ inventarioStore.balance?.balance?.stickers?.total || 0 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla Detalle de Promocionales -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
      <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🎁</span> Desglose de Promocionales por Catálogo
        </h3>
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Totales acumulados
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead class="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
            <tr>
              <th scope="col" class="px-6 py-3">Promocional</th>
              <th scope="col" class="px-6 py-3">Estado Catálogo</th>
              <th scope="col" class="px-6 py-3 text-center">Entregados</th>
              <th scope="col" class="px-6 py-3 text-center">Stock Disponible</th>
              <th scope="col" class="px-6 py-3 text-center">Total (Entregado + Stock)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr
              v-for="promo in inventarioStore.balance?.balance?.promocionales || []"
              :key="promo.id"
              class="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850"
            >
              <td class="px-6 py-4 font-bold text-gray-900 dark:text-white">
                {{ promo.nombre }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 text-xs font-bold rounded-lg border"
                  :class="promo.activo ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500'"
                >
                  {{ promo.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                {{ promo.entregado }}
              </td>
              <td class="px-6 py-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                {{ promo.disponible }}
              </td>
              <td class="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                {{ promo.total }}
              </td>
            </tr>
            <tr v-if="!(inventarioStore.balance?.balance?.promocionales?.length)">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No hay promocionales registrados en el catálogo.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useCartillaInventarioStore } from '@/stores/cartilla/inventario'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'
import { useAuthStore } from '@/stores/auth'

const inventarioStore = useCartillaInventarioStore()
const catalogosStore = useCartillaCatalogosStore()
const authStore = useAuthStore()

const esAdminMercadeo = computed(() => {
  return authStore.user?.roles_list?.includes('Super Admin') || 
         authStore.user?.permissions_list?.includes('cartilla_mercadeo')
})

const filtros = reactive({
  agencia_id: '',
  fecha_inicio: '',
  fecha_fin: '',
})

onMounted(async () => {
  await catalogosStore.fetchAgencias()

  if (!esAdminMercadeo.value) {
    const userAgenciaCodigo = authStore.user?.agencia_id || authStore.user?.idagencia
    const miAgencia = catalogosStore.agencias.find(a => a.codigo === userAgenciaCodigo || a.id == userAgenciaCodigo)
    if (miAgencia) {
      filtros.agencia_id = miAgencia.id
    }
  }
  cargarBalance()
})

const cargarBalance = () => {
  inventarioStore.fetchBalance(filtros)
}

const limpiarFiltros = () => {
  if (esAdminMercadeo.value) {
    filtros.agencia_id = ''
  }
  filtros.fecha_inicio = ''
  filtros.fecha_fin = ''
  cargarBalance()
}

const imprimirReporte = () => {
  window.print()
}
</script>
