<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
          <span class="text-3xl">🏛️</span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Dashboard Agencia: {{ data.agencia?.nombre || 'Cargando...' }}
            </h1>
            <span v-if="data.agencia?.codigo" class="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {{ data.agencia.codigo }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Panorama general de inventarios, entregas y participaciones acumuladas en sorteos
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Selector de Agencia (Habilitado para Admins, Bloqueado para Operadores) -->
        <div class="min-w-56">
          <select
            v-model="agenciaSeleccionadaId"
            :disabled="!esAdmin"
            @change="cargarDashboard"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800/80"
            :title="!esAdmin ? 'Agencia fija asignada a su usuario' : 'Seleccione una agencia para auditar'"
          >
            <option v-for="ag in catalogosStore.agencias" :key="ag.id" :value="ag.id">
              {{ ag.nombre }} ({{ ag.codigo }})
            </option>
          </select>
        </div>

        <button
          @click="cargarDashboard"
          :disabled="loading"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
        >
          <span v-if="loading" class="animate-spin text-xs">⌛</span>
          <span v-else>🔄</span> Refrescar Datos
        </button>
      </div>
    </div>

    <!-- TARJETAS PRINCIPALES: KPI DE INVENTARIO -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- CARTILLAS -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Cartillas de Agencia</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white mt-1">
              {{ data.resumen_inventario?.cartillas?.disponible ?? 0 }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">Disponibilidad en custodia</p>
          </div>
          <div class="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <span class="text-2xl">📇</span>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          <div class="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Recibidas de Central:</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ data.resumen_inventario?.cartillas?.recibidas ?? 0 }}</span>
          </div>
          <div class="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Entregadas / Repuestas:</span>
            <span class="font-bold text-amber-600 dark:text-amber-400">{{ data.resumen_inventario?.cartillas?.entregadas ?? 0 }}</span>
          </div>
        </div>

        <!-- Barra uso -->
        <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-4 overflow-hidden">
          <div
            class="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            :style="{ width: calcularUso(data.resumen_inventario?.cartillas?.entregadas, data.resumen_inventario?.cartillas?.recibidas) + '%' }"
          ></div>
        </div>
      </div>

      <!-- STICKERS (CALCOMANÍAS) -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Stickers Disponibles</p>
            <h3 class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {{ data.resumen_inventario?.stickers?.disponible ?? 0 }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">Para entrega a asociados</p>
          </div>
          <div class="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <span class="text-2xl">⭐</span>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          <div class="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Recibidos de Central:</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ data.resumen_inventario?.stickers?.recibidos ?? 0 }}</span>
          </div>
          <div class="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Otorgados en Participación:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ data.resumen_inventario?.stickers?.entregados ?? 0 }}</span>
          </div>
        </div>

        <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-4 overflow-hidden">
          <div
            class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            :style="{ width: calcularUso(data.resumen_inventario?.stickers?.entregados, data.resumen_inventario?.stickers?.recibidos) + '%' }"
          ></div>
        </div>
      </div>

      <!-- PROMOCIONALES -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-xs font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">Promocionales</p>
            <h3 class="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {{ data.resumen_inventario?.promocionales?.disponible ?? 0 }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">Artículos en stock</p>
          </div>
          <div class="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <span class="text-2xl">🎁</span>
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          <div class="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Total Recibidos:</span>
            <span class="font-bold text-gray-900 dark:text-white">{{ data.resumen_inventario?.promocionales?.recibidos ?? 0 }}</span>
          </div>
          <div class="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Total Entregados:</span>
            <span class="font-bold text-purple-600 dark:text-purple-400">{{ data.resumen_inventario?.promocionales?.entregados ?? 0 }}</span>
          </div>
        </div>

        <div class="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-4 overflow-hidden">
          <div
            class="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
            :style="{ width: calcularUso(data.resumen_inventario?.promocionales?.entregados, data.resumen_inventario?.promocionales?.recibidos) + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- TARJETAS DE SORTEOS Y PARTICIPACIONES DE LA AGENCIA -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-wider text-emerald-200">Participaciones Registradas</p>
          <h3 class="text-3xl font-black mt-1">{{ data.resumen_participaciones?.total_registros ?? 0 }}</h3>
          <p class="text-xs text-emerald-100 mt-1 font-medium">Asociados participantes en la sede</p>
        </div>
        <span class="text-4xl opacity-80">📝</span>
      </div>

      <div
        @click="modalCartillasLlenasShow = true"
        class="bg-gradient-to-br from-amber-500 to-orange-700 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform group"
        title="Haga clic para ver el listado de asociados participantes"
      >
        <div>
          <p class="text-xs font-black uppercase tracking-wider text-amber-200">Oportunidades en Sorteos</p>
          <h3 class="text-3xl font-black mt-1">{{ data.resumen_participaciones?.total_cartillas_llenas ?? 0 }}</h3>
          <p class="text-xs text-amber-100 mt-1 font-medium group-hover:underline flex items-center gap-1">
            <span>🎟️</span> Cartillas completadas (Ver Asociados)
          </p>
        </div>
        <span class="text-4xl opacity-80">🏆</span>
      </div>
    </div>

    <!-- SECCIÓN INFERIOR: ACCIONES Y DETALLE DE PROMOCIONALES -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Desglose por Acción -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 class="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          Participaciones por Tipo de Acción
        </h3>

        <div class="space-y-3">
          <!-- Crédito Nuevo -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Crédito Nuevo</p>
              <p class="text-sm font-black text-gray-900 dark:text-white">
                {{ data.desglose_acciones?.CREDITO_NUEVO?.cantidad ?? 0 }} transacciones
              </p>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300">
                Q {{ Number(data.desglose_acciones?.CREDITO_NUEVO?.monto ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}
              </span>
              <p class="text-xs text-amber-600 dark:text-amber-400 font-bold">
                ⭐ {{ data.desglose_acciones?.CREDITO_NUEVO?.stickers ?? 0 }} stickers
              </p>
            </div>
          </div>

          <!-- Plazo Fijo -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Plazo Fijo</p>
              <p class="text-sm font-black text-gray-900 dark:text-white">
                {{ data.desglose_acciones?.PLAZO_FIJO?.cantidad ?? 0 }} transacciones
              </p>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300">
                Q {{ Number(data.desglose_acciones?.PLAZO_FIJO?.monto ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}
              </span>
              <p class="text-xs text-amber-600 dark:text-amber-400 font-bold">
                ⭐ {{ data.desglose_acciones?.PLAZO_FIJO?.stickers ?? 0 }} stickers
              </p>
            </div>
          </div>

          <!-- Motocicleta -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Motocicleta</p>
              <p class="text-sm font-black text-gray-900 dark:text-white">
                {{ data.desglose_acciones?.MOTOCICLETA?.cantidad ?? 0 }} transacciones
              </p>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300">
                Q {{ Number(data.desglose_acciones?.MOTOCICLETA?.monto ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}
              </span>
              <p class="text-xs text-amber-600 dark:text-amber-400 font-bold">
                ⭐ {{ data.desglose_acciones?.MOTOCICLETA?.stickers ?? 0 }} stickers
              </p>
            </div>
          </div>

          <!-- Pago Puntual -->
          <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Pago Puntual</p>
              <p class="text-sm font-black text-gray-900 dark:text-white">
                {{ data.desglose_acciones?.PAGO_PUNTUAL?.cantidad ?? 0 }} reclamos
              </p>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300">
                Q {{ Number(data.desglose_acciones?.PAGO_PUNTUAL?.monto ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}
              </span>
              <p class="text-xs text-amber-600 dark:text-amber-400 font-bold">
                ⭐ {{ data.desglose_acciones?.PAGO_PUNTUAL?.stickers ?? 0 }} stickers
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado de Promocionales en la Agencia -->
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 class="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📦</span> Inventario de Artículos Promocionales
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase font-extrabold">
              <tr>
                <th class="px-3 py-2.5">Artículo</th>
                <th class="px-3 py-2.5 text-center">Recibidos</th>
                <th class="px-3 py-2.5 text-center">Entregados</th>
                <th class="px-3 py-2.5 text-center">Disponible</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="item in data.promocionales_desglose" :key="item.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <td class="px-3 py-3 font-bold text-gray-900 dark:text-white">{{ item.nombre }}</td>
                <td class="px-3 py-3 text-center text-gray-600 dark:text-gray-400">{{ item.recibidos }}</td>
                <td class="px-3 py-3 text-center font-bold text-purple-600 dark:text-purple-400">{{ item.entregados }}</td>
                <td class="px-3 py-3 text-center">
                  <span
                    class="px-2 py-0.5 rounded-full font-black text-xs"
                    :class="item.disponible > 5 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'"
                  >
                    {{ item.disponible }}
                  </span>
                </td>
              </tr>
              <tr v-if="!data.promocionales_desglose || !data.promocionales_desglose.length">
                <td colspan="4" class="text-center py-6 text-gray-400">
                  No hay promocionales configurados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Listado de Cartillas Llenas -->
    <div v-if="modalCartillasLlenasShow" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-955 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🎟️</span> Asociados con Cartilla Llena (Participantes Sorteo)
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Sede: {{ data.agencia?.nombre }} ({{ data.agencia?.codigo }})
            </p>
          </div>
          <button @click="modalCartillasLlenasShow = false" class="text-gray-400 hover:text-white text-xl cursor-pointer">✕</button>
        </div>

        <div class="p-6 overflow-y-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase font-extrabold">
              <tr>
                <th class="px-3 py-2.5">Código</th>
                <th class="px-3 py-2.5">ID Asociado</th>
                <th class="px-3 py-2.5">Acción</th>
                <th class="px-3 py-2.5">Monto</th>
                <th class="px-3 py-2.5 text-center">Stickers</th>
                <th class="px-3 py-2.5">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="item in data.cartillas_llenas_detalle" :key="item.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <td class="px-3 py-3 font-mono font-bold text-gray-700 dark:text-gray-300">{{ item.codigo }}</td>
                <td class="px-3 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ item.codigo_cliente }}</td>
                <td class="px-3 py-3 font-bold text-gray-900 dark:text-white">{{ item.accion }}</td>
                <td class="px-3 py-3 font-bold text-gray-900 dark:text-white">Q {{ Number(item.monto).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}</td>
                <td class="px-3 py-3 text-center">
                  <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    ⭐ {{ item.stickers }}
                  </span>
                </td>
                <td class="px-3 py-3 text-gray-500 dark:text-gray-400">{{ new Date(item.created_at).toLocaleDateString('es-GT') }}</td>
              </tr>
              <tr v-if="!data.cartillas_llenas_detalle || !data.cartillas_llenas_detalle.length">
                <td colspan="6" class="text-center py-8 text-gray-400">
                  No se han registrado cartillas completadas en esta agencia aún.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-955 border-t border-gray-200 dark:border-gray-800 flex justify-end shrink-0">
          <button
            @click="modalCartillasLlenasShow = false"
            class="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'

const authStore = useAuthStore()
const catalogosStore = useCartillaCatalogosStore()

const loading = ref(false)
const modalCartillasLlenasShow = ref(false)
const data = ref({})
const agenciaSeleccionadaId = ref('')

const esAdmin = computed(() => {
  return authStore.hasPermission('cartilla_mercadeo') || authStore.hasRole('Super Admin')
})

onMounted(() => {
  catalogosStore.fetchAgencias()
  cargarDashboard()
})

const cargarDashboard = async () => {
  loading.value = true
  try {
    const params = {}
    if (agenciaSeleccionadaId.value) {
      params.agencia_id = agenciaSeleccionadaId.value
    }

    const res = await api.get('/cartilla/dashboard/agencia', { params })
    data.value = res.data
    if (!agenciaSeleccionadaId.value && res.data.agencia?.id) {
      agenciaSeleccionadaId.value = res.data.agencia.id
    }
  } catch (err) {
    console.error('Error al cargar dashboard de agencia:', err)
  } finally {
    loading.value = false
  }
}

const calcularUso = (entregados, recibidos) => {
  if (!recibidos || recibidos <= 0) return 0
  const pct = Math.round(((entregados || 0) / recibidos) * 100)
  return Math.min(pct, 100)
}
</script>
