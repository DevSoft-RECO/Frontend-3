<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Registros de Participación (Agencia)
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Captura y consulta de participaciones de asociados de su agencia
        </p>
      </div>

      <button
        v-if="puedeEditar"
        @click="abrirModalNuevo"
        class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-900/20"
      >
        <span>➕</span> Nuevo Registro
      </button>
    </div>

    <!-- Filtros de Búsqueda de Agencia -->
    <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Acción</label>
          <select
            v-model="filtros.accion"
            @change="cargar"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las acciones</option>
            <option value="CREDITO_NUEVO">Crédito Nuevo</option>
            <option value="PLAZO_FIJO">Plazo Fijo</option>
            <option value="MOTOCICLETA">Motocicleta</option>
            <option value="PAGO_PUNTUAL">Pago Puntual</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Estado Cartilla</label>
          <select
            v-model="filtros.cartilla_completada"
            @change="cargar"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="">Todas</option>
            <option value="true">🎟️ Solo Cartillas Llenas</option>
            <option value="false">En Proceso</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">ID Asociado</label>
          <input
            v-model="filtros.codigo_cliente"
            @keyup.enter="cargar"
            type="text"
            placeholder="Buscar por ID..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div class="flex items-end">
          <button
            @click="limpiarFiltros"
            class="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Registros -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <BaseTable
        :columns="tableHeaders"
        :rows="registrosStore.registros"
        :loading="registrosStore.loading"
      >
        <template #cell-agencia="{ row }">
          <span class="font-semibold text-gray-700 dark:text-gray-300 text-xs">{{ row.agencia?.nombre || '-' }}</span>
        </template>

        <template #cell-codigo_cliente="{ row }">
          <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md text-xs">
            {{ row.codigo_cliente }}
          </span>
        </template>

        <template #cell-accion="{ row }">
          <span class="font-medium text-xs" :class="getAccionClass(row.accion)">
            {{ getAccionLabel(row.accion) }}
          </span>
        </template>

        <template #cell-monto="{ row }">
          <span class="font-bold text-gray-900 dark:text-white text-xs">
            Q {{ Number(row.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}
          </span>
        </template>

        <template #cell-stickers="{ row }">
          <span class="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            ⭐ {{ row.stickers }}
          </span>
        </template>

        <template #cell-sorteo="{ row }">
          <span
            v-if="row.cartilla_completada || row.sorteo"
            class="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max"
          >
            <span>🎟️</span> SÍ
          </span>
          <span
            v-else
            class="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
          >
            NO
          </span>
        </template>

        <template #cell-promocional_entregado="{ row }">
          <span class="text-xs text-gray-600 dark:text-gray-400">{{ row.promocional_entregado || '-' }}</span>
        </template>

        <template #cell-fecha="{ row }">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ new Date(row.created_at).toLocaleDateString('es-GT') }}
          </span>
        </template>

        <template #cell-acciones="{ row }">
          <div v-if="puedeEditar" class="flex justify-end gap-2">
            <button
              @click="abrirModalEditar(row)"
              class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-amber-600 dark:text-amber-400 cursor-pointer"
              title="Editar"
            >
              ✏️
            </button>
            <button
              @click="eliminarRegistro(row)"
              class="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-red-600 dark:text-red-400 cursor-pointer"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
          <span v-else class="text-xs text-gray-400 font-semibold italic">Solo lectura</span>
        </template>
      </BaseTable>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <BasePagination
          :current_page="registrosStore.pagination?.current_page"
          :last_page="registrosStore.pagination?.last_page"
          @change-page="cambiarPagina"
        />
      </div>
    </div>

    <!-- Modal Registro -->
    <RegistroModal
      v-if="modalAbierto"
      :show="modalAbierto"
      :registro="registroActivo"
      :bloquear-agencia="true"
      @close="modalAbierto = false"
      @saved="cargar"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartillaRegistrosStore } from '@/stores/cartilla/registros'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'
import { useAuthStore } from '@/stores/auth'
import BaseTable from '@/components/ui/BaseTable.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import RegistroModal from './components/RegistroModal.vue'
import Swal from 'sweetalert2'

const registrosStore = useCartillaRegistrosStore()
const catalogosStore = useCartillaCatalogosStore()
const authStore = useAuthStore()

const puedeEditar = computed(() => {
  return authStore.hasPermission('admin_promocion') ||
         authStore.hasPermission('edicion_promocion_agencia') ||
         authStore.hasPermission('cartilla_operativo') ||
         authStore.hasPermission('cartilla_mercadeo') ||
         authStore.hasRole('Super Admin')
})

const filtros = ref({
  accion: '',
  cartilla_completada: '',
  codigo_cliente: '',
  page: 1
})

const tableHeaders = [
  { key: 'codigo', label: 'Código' },
  { key: 'agencia', label: 'Agencia' },
  { key: 'codigo_cliente', label: 'Cliente' },
  { key: 'accion', label: 'Acción' },
  { key: 'monto', label: 'Monto' },
  { key: 'stickers', label: 'Stickers' },
  { key: 'sorteo', label: 'Sorteo' },
  { key: 'promocional_entregado', label: 'Promocional' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'acciones', label: 'Acciones', class: 'text-right' }
]

const modalAbierto = ref(false)
const registroActivo = ref(null)

onMounted(() => {
  catalogosStore.fetchAgencias()
  catalogosStore.fetchPromocionales()
  cargar()
})

const cargar = () => {
  registrosStore.fetchRegistros(filtros.value)
}

const cambiarPagina = (page) => {
  filtros.value.page = page
  cargar()
}

const limpiarFiltros = () => {
  filtros.value = { accion: '', codigo_cliente: '', page: 1 }
  cargar()
}

const abrirModalNuevo = () => {
  registroActivo.value = null
  modalAbierto.value = true
}

const abrirModalEditar = (registro) => {
  registroActivo.value = registro
  modalAbierto.value = true
}

const eliminarRegistro = async (registro) => {
  const result = await Swal.fire({
    title: '¿Eliminar registro?',
    text: `Se eliminará el registro ${registro.codigo} y se revertirá el consumo de inventario.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#1f2937',
    color: '#fff'
  })

  if (result.isConfirmed) {
    try {
      await registrosStore.eliminarRegistro(registro.id)
      Swal.fire({
        icon: 'success',
        title: 'Registro eliminado',
        timer: 1500,
        showConfirmButton: false,
        background: '#1f2937',
        color: '#fff'
      })
      cargar()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err,
        background: '#1f2937',
        color: '#fff'
      })
    }
  }
}

const getAccionLabel = (accion) => {
  const labels = {
    CREDITO_NUEVO: 'Crédito Nuevo',
    PLAZO_FIJO: 'Plazo Fijo',
    MOTOCICLETA: 'Motocicleta',
    PAGO_PUNTUAL: 'Pago Puntual'
  }
  return labels[accion] || accion
}

const getAccionClass = (accion) => {
  const classes = {
    CREDITO_NUEVO: 'text-emerald-600 dark:text-emerald-400 font-bold',
    PLAZO_FIJO: 'text-blue-600 dark:text-blue-400 font-bold',
    MOTOCICLETA: 'text-purple-600 dark:text-purple-400 font-bold',
    PAGO_PUNTUAL: 'text-amber-600 dark:text-amber-400 font-bold'
  }
  return classes[accion] || ''
}
</script>
