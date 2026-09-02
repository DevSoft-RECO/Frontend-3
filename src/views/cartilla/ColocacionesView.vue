<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Pagos Automáticos (Colocaciones)
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Bandeja de créditos bancarios automáticos elegibles para reclamar como participación puntual
        </p>
      </div>
    </div>

    <!-- Sección Carga CSV (Solo Mercadeo / Admins) -->
    <div v-if="esAdminMercadeo" class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📤</span> Cargar Archivo CSV de Colocaciones
        </h3>
        <span class="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20">
          Perfil Mercadeo
        </span>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Sube el reporte de colocaciones en formato CSV para poblar automáticamente la bandeja de pagos pendientes de las 18 agencias.
      </p>

      <div class="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="file"
          ref="fileInput"
          accept=".csv,.txt"
          class="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
        />
        <button
          @click="procesarCsv"
          :disabled="colocacionesStore.importing"
          class="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="colocacionesStore.importing" class="animate-spin text-sm">⌛</span>
          <span>⚡</span> Cargar y Procesar CSV
        </button>
      </div>
    </div>

    <!-- Filtros de Búsqueda -->
    <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Agencia</label>
          <select
            v-model="filtros.agencia_id"
            @change="buscar"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las Agencias</option>
            <option v-for="a in catalogosStore.agencias" :key="a.id" :value="a.id">
              {{ a.nombre }}
            </option>
          </select>
        </div>

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
          :current-page="colocacionesStore.pagination.currentPage"
          :total-pages="colocacionesStore.pagination.lastPage"
          @page-change="cambiarPagina"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useColocacionesStore } from '@/stores/cartilla/colocaciones'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'
import { useAuthStore } from '@/stores/auth'
import BaseTable from '@/components/ui/BaseTable.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import ReclamarModal from './components/ReclamarModal.vue'
import Swal from 'sweetalert2'

const colocacionesStore = useColocacionesStore()
const catalogosStore = useCartillaCatalogosStore()
const authStore = useAuthStore()

const fileInput = ref(null)
const modalReclamoShow = ref(false)
const pagoSeleccionado = ref(null)

const esAdminMercadeo = computed(() => {
  return authStore.hasPermission('admin_promocion') ||
         authStore.hasPermission('cartilla_mercadeo') ||
         authStore.hasRole('Super Admin')
})

const filtros = reactive({
  agencia_id: '',
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
  catalogosStore.fetchAgencias()
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
  filtros.agencia_id = ''
  filtros.codigo_cliente = ''
  filtros.numero_cuenta = ''
  filtros.fecha_pago = ''
  buscar()
}

const procesarCsv = async () => {
  const files = fileInput.value?.files
  if (!files || !files.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Archivo requerido',
      text: 'Selecciona un archivo CSV para procesar.',
      background: '#1f2937',
      color: '#fff'
    })
    return
  }

  try {
    const res = await colocacionesStore.importarCsv(files[0])
    fileInput.value.value = ''
    buscar()

    const d = res.descartes || {}
    let detalleDescartes = ''
    if (res.filas_elegibles === 0 && d) {
      detalleDescartes = `
        <div class="text-left text-xs space-y-1 mt-3 p-3 bg-gray-800 rounded-lg text-gray-300">
          <p class="font-bold text-amber-400">Desglose de filas descartadas:</p>
          <ul class="list-disc pl-4 space-y-0.5">
            ${d.area_financiera_no_mapeada ? `<li>Área financiera no coincide con agencias: <b>${d.area_financiera_no_mapeada}</b></li>` : ''}
            ${d.prefijo_no_coincide ? `<li>Prefijo de cuenta no coincide: <b>${d.prefijo_no_coincide}</b></li>` : ''}
            ${d.no_puntual_pago_con_mora ? `<li>No son pagos puntuales (mora / fechas distintas): <b>${d.no_puntual_pago_con_mora}</b></li>` : ''}
            ${d.fuera_rango_promocion ? `<li>Fecha de pago fuera de la promoción: <b>${d.fuera_rango_promocion}</b></li>` : ''}
            ${d.ya_registrado ? `<li>Pagos ya registrados previamente: <b>${d.ya_registrado}</b></li>` : ''}
            ${d.monto_invalido ? `<li>Monto menor o igual a cero: <b>${d.monto_invalido}</b></li>` : ''}
          </ul>
        </div>
      `
    }

    Swal.fire({
      icon: res.filas_elegibles > 0 ? 'success' : 'info',
      title: 'Proceso finalizado',
      html: `Se leyeron <b>${res.total_filas}</b> filas del CSV y se registraron <b>${res.filas_elegibles}</b> pagos automáticos elegibles.${detalleDescartes}`,
      background: '#1f2937',
      color: '#fff'
    })
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error en importación',
      text: typeof err === 'string' ? err : 'Error al procesar el archivo CSV',
      background: '#1f2937',
      color: '#fff'
    })
  }
}

const abrirReclamo = (pago) => {
  pagoSeleccionado.value = pago
  modalReclamoShow.value = true
}
</script>
