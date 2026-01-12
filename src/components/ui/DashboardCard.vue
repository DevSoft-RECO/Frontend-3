<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-all group"
    :class="clickable ? 'hover:shadow-md cursor-pointer' : 'cursor-default'"
  >
    <div class="flex items-center justify-between mb-4">
      <div :class="`p-3 rounded-lg ${colorClasses}`">
        <svg v-if="icon === 'inbox'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        <svg v-else-if="icon === 'clock'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <svg v-else-if="icon === 'check-circle'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <svg v-else-if="icon === 'flag'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M5 21v-8a2 2 0 012-2h14a2 2 0 012 2v8"></path></svg>
        <svg v-else-if="icon === 'ban'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
      </div>
    </div>
    <div>
      <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">{{ title }}</p>
      <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">{{ count }}</h3>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  count: [Number, String],
  icon: String,
  color: {
    type: String,
    default: 'blue'
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const colorClasses = computed(() => {
  const map = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300'
  }
  return map[props.color] || map.blue
})
</script>
