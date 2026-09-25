<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
    <div class="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/20">
        <h3 class="text-xl font-bold text-amber-900 dark:text-amber-500 flex items-center gap-2">
          <span>🎁</span> Entrega de Promocional Extraordinario
        </h3>
        <button @click="$emit('close')" class="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors">
          ❌
        </button>
      </div>

      <div class="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
        <div class="mb-4 p-4 bg-amber-100/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm">
          <p class="text-amber-800 dark:text-amber-400 font-bold mb-1 flex items-center gap-2">
            <span>ℹ️</span> Nota Importante
          </p>
          <p class="text-amber-700 dark:text-amber-500">
            Este formulario es de uso exclusivo para acuerdos donde se logra consolidar grandes sumas de efectivo. 
            El sistema registrará la participación y descontará el promocional, pero <strong>no descontará stickers ni cartillas</strong>.
          </p>
        </div>

        <form id="extraordinarioForm" class="space-y-4" @submit.prevent="guardar">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Código Cliente <span class="text-red-500">*</span></label>
              <input type="text" v-model="form.codigo_cliente" required class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Ej. 12345" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Número de Cuenta <span class="text-red-500">*</span>
                <span class="ml-2 lowercase font-normal" :class="{'text-red-500': form.numero_cuenta.length !== 15, 'text-emerald-600': form.numero_cuenta.length === 15}">{{ form.numero_cuenta.length }}/15</span>
              </label>
              <input type="text" v-model="form.numero_cuenta" maxlength="15" required class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500" placeholder="Ej. 126..." />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Acción</label>
              <input type="text" disabled value="EXTRAORDINARIO" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-500 text-sm font-bold" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Tipo Operación</label>
              <input type="text" disabled value="Extraordinario" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-500 text-sm font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Monto <span class="text-red-500">*</span></label>
              <input type="number" step="0.01" v-model="form.monto" required class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Promocional a Entregar</label>
              <select v-model="form.promocional_entregado" required class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="">Seleccione promocional...</option>
                <option v-for="pr in catalogosStore.promocionales" :key="pr.id" :value="pr.nombre" :disabled="!pr.activo || obtenerStock(pr.nombre) <= 0">
                  {{ pr.nombre }} {{ !pr.activo ? "(Inactivo)" : `(Disp: ${obtenerStock(pr.nombre)})` }}
                </option>
              </select>
            </div>
          </div>

          <!-- Campos Deshabilitados por defecto -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Cartilla Nueva</label>
              <input type="text" disabled value="No aplica" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-400 text-sm font-bold italic" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Stickers (Calculados)</label>
              <input type="text" disabled value="0 - No aplica" class="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-400 text-sm font-bold italic" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notas / Motivo Extraordinario <span class="text-red-500">*</span></label>
            <textarea v-model="form.notas" rows="3" required placeholder="Justifique el motivo por el cual se entregará el promocional..." class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>

        </form>
      </div>

      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 shrink-0">
        <button
          @click="$emit('close')"
          type="button"
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="extraordinarioForm"
          :disabled="registrosStore.loading"
          class="px-6 py-2 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 cursor-pointer"
        >
          <span v-if="registrosStore.loading" class="animate-spin text-xs">⌛</span>
          Guardar Registro Extraordinario
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, onMounted } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useCartillaCatalogosStore } from "@/stores/cartilla/catalogos"
import { useCartillaRegistrosStore } from "@/stores/cartilla/registros"
import Swal from "sweetalert2"

const props = defineProps({
  show: Boolean,
  stock: {
    type: Array,
    default: () => []
  }
})

const obtenerStock = (nombre) => {
  if (!props.stock) return 0
  const item = props.stock.find(i => i.recurso === 'PROMOCIONAL' && i.nombre_promocional === nombre)
  return item ? (item.cantidad || 0) : 0
}

const emit = defineEmits(["close", "success"])

const authStore = useAuthStore()
const catalogosStore = useCartillaCatalogosStore()
const registrosStore = useCartillaRegistrosStore()

const form = reactive({
  agencia_id: "",
  codigo_cliente: "",
  accion: "EXTRAORDINARIO",
  tipo_operacion: "Extraordinario",
  monto: "",
  numero_cuenta: "",
  cartilla_nueva: false,
  cartilla_completada: false,
  promocional_entregado: "",
  notas: ""
})

watch(() => props.show, (val) => {
  if (val) {
    form.codigo_cliente = ""
    form.monto = ""
    form.numero_cuenta = ""
    form.promocional_entregado = ""
    form.notas = ""
    
    // Obtener la agencia
    const codigoAgencia = authStore.user?.agencia_id || authStore.user?.idagencia
    const agenciaObj = catalogosStore.agencias.find(a => a.codigo == codigoAgencia)
    form.agencia_id = agenciaObj ? agenciaObj.id : ""
  }
})

onMounted(() => {
  if (catalogosStore.promocionales.length === 0) {
    catalogosStore.fetchPromocionales()
  }
  if (catalogosStore.agencias.length === 0) {
    catalogosStore.fetchAgencias()
  }
})

const guardar = async () => {
  if (!form.agencia_id) {
    const userCode = authStore.user?.agencia_id || authStore.user?.idagencia
    const ag = catalogosStore.agencias.find(a => a.codigo == userCode || a.id == userCode)
    form.agencia_id = ag ? ag.id : catalogosStore.agencias[0]?.id
  }

  if (!form.agencia_id) {
    Swal.fire("Error", "No se pudo detectar su agencia. Refresque la página e intente de nuevo.", "error")
    return
  }

  if (!form.codigo_cliente || !form.numero_cuenta || !form.monto || !form.promocional_entregado || !form.notas) {
    Swal.fire("Error", "Por favor complete todos los campos obligatorios", "error")
    return
  }

  try {
    await registrosStore.crearRegistro(form)
    // Si no arrojó excepción, asumimos éxito
    emit("success")
    emit("close")
    Swal.fire({
      title: "Registro Creado",
      text: "La entrega extraordinaria se registró exitosamente.",
      icon: "success",
      toast: true,
      position: "top-end",
      timer: 3000,
      showConfirmButton: false
    })
  } catch (error) {
    console.error("Error al registrar:", error)
    const errMessage = error?.response?.data?.message || error?.response?.data?.error || "No se pudo registrar la entrega"
    Swal.fire("Error", errMessage, "error")
  }
}
</script>
