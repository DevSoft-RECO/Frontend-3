<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Registros Consolidados
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Historial general y captura de participaciones de La Cartilla Ganadora
        </p>
      </div>

      <button
        @click="abrirNuevo"
        class="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-505 active:bg-emerald-700
               text-white font-bold rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
      >
        <span class="mr-2">➕</span> Registrar Participación
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Agencia -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Agencia</label>
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

        <!-- Acción -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Acción</label>
          <select
            v-model="filtros.accion"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las acciones</option>
            <option value="CREDITO_NUEVO">Crédito Nuevo</option>
            <option value="PLAZO_FIJO">Plazo Fijo</option>
            <option value="MOTOCICLETA">Motocicleta</option>
            <option value="PAGO_PUNTUAL">Pago Puntual</option>
          </select>
        </div>

        <!-- Estado Cartilla / Sorteo -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Estado Cartilla</label>
          <select
            v-model="filtros.cartilla_completada"
            @change="filtrar"
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm font-medium"
          >
            <option value="">Todas las participaciones</option>
            <option value="true">🎟️ Solo Cartillas Llenas</option>
            <option value="false">En Proceso</option>
          </select>
        </div>

        <!-- Búsqueda -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Código Cliente</label>
          <input
            type="text"
            v-model="filtros.codigo_cliente"
            @keyup.enter="filtrar"
            placeholder="Buscar por código..."
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm"
          />
        </div>

        <!-- Acciones Filtro -->
        <div class="flex items-end gap-2">
          <button
            @click="filtrar"
            class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm cursor-pointer shadow-md shadow-emerald-900/20"
          >
            Filtrar
          </button>
          <button
            @click="limpiar"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-xl text-sm cursor-pointer"
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
        :rows="registrosStore.registros"
        :loading="registrosStore.loading"
      >
        <template #cell-agencia="{ row }">
          <span class="font-semibold text-gray-700 dark:text-gray-300">{{ row.agencia?.nombre || '-' }}</span>
        </template>

        <template #cell-codigo_cliente="{ row }">
          <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
            {{ row.codigo_cliente }}
          </span>
        </template>

        <template #cell-accion="{ row }">
          <span class="font-medium" :class="getAccionClass(row.accion)">
            {{ getAccionLabel(row.accion) }}
          </span>
        </template>

        <template #cell-monto="{ row }">
          <span class="text-gray-900 dark:text-white font-semibold">Q {{ formatMonto(row.monto) }}</span>
        </template>

        <template #cell-stickers="{ row }">
          <span class="px-2.5 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-xs">
            {{ row.stickers }}
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
          <span class="text-gray-700 dark:text-gray-300 text-sm">
            {{ row.promocional_entregado || 'Ninguno' }}
          </span>
        </template>

        <template #cell-fecha="{ row }">
          <span class="text-gray-550 dark:text-gray-400 text-xs">
            {{ formatDate(row.created_at) }}
          </span>
        </template>

        <template #cell-acciones="{ row }">
          <div class="flex items-center gap-2">
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
        </template>
      </BaseTable>

      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <BasePagination
          :current-page="registrosStore.pagination.current_page"
          :last-page="registrosStore.pagination.last_page"
          @change-page="cambiarPagina"
        />
      </div>
    </div>

    <!-- Modales -->
    <RegistroModal
      v-if="modalAbierto"
      :show="modalAbierto"
      :registro="registroActivo"
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
import RegistroModal from './components/RegistroModal.vue'
import { useCartillaRegistrosStore } from '@/stores/cartilla/registros'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'

const registrosStore = useCartillaRegistrosStore()
const catalogosStore = useCartillaCatalogosStore()

const filtros = ref({
  agencia_id: '',
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
  { key: 'fecha', label: 'Fecha de Registro' },
  { key: 'acciones', label: 'Acciones', class: 'text-right' }
]

const modalAbierto = ref(false)
const registroActivo = ref(null)

onMounted(async () => {
  try {
    await Promise.all([
      catalogosStore.fetchAgencias(),
      catalogosStore.fetchPromocionales()
    ])
  } catch (e) {
    console.error(e)
  }
  cargar()
})

const cargar = async () => {
  try {
    await registrosStore.fetchRegistros(filtros.value)
  } catch (e) {
    console.error('Error cargando registros:', e)
  }
}

const filtrar = () => {
  filtros.value.page = 1
  cargar()
}

const limpiar = () => {
  filtros.value = {
    agencia_id: '',
    accion: '',
    cartilla_completada: '',
    codigo_cliente: '',
    page: 1
  }
  cargar()
}

const cambiarPagina = (p) => {
  filtros.value.page = p
  cargar()
}

const abrirNuevo = () => {
  registroActivo.value = null
  modalAbierto.value = true
}

const abrirEditar = (item) => {
  registroActivo.value = item
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const alGuardar = () => {
  cerrarModal()
  cargar()
}

const confirmarEliminar = async (id) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción revertirá los consumos de inventario del registro antes de borrarlo.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    background: '#1f2937',
    color: '#fff'
  })

  if (result.isConfirmed) {
    try {
      await registrosStore.eliminarRegistro(id)
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El registro se ha eliminado correctamente.',
        icon: 'success',
        background: '#1f2937',
        color: '#fff'
      })
      cargar()
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err || 'No se pudo eliminar el registro',
        icon: 'error',
        background: '#1f2937',
        color: '#fff'
      })
    }
  }
}

// Helpers visuales
const getAccionLabel = (a) => {
  const labels = {
    'CREDITO_NUEVO': 'Crédito Nuevo',
    'PLAZO_FIJO': 'Plazo Fijo',
    'MOTOCICLETA': 'Motocicleta',
    'PAGO_PUNTUAL': 'Pago Puntual'
  }
  return labels[a] || a
}

const getAccionClass = (a) => {
  const classes = {
    'CREDITO_NUEVO': 'text-emerald-400',
    'PLAZO_FIJO': 'text-indigo-400',
    'MOTOCICLETA': 'text-amber-400',
    'PAGO_PUNTUAL': 'text-cyan-400'
  }
  return classes[a] || 'text-white'
}

const formatMonto = (v) => {
  if (!v) return '0.00'
  return parseFloat(v).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
