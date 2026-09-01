<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Configuración del Evento
      </h1>
      <p class="text-sm text-gray-550 dark:text-gray-400 mt-1">
        Parámetros de la promoción, catálogo de promocionales, alertas e información
      </p>
    </div>

    <!-- Alert Config Cambiada -->
    <div v-if="successMsg" class="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold">
      ✅ {{ successMsg }}
    </div>
    <div v-if="errorMsg" class="p-4 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-sm font-semibold">
      ⚠️ {{ errorMsg }}
    </div>

    <!-- Grid de Secciones -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- SECCIÓN A: Mecánica de la Promoción -->
      <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4 relative">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            ⚙️ Mecánica de Stickers
          </h3>
          <button
            @click="toggleCandado('mecanica')"
            class="text-xs font-bold px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer"
          >
            {{ candados.mecanica ? '🔒 Desbloquear' : '🔓 Bloquear' }}
          </button>
        </div>

        <fieldset :disabled="candados.mecanica" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Fecha Promoción</label>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <span class="block text-[11px] font-semibold text-gray-400 dark:text-gray-400 mb-1">Fecha Inicio (00:00 hrs)</span>
                <input
                  type="date"
                  v-model="formMecanica.fecha_inicio"
                  class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <span class="block text-[11px] font-semibold text-gray-400 dark:text-gray-400 mb-1">Fecha Finalización (23:59 hrs)</span>
                <input
                  type="date"
                  v-model="formMecanica.fecha_fin"
                  class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Stickers por Crédito Nuevo</label>
            <input type="number" v-model="formMecanica.stickers_credito_nuevo" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Stickers por Plazo Fijo</label>
            <input type="number" v-model="formMecanica.stickers_plazo_fijo" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Moto Financiada</label>
              <input type="number" v-model="formMecanica.stickers_moto_financiada" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Moto Contado</label>
              <input type="number" v-model="formMecanica.stickers_moto_contado" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Stickers Pago Puntual</label>
            <input type="number" v-model="formMecanica.stickers_pago_puntual" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Prefijo Cuenta</label>
              <input type="text" v-model="formMecanica.prefijo_cuenta" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm font-mono" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-550 dark:text-gray-400 uppercase mb-1">Dígitos Cuenta</label>
              <input type="number" v-model="formMecanica.digitos_cuenta" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm" />
            </div>
          </div>
          <label class="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer">
            <input type="checkbox" v-model="formMecanica.plazo_fijo_unico_diario" class="w-5 h-5 accent-emerald-500 rounded" />
            <div>
              <span class="text-sm font-bold text-gray-900 dark:text-white block">Regla Plazo Fijo Diario</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Sólo el primer PF otorga stickers</span>
            </div>
          </label>

          <button
            v-if="!candados.mecanica"
            @click="guardarSeccion('mecanica', formMecanica)"
            class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm cursor-pointer"
          >
            💾 Guardar Cambios Mecánica
          </button>
        </fieldset>
      </div>

      <!-- SECCIÓN B: Catálogo de Promocionales -->
      <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            🎁 Catálogo de Promocionales
          </h3>

          <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            <div
              v-for="promo in catalogosStore.promocionales"
              :key="promo.id"
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl"
            >
              <span class="font-medium text-gray-900 dark:text-white text-sm">{{ promo.nombre }}</span>
              <div class="flex items-center gap-3">
                <!-- Toggle Activo -->
                <button
                  @click="cambiarEstadoPromo(promo)"
                  class="text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer"
                  :class="promo.activo
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400'"
                >
                  {{ promo.activo ? 'Activo' : 'Inactivo' }}
                </button>
                <button
                  @click="borrarPromo(promo.id)"
                  class="text-gray-400 hover:text-red-500 text-sm cursor-pointer"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
          <input
            type="text"
            v-model="nuevoPromo"
            placeholder="Nombre del nuevo promocional..."
            class="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm"
          />
          <button
            @click="agregarPromo"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm cursor-pointer"
          >
            Agregar
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useCartillaConfiguracionStore } from '@/stores/cartilla/configuracion'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'

const configStore = useCartillaConfiguracionStore()
const catalogosStore = useCartillaCatalogosStore()

const candados = ref({
  mecanica: true
})

const successMsg = ref('')
const errorMsg = ref('')
const nuevoPromo = ref('')

const extraertecha = (valorStr, esFin = false) => {
  if (!valorStr) return ''
  const fechaPart = valorStr.split(' ')[0].split('T')[0]
  return fechaPart
}

const formatearFechaConHora = (fechaSimple, esFin = false) => {
  if (!fechaSimple) return null
  const horaPart = esFin ? '23:59:59' : '00:00:00'
  return `${fechaSimple} ${horaPart}`
}

const formMecanica = ref({
  fecha_inicio: '',
  fecha_fin: '',
  stickers_credito_nuevo: 15,
  stickers_plazo_fijo: 15,
  stickers_moto_financiada: 15,
  stickers_moto_contado: 10,
  stickers_pago_puntual: 5,
  stickers_cartilla_completa: 30,
  prefijo_cuenta: '126',
  digitos_cuenta: 15,
  plazo_fijo_unico_diario: true
})

onMounted(async () => {
  await configStore.fetchConfiguraciones()
  catalogosStore.fetchPromocionales()

  // Hidratar formulario
  if (configStore.configuraciones.mecanica) {
    const rawMecanica = configStore.configuraciones.mecanica
    formMecanica.value = {
      ...rawMecanica,
      fecha_inicio: extraertecha(rawMecanica.fecha_inicio),
      fecha_fin: extraertecha(rawMecanica.fecha_fin, true)
    }
  }
})

const toggleCandado = (sec) => {
  candados.value[sec] = !candados.value[sec]
}

const guardarSeccion = async (clave, valor) => {
  successMsg.value = ''
  errorMsg.value = ''

  const payloadGuardar = {
    ...valor,
    fecha_inicio: formatearFechaConHora(valor.fecha_inicio, false),
    fecha_fin: formatearFechaConHora(valor.fecha_fin, true)
  }

  // Modal confirmación de riesgo visual
  const confirmResult = await Swal.fire({
    title: '¿Confirmas guardar los cambios?',
    text: 'Esta acción alterará la lógica futura del cálculo de stickers y reglas. Los cambios se auditarán.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Sí, aplicar',
    background: '#1f2937',
    color: '#fff'
  })

  if (!confirmResult.isConfirmed) return

  try {
    await configStore.actualizarConfiguracion(clave, payloadGuardar)
    successMsg.value = `Sección '${clave}' guardada exitosamente.`
    candados.value[clave] = true
  } catch (err) {
    errorMsg.value = err || 'Error al guardar la configuración'
  }
}

// Lógica de Promocionales
const agregarPromo = async () => {
  if (!nuevoPromo.value.trim()) return
  try {
    await catalogosStore.crearPromocional(nuevoPromo.value.trim())
    nuevoPromo.value = ''
    Swal.fire({ title: '¡Creado!', text: 'El promocional se añadió al catálogo.', icon: 'success', background: '#1f2937', color: '#fff' })
  } catch (err) {
    Swal.fire({ title: 'Error', text: err || 'Error', icon: 'error', background: '#1f2937', color: '#fff' })
  }
}

const cambiarEstadoPromo = async (promo) => {
  try {
    await catalogosStore.actualizarPromocional(promo.id, {
      nombre: promo.nombre,
      activo: !promo.activo
    })
  } catch (err) {
    const errorText = typeof err === 'string' ? err : err.response?.data?.error || err.message || 'Error al cambiar estado'
    Swal.fire({ title: 'Error', text: errorText, icon: 'error', background: '#1f2937', color: '#fff' })
  }
}

const borrarPromo = async (id) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Solo puedes eliminar promocionales que no tengan stock ni movimientos registrados.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    background: '#1f2937',
    color: '#fff'
  })

  if (result.isConfirmed) {
    try {
      await catalogosStore.eliminarPromocional(id)
      Swal.fire({ title: 'Eliminado', icon: 'success', background: '#1f2937', color: '#fff' })
    } catch (err) {
      const errorText = typeof err === 'string' ? err : err.response?.data?.error || err.message || 'No se pudo eliminar'
      Swal.fire({ title: 'Error', text: errorText, icon: 'error', background: '#1f2937', color: '#fff' })
    }
  }
}
</script>
