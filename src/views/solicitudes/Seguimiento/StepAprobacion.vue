<template>
  <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-inner">
     <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span class="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
        Aprobación Formal
    </h3>

    <div v-if="['SOLICITADO', 'EN_GESTION'].includes(request.estado)" class="text-center py-8">
        <p class="text-gray-400 italic">Pendiente de aprobación...</p>
    </div>

    <div v-else class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                <p class="text-gray-500 font-bold uppercase text-xs mb-1">Monto Aprobado</p>
                <p class="text-green-600 dark:text-green-400 font-bold text-xl">Q{{ request.monto }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                <p class="text-gray-500 font-bold uppercase text-xs mb-1">Tipo Apoyo</p>
                <p class="dark:text-white font-medium">{{ request.tipo_apoyo?.nombre || 'N/A' }}</p>
            </div>
             <div class="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                <p class="text-gray-500 font-bold uppercase text-xs mb-1">Responsable</p>
                <p class="dark:text-white font-medium">{{ request.responsable_asignado }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded shadow-sm border border-gray-100 dark:border-gray-700 col-span-1 md:col-span-3">
                <p class="text-gray-500 font-bold uppercase text-xs mb-1">Comentario Aprobación</p>
                <p class="dark:text-white text-sm italic">"{{ request.comentario_aprobacion || 'Sin comentarios' }}"</p>
            </div>
        </div>

        <div>
             <p class="text-gray-500 font-bold uppercase text-xs mb-2">Documento de Aprobación Firmado</p>
             <SecureDoc
                v-if="request.path_documento_firmado"
                :id="request.id"
                type="firmado"
                customClass="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition shadow-sm font-medium"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Ver PDF Firmado
            </SecureDoc>
            <span v-else class="text-red-400 text-xs italic">Error: No se encuentra el documento firmado</span>
        </div>
    </div>
  </div>
</template>

<script setup>
import SecureDoc from '@/components/shared/SecureDoc.vue'

defineProps({
    request: { type: Object, required: true }
})
</script>
