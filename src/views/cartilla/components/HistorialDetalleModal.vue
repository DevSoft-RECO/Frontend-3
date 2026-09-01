<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-955 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Snapshot de Datos</h3>
        <button @click="$emit('close')" class="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer">✕</button>
      </div>

      <div class="p-6 overflow-y-auto font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-gray-50 dark:bg-black/50 border-b border-gray-100 dark:border-none">
        <pre class="whitespace-pre-wrap">{{ JSON.stringify(snapshot, null, 2) }}</pre>
      </div>

      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-955 border-t border-gray-200 dark:border-gray-800 flex justify-end shrink-0">
        <button
          @click="$emit('close')"
          class="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl text-sm cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  snapshot: {
    type: Object,
    default: () => ({})
  }
})
defineEmits(['close'])
</script>
