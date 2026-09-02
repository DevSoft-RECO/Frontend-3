<template>
<div
  class="relative flex h-screen
         bg-gray-50
         dark:bg-gray-900
         text-gray-800 dark:text-gray-100
         font-sans overflow-hidden transition-colors duration-300">

  <!-- Manchas decorativas (comentadas para un look mas limpio y elegante) -->
  <!--
  <div
    class="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px]
           rounded-full blur-3xl
           bg-gray-700/25
           dark:bg-gray-600/15">
  </div>
  <div
    class="pointer-events-none absolute -bottom-48 -right-48 w-[800px] h-[800px]
           rounded-full blur-3xl
           bg-gray-700/30
           dark:bg-gray-500/10">
  </div>
  -->



    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Contenido -->
    <div
      class="flex flex-col flex-1 min-w-0 print:ml-0"
      :class="[layoutStore.isCollapsed ? 'md:ml-20' : 'md:ml-[18rem]']"
    >
      <AdminHeader />

      <main class="flex-1 overflow-x-hidden overflow-y-auto p-6 print:p-0 relative custom-scrollbar">
        <RouterView />
      </main>
    </div>
  </div>
</template>


<script setup>
import { onMounted, onUnmounted } from 'vue' // Agregamos onUnmounted
import AdminSidebar from "../components/layout/AdminSidebar.vue"
import AdminHeader from "../components/layout/AdminHeader.vue"
import { useLayoutStore } from "@/stores/layout"

const layoutStore = useLayoutStore()

onMounted(() => {
  layoutStore.initTheme()

  // Agregamos el "Listener" para detectar cuando el usuario divide la pantalla
  window.addEventListener('resize', layoutStore.handleResize)
})

// Buena práctica: Limpiar el listener cuando sales del componente
onUnmounted(() => {
  window.removeEventListener('resize', layoutStore.handleResize)
})
</script>


