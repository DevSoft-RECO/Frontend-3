<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="layoutStore.isSidebarOpen"
      class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
      @click="layoutStore.closeSidebar"
    ></div>
  </Transition>

  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 shadow-2xl
           bg-gray-900 border-r border-gray-800"
    :class="[
      layoutStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      layoutStore.isCollapsed ? 'w-20' : 'w-72'
    ]"
  >
    <div class="h-16 flex items-center justify-between px-6 shrink-0
                bg-black/10 dark:bg-black/20 border-b border-white/5 dark:border-gray-800">
      <div v-if="!layoutStore.isCollapsed" class="flex items-center gap-3 fade-in w-full">
        <img src="@/assets/logoyk.svg" alt="YK" class="h-8 w-auto object-contain brightness-0 invert" />
        <span class="font-bold text-lg tracking-wider uppercase text-white dark:text-gray-100">
            Mercadeo
        </span>
      </div>
      <div v-else class="w-full flex justify-center fade-in">
        <img src="@/assets/logoyk.svg" alt="YK" class="h-8 w-8 object-contain brightness-0 invert" />
      </div>
    </div>

    <nav
      class="flex-1 py-6 px-3 space-y-2 custom-scrollbar"
      :class="layoutStore.isCollapsed ? 'overflow-visible' : 'overflow-y-auto'"
    >
      <template v-for="item in menuItems" :key="item.id">

        <div v-if="!item.children" class="relative group">
            <RouterLink
            :to="item.route"
            @click="handleItemClick"
            class="flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden"
            :class="[
                isActive(item.route)
                ? 'bg-gray-800 text-white shadow-[0_0_15px_rgba(34,197,94,0.15)]' // Glow effect light
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white',
                layoutStore.isCollapsed ? 'justify-center' : ''
            ]"
            >
                <!-- Active Gradient Border -->
                <div v-if="isActive(item.route) && !layoutStore.isCollapsed"
                     class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 via-cyan-500 to-blue-500 shadow-[0_0_8px_#4ade80]"
                ></div>

                <span class="shrink-0 transition-colors duration-200 z-10"
                      :class="isActive(item.route) ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'group-hover:text-emerald-400'">
                    <svg v-html="item.iconSvg" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"></svg>
                </span>

                <span v-if="!layoutStore.isCollapsed" class="ml-3 font-medium truncate">
                    {{ item.label }}
                </span>
            </RouterLink>

            <div
                v-if="layoutStore.isCollapsed"
                class="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-800 border border-gray-700 text-white text-sm font-bold rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap pointer-events-none"
                style="width: max-content;"
            >
                {{ item.label }}
                <!-- Arrow -->
                <div class="absolute top-3 -left-1 w-2 h-2 bg-gray-800 border-l border-b border-gray-700 transform rotate-45"></div>
            </div>
        </div>

        <div v-else class="relative group">
            <button
                @click="handleGroupClick(item.id)"
                class="w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative"
                :class="[
                    openGroups.includes(item.id) && !layoutStore.isCollapsed
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white',
                    layoutStore.isCollapsed ? 'justify-center' : 'justify-between'
                ]"
            >
                <div class="flex items-center">
                    <span class="shrink-0 transition-colors" :class="openGroups.includes(item.id) ? 'text-emerald-400' : 'group-hover:text-emerald-400'">
                        <svg v-html="item.iconSvg" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"></svg>
                    </span>
                    <span v-if="!layoutStore.isCollapsed" class="ml-3 font-medium truncate">{{ item.label }}</span>
                </div>

                <svg
                    v-if="!layoutStore.isCollapsed"
                    class="w-4 h-4 transition-transform duration-300"
                    :class="openGroups.includes(item.id) ? 'text-emerald-400 rotate-180' : 'text-gray-500'"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div
                v-if="layoutStore.isCollapsed"
                class="absolute left-full top-0 ml-3 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 origin-top-left p-2 overflow-hidden"
            >
                 <div class="px-3 py-2 text-xs font-bold text-emerald-500 uppercase tracking-wider border-b border-gray-700 mb-1">
                    {{ item.label }}
                 </div>

                 <RouterLink
                  v-for="child in item.children"
                  :key="child.route"
                  :to="child.route"
                  @click="handleItemClick"
                  class="block px-3 py-2 rounded-lg text-sm transition-colors"
                  :class="isActive(child.route)
                    ? 'bg-gray-800 text-emerald-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
                >
                  {{ child.label }}
                </RouterLink>

                 <div class="absolute top-4 -left-1.5 w-3 h-3 bg-gray-900 border-l border-b border-gray-700 transform rotate-45"></div>
            </div>

            <div
                v-if="openGroups.includes(item.id) && !layoutStore.isCollapsed"
                class="mt-1 ml-4 pl-4 border-l border-white/20 dark:border-gray-700 space-y-1"
            >
                <RouterLink
                    v-for="child in item.children"
                    :key="child.route"
                    :to="child.route"
                    @click="handleItemClick"
                    class="block px-3 py-2 rounded-md text-sm transition-colors duration-200"
                    :class="isActive(child.route)
                        ? 'text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]'
                        : 'text-gray-400 hover:text-white'"
                >
                    {{ child.label }}
                </RouterLink>
            </div>
        </div>
      </template>
    </nav>

    <div class="p-4 mt-auto border-t border-white/10 dark:border-gray-800 shrink-0">
        <div v-if="!layoutStore.isCollapsed" class="fade-in text-center">
            <p class="text-xs font-medium text-gray-500 mb-1">Desarrollado por</p>
            <p class="text-xs font-bold text-gray-300 tracking-wide">
                Área de Informática <span class="text-emerald-500">2025</span>
            </p>
        </div>
        <div v-else class="flex justify-center fade-in">
            <svg class="w-5 h-5 text-gray-500 hover:text-emerald-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from "@/stores/layout"
import { useAuthStore } from "@/stores/auth"

const route = useRoute()
const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const openGroups = ref([])

// --- NUEVA FUNCIÓN PARA CERRAR EN MÓVIL ---
const handleItemClick = () => {
  if (window.innerWidth < 768) {
      layoutStore.closeSidebar()
  }
}

const menuItems = computed(() => {
    const items = [
        {
            id: 'home',
            label: 'Dashboard',
            route: '/admin/dashboard',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2v10a1 1 0 01-1 1h-3m-4 0h4" />'
        }
    ]

    // Solo mostrar si tiene permiso
    if (authStore.can('gestionar_solicitudes')) {
        items.push({
            id: 'mis-solicitudes',
            label: 'Mis Solicitudes',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />',
            children: [
                { label: 'Gestionar Mis Solicitudes', route: '/admin/solicitudes/crear' },
            ]
        })
    }

    // Admin Group: Adm. Solicitudes y Facturas
    // Solo visible si tiene permiso 'admin_mercadeo'
    if (authStore.can('admin_mercadeo')) {
        items.push({
            id: 'admin-solicitudes',
            label: 'Adm. Solicitudes',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />',
            children: [
                { label: 'Bandeja de Entrada', route: '/admin/solicitudes/seguimiento' },
                { label: 'Tipos de Apoyo', route: '/admin/solicitudes/tipos-apoyo' },
                { label: 'Gestión Localidades', route: '/admin/localidades' }
            ]
        })

        items.push({
            id: 'facturas',
            label: 'Facturas',
            iconSvg: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 4h6m-6 4h6M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />',
            children: [
                { label: 'Listado Facturas', route: '/admin/facturas/listado' },
                { label: 'Categorías', route: '/admin/facturas/categorias' }
            ]
        })
    }

    return items
})

const isActive = (path) => route.path === path

const handleGroupClick = (id) => {
    if (layoutStore.isCollapsed) return
    if (openGroups.value.includes(id)) {
        openGroups.value = []
    } else {
        openGroups.value = [id]
    }
}
</script>

<style scoped>
.fade-in { animation: fadeIn 0.4s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); border-radius: 20px; }
</style>
