<template>
  <!-- Versión compatible: Siempre mostramos el contenedor si existe el objeto de paginación, 
       pero ocultamos los controles si solo hay una página para no confundir, 
       o los dejamos desactivados. Decidimos mostrar al menos la info de página. -->
  <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:bg-gray-800 dark:border-gray-700" v-if="totalPages > 0">
    
    <!-- Mobile view: Simplificado (eliminamos sm:hidden si causa problemas, pero lo mantenemos con clases más estándar) -->
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      >
        Anterior
      </button>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      >
        Siguiente
      </button>
    </div>

    <!-- Desktop view: Reemplazamos 'isolate' y simplificamos 'ring' -->
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          Página <span class="font-medium">{{ currentPage }}</span> de <span class="font-medium">{{ totalPages }}</span>
        </p>
      </div>
      <div v-if="totalPages > 1">
        <nav class="relative z-0 inline-flex shadow-sm -space-x-px rounded-md" aria-label="Pagination">
          <!-- Previous Button -->
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage <= 1"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          >
            <span class="sr-only">Anterior</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- Numbered Pages -->
           <template v-for="page in pages" :key="page">
                <button
                    @click="goToPage(page)"
                    :class="[
                        page === currentPage
                            ? 'z-10 bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300',
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                    ]"
                >
                    {{ page }}
                </button>
           </template>

          <!-- Next Button -->
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage >= totalPages"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          >
            <span class="sr-only">Siguiente</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    current_page: { type: [Number, String], default: 1 },
    last_page: { type: [Number, String], default: 1 }
})

const emit = defineEmits(['change-page'])

// Aseguramos que trabajamos con números
const currentPage = computed(() => parseInt(props.current_page) || 1)
const totalPages = computed(() => parseInt(props.last_page) || 1)

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        emit('change-page', page)
    }
}

const pages = computed(() => {
    const current = currentPage.value
    const last = totalPages.value
    
    let start = Math.max(1, current - 2)
    let end = Math.min(last, start + 4)

    if (end - start < 4) {
        start = Math.max(1, end - 4)
    }

    const range = []
    for (let i = start; i <= end; i++) {
        range.push(i)
    }
    return range
})
</script>

