<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl overflow-hidden">
      <div class="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div class="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl shadow-inner shrink-0">
          📊
        </div>
        <div class="text-center md:text-left">
          <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Centro de Exportaciones
          </h1>
          <p class="text-base text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-2xl">
            Descarga reportes estructurados en formato CSV listos para auditoría y análisis en Excel. Los datos se exportan en tiempo real.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      
      <!-- Tarjeta 1: Registros -->
      <div class="relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 group flex flex-col justify-between h-full">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
        <div class="relative z-10 flex items-start gap-4 mb-6">
          <div class="w-14 h-14 shrink-0 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-2xl rounded-2xl">
            📝
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">Registros de Participantes</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
              Descarga el historial completo de asociados participantes en la promoción con stickers y regalos.
            </p>
          </div>
        </div>
        <button
          @click="descargar('/cartilla/exportar/registros', 'cartilla_registros')"
          :disabled="cargando['/cartilla/exportar/registros']"
          class="relative z-10 w-full py-3 bg-gray-50 hover:bg-emerald-600 dark:bg-gray-800 dark:hover:bg-emerald-600 text-gray-700 hover:text-white dark:text-gray-300 font-bold rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors border border-gray-200 dark:border-gray-700 hover:border-transparent shadow-sm disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/registros']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV
        </button>
      </div>

      <!-- Tarjeta 2: Llamadas -->
      <div class="relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 group flex flex-col justify-between h-full">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
        <div class="relative z-10 flex items-start gap-4 mb-6">
          <div class="w-14 h-14 shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-2xl rounded-2xl">
            📞
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">Llamadas (Automáticos)</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
              Exportación del historial de llamadas de seguimiento a los asociados desde Pagos Automáticos.
            </p>
          </div>
        </div>
        <button
          @click="descargar('/cartilla/exportar/llamadas', 'cartilla_llamadas')"
          :disabled="cargando['/cartilla/exportar/llamadas']"
          class="relative z-10 w-full py-3 bg-gray-50 hover:bg-indigo-600 dark:bg-gray-800 dark:hover:bg-indigo-600 text-gray-700 hover:text-white dark:text-gray-300 font-bold rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors border border-gray-200 dark:border-gray-700 hover:border-transparent shadow-sm disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/llamadas']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV
        </button>
      </div>

      <!-- Tarjeta 3: Movimientos Kárdex -->
      <div class="relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 group flex flex-col justify-between h-full">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
        <div class="relative z-10 flex items-start gap-4 mb-6">
          <div class="w-14 h-14 shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-2xl rounded-2xl">
            📦
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">Libro de Kárdex (Stock)</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
              Listado total de movimientos manuales de ingresos, traslados y consumos automáticos en inventario.
            </p>
          </div>
        </div>
        <button
          @click="descargar('/cartilla/exportar/movimientos', 'cartilla_inventario_movimientos')"
          :disabled="cargando['/cartilla/exportar/movimientos']"
          class="relative z-10 w-full py-3 bg-gray-50 hover:bg-blue-600 dark:bg-gray-800 dark:hover:bg-blue-600 text-gray-700 hover:text-white dark:text-gray-300 font-bold rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors border border-gray-200 dark:border-gray-700 hover:border-transparent shadow-sm disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/movimientos']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV
        </button>
      </div>

      <!-- Tarjeta 4: Historial Registros (Auditoría) -->
      <div class="relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 group flex flex-col justify-between h-full">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
        <div class="relative z-10 flex items-start gap-4 mb-6">
          <div class="w-14 h-14 shrink-0 flex items-center justify-center bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-2xl rounded-2xl">
            🕵️
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">Auditoría Registros</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
              Libro de auditoría de los registros de participaciones que han sido editados o eliminados.
            </p>
          </div>
        </div>
        <button
          @click="descargar('/cartilla/exportar/historial-registros', 'cartilla_historial_registros')"
          :disabled="cargando['/cartilla/exportar/historial-registros']"
          class="relative z-10 w-full py-3 bg-gray-50 hover:bg-amber-600 dark:bg-gray-800 dark:hover:bg-amber-600 text-gray-700 hover:text-white dark:text-gray-300 font-bold rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors border border-gray-200 dark:border-gray-700 hover:border-transparent shadow-sm disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/historial-registros']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV
        </button>
      </div>

      <!-- Tarjeta 5: Auditoría Kárdex -->
      <div class="relative overflow-hidden p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl hover:shadow-2xl hover:border-purple-500/30 transition-all duration-300 group flex flex-col justify-between h-full">
        <div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
        <div class="relative z-10 flex items-start gap-4 mb-6">
          <div class="w-14 h-14 shrink-0 flex items-center justify-center bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-2xl rounded-2xl">
            🔄
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">Auditoría Kárdex</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
              Registro de movimientos manuales de inventario que han sido modificados o revertidos.
            </p>
          </div>
        </div>
        <button
          @click="descargar('/cartilla/exportar/historial-inventario', 'cartilla_historial_inventario')"
          :disabled="cargando['/cartilla/exportar/historial-inventario']"
          class="relative z-10 w-full py-3 bg-gray-50 hover:bg-purple-600 dark:bg-gray-800 dark:hover:bg-purple-600 text-gray-700 hover:text-white dark:text-gray-300 font-bold rounded-2xl text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors border border-gray-200 dark:border-gray-700 hover:border-transparent shadow-sm disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/historial-inventario']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/api/axios'
import Swal from 'sweetalert2'

const cargando = ref({})

const descargar = async (endpoint, prefijoNombre) => {
  cargando.value[endpoint] = true

  try {
    const response = await api.get(endpoint, {
      responseType: 'blob'
    })

    // Intentar extraer el nombre del header Content-Disposition si viene definido
    let filename = `${prefijoNombre}_${new Date().toISOString().slice(0, 10)}.csv`
    const disposition = response.headers['content-disposition']
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/)
      if (match && match[1]) {
        filename = match[1]
      }
    }

    const blob = new Blob([response.data], { type: 'text/csv;charset=windows-1252;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al descargar reporte:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error de Descarga',
      text: error.response?.data?.message || 'Ocurrió un problema al generar el archivo CSV.',
      background: '#1f2937',
      color: '#fff'
    })
  } finally {
    cargando.value[endpoint] = false
  }
}
</script>
