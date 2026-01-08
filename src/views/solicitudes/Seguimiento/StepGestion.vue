<template>
  <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg shadow-inner">
     <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <span class="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
        Gestión Administrativa
    </h3>

    <div v-if="request.estado === 'SOLICITADO'" class="text-center py-8">
        <div class="inline-block p-4 bg-yellow-50 rounded-full mb-3">
             <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <p class="text-gray-500 font-medium">Esta solicitud está pendiente de revisión administrativa.</p>
    </div>

    <div v-else>
         <div v-if="request.comentario_gestion" class="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 p-4">
            <p class="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase mb-1">Observaciones de Gestión</p>
            <p class="text-gray-700 dark:text-gray-300 text-sm italic">
                "{{ request.comentario_gestion }}"
            </p>
        </div>
        <div v-else class="text-gray-400 italic text-sm text-center mt-4">
            Sin comentarios de gestión registrados.
        </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
    request: { type: Object, required: true }
})
</script>
