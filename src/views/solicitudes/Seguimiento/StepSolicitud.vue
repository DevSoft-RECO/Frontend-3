<template>
  <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-inner">
    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
        Detalles de la Solicitud
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

        <!-- Fecha Solicitud -->
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Fecha Solicitud</p>
            <p class="dark:text-white font-medium text-base">{{ formatDate(request.fecha_solicitud) }}</p>
        </div>

        <!-- Fecha Evento -->
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Fecha Evento</p>
            <p class="dark:text-white font-medium text-base">{{ formatDate(request.fecha_evento) }}</p>
        </div>

        <!-- Solicitante -->
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Solicitante</p>
            <p class="dark:text-white font-medium text-base">{{ request.nombre_solicitante }}</p>
        </div>

        <!-- Telefono -->
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Teléfono</p>
            <p class="dark:text-white font-medium text-base">{{ request.telefono }}</p>
        </div>

        <!-- Nombre Contacto (Opcional) -->
        <div v-if="request.nombre_contacto">
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Contacto Adicional</p>
            <p class="dark:text-white font-medium text-base">{{ request.nombre_contacto }}</p>
        </div>

        <!-- Comunidad -->
        <div>
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Comunidad</p>
            <!-- Mostramos nombre si existe la relacion, sino el ID -->
            <p class="dark:text-white font-medium text-base">{{ request.comunidad?.nombre || 'ID: ' + request.comunidad_id }}</p>
        </div>

        <!-- Comentario -->
        <div class="col-span-1 md:col-span-2">
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Comentario / Descripción</p>
            <div class="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 italic text-gray-600 dark:text-gray-300">
                "{{ request.comentario_solicitud }}"
            </div>
        </div>

        <!-- Documento -->
        <div class="col-span-1 md:col-span-2">
            <p class="text-gray-500 font-bold uppercase text-xs mb-1">Documento Adjunto</p>
            <SecureDoc
                v-if="request.path_documento_adjunto"
                :id="request.id"
                type="adjunto"
                customClass="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition shadow-sm font-medium"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Ver Documento Original
            </SecureDoc>
            <span v-else class="text-gray-400 italic">No se adjuntó documento</span>
        </div>
    </div>
  </div>
</template>

<script setup>
import SecureDoc from '@/components/shared/SecureDoc.vue'

defineProps({
    request: { type: Object, required: true }
})

const formatDate = (dateString) => {
    if(!dateString) return 'N/A'
    return dateString.split('T')[0]
}
</script>
