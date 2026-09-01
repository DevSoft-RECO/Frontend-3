<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Exportación de Datos
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Descarga de reportes en formato CSV estructurado
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Tarjeta 1: Registros -->
      <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Registros de Participantes</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Descarga el historial completo de asociados que han participado en la promoción con stickers y promocionales entregados.
          </p>
        </div>
        <button
          @click="descargar('/cartilla/exportar/registros', 'cartilla_registros')"
          :disabled="cargando['/cartilla/exportar/registros']"
          class="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/registros']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV de Registros
        </button>
      </div>

      <!-- Tarjeta 2: Historial Registros -->
      <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Auditoría de Cambios (Registros)</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Libro de auditoría de registros de participaciones que han sido editados o eliminados.
          </p>
        </div>
        <button
          @click="descargar('/cartilla/exportar/historial-registros', 'cartilla_historial_registros')"
          :disabled="cargando['/cartilla/exportar/historial-registros']"
          class="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/historial-registros']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV Historial Cambios
        </button>
      </div>

      <!-- Tarjeta 3: Movimientos Kárdex -->
      <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Libro de Kárdex (Inventario)</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Listado total de movimientos manuales de ingresos, traslados a agencias y consumos automáticos.
          </p>
        </div>
        <button
          @click="descargar('/cartilla/exportar/movimientos', 'cartilla_inventario_movimientos')"
          :disabled="cargando['/cartilla/exportar/movimientos']"
          class="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/movimientos']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV Kárdex
        </button>
      </div>

      <!-- Tarjeta 4: Historial Inventario -->
      <div class="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Auditoría Kárdex</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Registro de movimientos manuales de inventario que han sido modificados o revertidos.
          </p>
        </div>
        <button
          @click="descargar('/cartilla/exportar/historial-inventario', 'cartilla_historial_inventario')"
          :disabled="cargando['/cartilla/exportar/historial-inventario']"
          class="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="cargando['/cartilla/exportar/historial-inventario']" class="animate-spin text-sm">⌛</span>
          <span v-else>📥</span> Descargar CSV Historial Kárdex
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
