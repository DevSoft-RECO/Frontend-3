<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ isEdit ? 'Editar Registro de Participación' : 'Registrar Nueva Participación' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer">✕</button>
      </div>

      <!-- Form Body -->
      <div class="p-6 overflow-y-auto space-y-4">
        <!-- Error Alert -->
        <div v-if="errorMsg" class="p-4 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 rounded-xl text-sm font-semibold">
          ⚠️ {{ errorMsg }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Agencia -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Agencia</label>
            <select
              v-model="form.agencia_id"
              :disabled="isEdit || bloquearAgencia || esUsuarioAgencia"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccione Agencia...</option>
              <option v-for="ag in catalogosStore.agencias" :key="ag.id" :value="ag.id">
                {{ ag.nombre }}
              </option>
            </select>
          </div>

          <!-- Código Cliente -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Código Cliente</label>
            <input
              type="text"
              v-model="form.codigo_cliente"
              placeholder="5 a 7 dígitos"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm font-mono"
            />
          </div>

          <!-- Acción -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Acción</label>
            <select
              v-model="form.accion"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
              @change="onChangeAccion"
            >
              <option value="">Seleccione Acción...</option>
              <option value="CREDITO_NUEVO">Crédito</option>
              <option value="PLAZO_FIJO">Plazo Fijo</option>
              <option value="MOTOCICLETA">Motocicleta</option>
              <option value="PAGO_PUNTUAL">Pago Puntual</option>
            </select>
          </div>

          <!-- Subtipo / Operación -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Tipo Operación</label>
            <select
              v-model="form.tipo_operacion"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
              :disabled="!form.accion"
            >
              <option value="">Seleccione Operación...</option>
              <option v-for="op in opcionesOperacion" :key="op" :value="op">{{ op }}</option>
            </select>
          </div>

          <!-- Monto -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Monto (Q)</label>
            <input
              type="number"
              step="0.01"
              v-model="form.monto"
              placeholder="0.00"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <!-- Cuenta -->
          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Número de Cuenta</label>
              
              <!-- Contador de Caracteres -->
              <span
                v-if="form.numero_cuenta && form.accion !== 'MOTOCICLETA'"
                class="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all"
                :class="{
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20': form.numero_cuenta.length === 15,
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20': form.numero_cuenta.length < 15,
                  'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20': form.numero_cuenta.length > 15
                }"
              >
                <template v-if="form.numero_cuenta.length === 15">✓ 15 / 15 (Correcto)</template>
                <template v-else-if="form.numero_cuenta.length < 15">{{ form.numero_cuenta.length }} / 15 (Faltan {{ 15 - form.numero_cuenta.length }})</template>
                <template v-else>⚠️ {{ form.numero_cuenta.length }} / 15 (+{{ form.numero_cuenta.length - 15 }} de más)</template>
              </span>
            </div>
            <input
              type="text"
              v-model="form.numero_cuenta"
              placeholder="126..."
              :disabled="form.accion === 'MOTOCICLETA'"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm font-mono"
            />
          </div>
        </div>

        <!-- PANEL DE PREVISUALIZACIÓN DE STICKERS ASIGNADOS -->
        <div
          v-if="form.accion"
          class="p-4 rounded-xl border transition-all duration-300 shadow-xs"
          :class="{
            'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200': previewStickers.ya_registro_plazo_fijo,
            'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200': !previewStickers.ya_registro_plazo_fijo && previewStickers.stickers > 0,
            'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300': previewStickers.stickers === 0 && !previewStickers.ya_registro_plazo_fijo
          }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div
                class="p-2.5 rounded-xl font-black text-lg flex items-center justify-center min-w-11 h-11 border"
                :class="{
                  'bg-amber-500 text-white border-amber-600': previewStickers.ya_registro_plazo_fijo,
                  'bg-emerald-600 text-white border-emerald-700': !previewStickers.ya_registro_plazo_fijo && previewStickers.stickers > 0,
                  'bg-gray-400 text-white border-gray-500': previewStickers.stickers === 0 && !previewStickers.ya_registro_plazo_fijo
                }"
              >
                <span>⭐ {{ previewStickers.stickers }}</span>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-wider opacity-80">Stickers a Asignar al Asociado</p>
                <p class="text-sm font-bold mt-0.5">
                  {{ previewStickers.mensaje || 'Seleccione acción y datos' }}
                </p>
              </div>
            </div>

            <span
              v-if="calculandoPreview"
              class="animate-spin text-xs text-gray-500"
            >⌛</span>
          </div>

          <!-- Alerta de Plazo Fijo Previos en el Mismo Día -->
          <div v-if="previewStickers.ya_registro_plazo_fijo" class="mt-3 pt-3 border-t border-amber-500/20 text-xs space-y-1">
            <p class="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <span>🚫</span> <strong>Validación de Regla de Negocio:</strong>
            </p>
            <p class="text-amber-800 dark:text-amber-300">
              {{ previewStickers.detalle_existente }}
            </p>
            <p class="text-[11px] text-amber-600 dark:text-amber-400 italic">
              * El sistema registrará la participación para control, pero asignará 0 stickers debido al límite de 1 Plazo Fijo por día.
            </p>
          </div>
        </div>

        <hr class="border-gray-200 dark:border-gray-800" />

        <!-- Checkboxes Cartillas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <input type="checkbox" v-model="form.cartilla_nueva" class="w-5 h-5 accent-emerald-500 rounded" />
            <div>
              <span class="text-sm font-bold text-gray-900 dark:text-white block">Entregar Cartilla Nueva</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Descuenta 1 cartilla física del inventario de la agencia</span>
            </div>
          </label>

          <label class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <input type="checkbox" v-model="form.cartilla_completada" class="w-5 h-5 accent-emerald-500 rounded" />
            <div>
              <span class="text-sm font-bold text-gray-900 dark:text-white block">Marcar Cartilla Completa</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Habilita al asociado para participar en el Sorteo</span>
            </div>
          </label>
        </div>

        <!-- Promocional y Notas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Regalar Promocional</label>
            <select
              v-model="form.promocional_entregado"
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Ningún promocional</option>
              <option v-for="pr in catalogosStore.promocionales" :key="pr.id" :value="pr.nombre" :disabled="!pr.activo">
                {{ pr.nombre }} {{ !pr.activo ? '(Inactivo)' : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notas Rápidas</label>
            <select
              class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm"
              @change="seleccionarNotaRapida"
            >
              <option value="">Seleccione una nota rápida...</option>
              <option v-for="nt in catalogosStore.notasRapidas" :key="nt.id" :value="nt.texto" :disabled="!nt.activo">
                {{ nt.texto }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notas Observación</label>
          <textarea
            v-model="form.notas"
            rows="2"
            placeholder="Anotaciones extra..."
            class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 shrink-0">
        <button
          @click="$emit('close')"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
        >
          Cancelar
        </button>
        <button
          @click="guardar"
          :disabled="registrosStore.loading"
          class="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer"
        >
          <span v-if="registrosStore.loading" class="animate-spin text-xs">⌛</span>
          {{ isEdit ? 'Guardar Cambios' : 'Confirmar Registro' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { useCartillaRegistrosStore } from '@/stores/cartilla/registros'
import { useCartillaCatalogosStore } from '@/stores/cartilla/catalogos'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  registro: {
    type: Object,
    default: null
  },
  bloquearAgencia: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'saved'])

const registrosStore = useCartillaRegistrosStore()
const catalogosStore = useCartillaCatalogosStore()
const authStore = useAuthStore()

const isEdit = computed(() => !!props.registro)
const esUsuarioAgencia = computed(() => {
  return !authStore.hasPermission('cartilla_mercadeo') && !authStore.hasRole('Super Admin')
})
const errorMsg = ref('')

const form = ref({
  agencia_id: '',
  codigo_cliente: '',
  accion: '',
  tipo_operacion: '',
  monto: '',
  numero_cuenta: '',
  cartilla_nueva: false,
  cartilla_completada: false,
  promocional_entregado: '',
  notas: ''
})

const opcionesOperacion = ref([])

const inicializarFormulario = () => {
  errorMsg.value = ''
  if (isEdit.value && props.registro) {
    form.value = {
      agencia_id: props.registro.agencia_id,
      codigo_cliente: props.registro.codigo_cliente,
      accion: props.registro.accion,
      tipo_operacion: props.registro.tipo_operacion || '',
      monto: props.registro.monto,
      numero_cuenta: props.registro.numero_cuenta || '',
      cartilla_nueva: !!props.registro.cartilla_nueva,
      cartilla_completada: !!props.registro.cartilla_completada,
      promocional_entregado: props.registro.promocional_entregado || '',
      notas: props.registro.notas || ''
    }
    onChangeAccion()
  } else {
    // Auto-seleccionar agencia del usuario si aplica
    let agenciaIdDefault = ''
    const userAgenciaCode = authStore.user?.agencia_id || authStore.user?.idagencia
    if (userAgenciaCode && catalogosStore.agencias.length) {
      const ag = catalogosStore.agencias.find(a => a.codigo === userAgenciaCode || a.id == userAgenciaCode)
      if (ag) agenciaIdDefault = ag.id
    }
    if (!agenciaIdDefault && catalogosStore.agencias.length && (props.bloquearAgencia || esUsuarioAgencia.value)) {
      agenciaIdDefault = catalogosStore.agencias[0].id
    }

    form.value = {
      agencia_id: agenciaIdDefault,
      codigo_cliente: '',
      accion: '',
      tipo_operacion: '',
      monto: '',
      numero_cuenta: '',
      cartilla_nueva: false,
      cartilla_completada: false,
      promocional_entregado: '',
      notas: ''
    }
  }
}

watch(() => props.show, async (newVal) => {
  if (newVal) {
    try {
      await Promise.all([
        catalogosStore.fetchPromocionales(),
        catalogosStore.fetchNotasRapidas(),
        catalogosStore.fetchAgencias()
      ])
    } catch (e) {
      console.error(e)
    }
    inicializarFormulario()
  }
})

onMounted(async () => {
  try {
    await Promise.all([
      catalogosStore.fetchPromocionales(),
      catalogosStore.fetchNotasRapidas(),
      catalogosStore.fetchAgencias()
    ])
  } catch (e) {
    console.error(e)
  }
  if (props.show) {
    inicializarFormulario()
  }
})

const calculandoPreview = ref(false)
const previewStickers = ref({
  stickers: 0,
  mensaje: '',
  ya_registro_plazo_fijo: false,
  detalle_existente: null
})

const consultarStickers = async () => {
  if (!form.value.accion) {
    previewStickers.value = { stickers: 0, mensaje: '', ya_registro_plazo_fijo: false, detalle_existente: null }
    return
  }

  calculandoPreview.value = true
  try {
    const res = await registrosStore.calcularStickersPreview({
      codigo_cliente: form.value.codigo_cliente,
      accion: form.value.accion,
      tipo_operacion: form.value.tipo_operacion
    })
    previewStickers.value = res
  } catch (e) {
    console.error(e)
  } finally {
    calculandoPreview.value = false
  }
}

watch([() => form.value.accion, () => form.value.tipo_operacion, () => form.value.codigo_cliente], () => {
  consultarStickers()
})

const onChangeAccion = () => {
  form.value.tipo_operacion = ''
  if (form.value.accion === 'CREDITO_NUEVO') {
    opcionesOperacion.value = ['NUEVO', 'AMPLIACIÓN']
    form.value.tipo_operacion = 'NUEVO'
  } else if (form.value.accion === 'PLAZO_FIJO') {
    opcionesOperacion.value = ['NUEVO', 'RENOVACIÓN', 'AMPLIACIÓN']
    form.value.tipo_operacion = 'NUEVO'
  } else if (form.value.accion === 'MOTOCICLETA') {
    opcionesOperacion.value = ['FINANCIADA', 'AL CONTADO']
    form.value.tipo_operacion = 'FINANCIADA'
    form.value.numero_cuenta = '' // Sin cuenta para motos
  } else if (form.value.accion === 'PAGO_PUNTUAL') {
    opcionesOperacion.value = ['PRESENCIAL']
    form.value.tipo_operacion = 'PRESENCIAL'
  } else {
    opcionesOperacion.value = []
  }
  consultarStickers()
}

const seleccionarNotaRapida = (e) => {
  const val = e.target.value
  if (val) {
    form.value.notas = form.value.notas ? form.value.notas + ' - ' + val : val
  }
  e.target.value = ''
}

const guardar = async () => {
  errorMsg.value = ''

  const isMotoAlContado = form.value.accion === 'MOTOCICLETA' && form.value.tipo_operacion === 'AL CONTADO'

  if (!form.value.agencia_id) return errorMsg.value = 'Debe seleccionar una agencia.'
  
  if (!isMotoAlContado) {
    if (!form.value.codigo_cliente || form.value.codigo_cliente.length < 5) {
      return errorMsg.value = 'El Código Cliente es obligatorio y debe tener al menos 5 dígitos.'
    }
    if (!form.value.numero_cuenta || form.value.numero_cuenta.length !== 15) {
      return errorMsg.value = 'El Número de Cuenta es obligatorio y debe tener exactamente 15 dígitos.'
    }
  }

  if (!form.value.accion) return errorMsg.value = 'Debe seleccionar una acción participante.'
  if (!form.value.monto || parseFloat(form.value.monto) <= 0) {
    return errorMsg.value = 'El Monto es obligatorio y debe ser mayor a 0.'
  }

  try {
    if (isEdit.value) {
      await registrosStore.editarRegistro(props.registro.id, form.value)
    } else {
      await registrosStore.crearRegistro(form.value)
    }

    Swal.fire({
      title: '¡Operación Exitosa!',
      text: isEdit.value ? 'Se han actualizado los datos y movimientos.' : 'Se registró la participación correctamente.',
      icon: 'success',
      background: '#1f2937',
      color: '#fff'
    })
    emit('saved')
    emit('close')
  } catch (err) {
    errorMsg.value = err || 'Ocurrió un error al persistir los datos'
  }
}
</script>
