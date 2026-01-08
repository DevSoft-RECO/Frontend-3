<template>
  <div class="w-full">
    <!-- DESKTOP VIEW -->
    <div class="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
            <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                    <th
                        v-for="col in columns"
                        :key="col.key"
                        :class="[
                            'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                            col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : 'text-left')
                        ]"
                    >
                        {{ col.label }}
                    </th>
                </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-if="loading">
                    <td :colspan="columns.length" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Cargando...
                    </td>
                </tr>
                <tr v-else-if="rows.length === 0">
                    <td :colspan="columns.length" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        <slot name="empty">No hay datos disponibles</slot>
                    </td>
                </tr>
                <tr v-else v-for="(row, rowIndex) in rows" :key="rowIndex" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td
                        v-for="col in columns"
                        :key="col.key"
                        :class="[
                            'px-6 py-4 text-sm text-gray-900 dark:text-gray-100',
                            col.truncate !== false ? 'truncate' : '',
                            col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : 'text-left')
                        ]"
                    >
                        <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                            {{ row[col.key] }}
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- MOBILE VIEW (STACKED CARDS) -->
    <div class="block md:hidden space-y-4">
        <div v-if="loading" class="text-center p-4">Cargando...</div>
        <div v-else-if="rows.length === 0" class="text-center p-4 text-gray-500">
             <slot name="empty">No hay datos disponibles</slot>
        </div>
        <div
            v-else
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            :class="[
                'rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700',
                rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
            ]"
        >
            <!-- Header of the card (optional, can use first column or ID) -->
             <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-medium flex justify-between items-center" v-if="columns.length > 0">
                 <span class="text-gray-500 text-xs uppercase">{{ columns[0].mobileLabel || columns[0].label }}</span>
                 <span class="text-gray-900 dark:text-white">
                      <!-- Slot for first column in header if needed, or just text -->
                      <slot :name="`mobile-cell-${columns[0].key}`" :row="row" :value="row[columns[0].key]">
                          <slot :name="`cell-${columns[0].key}`" :row="row" :value="row[columns[0].key]">
                                {{ row[columns[0].key] }}
                          </slot>
                      </slot>
                 </span>
            </div>

            <div class="p-4 space-y-3">
                 <!-- Loop through remaining columns -->
                 <div v-for="col in columns.slice(1)" :key="col.key" class="flex justify-between items-start">
                     <span class="text-sm font-medium text-gray-500 dark:text-gray-400 shrink-0 mr-4">
                         {{ col.mobileLabel || col.label }}
                     </span>
                     <span class="text-sm text-gray-900 dark:text-gray-100 text-right break-words">
                         <slot :name="`mobile-cell-${col.key}`" :row="row" :value="row[col.key]">
                             <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                                 {{ row[col.key] }}
                             </slot>
                         </slot>
                     </span>
                 </div>
            </div>
        </div>
    </div>

    <!-- PAGINATION -->
    <BasePagination
        v-if="pagination"
        :current_page="pagination.current_page"
        :last_page="pagination.last_page"
        @change-page="$emit('change-page', $event)"
        class="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    />
  </div>
</template>

<script setup>
import BasePagination from './BasePagination.vue'

defineProps({
    columns: { type: Array, required: true },
    rows: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    pagination: { type: Object, default: null }
})

defineEmits(['change-page'])
</script>
