<template>
  <div class="p-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Facturas</h1>
          <p class="text-sm text-gray-500">Gestión y control de facturas</p>
      </div>
      <div class="flex gap-2">
           <button
            @click="downloadCsv"
            :disabled="loading"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
            Exportar CSV
          </button>
          <button
            @click="openModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition flex items-center gap-2 text-sm font-medium"
          >
            <span>+ Nueva Factura</span>
          </button>
      </div>
    </div>

    <!-- FILTROS -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">No. Factura / Serie</label>
            <input v-model="filters.numero" @input="debouncedSearch" type="text" placeholder="Buscar..." class="w-full text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
        </div>
        <div>
             <label class="block text-xs font-medium text-gray-500 mb-1">Fecha Inicio</label>
             <input v-model="filters.fecha_inicio" @change="loadData" type="date" class="w-full text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
        </div>
        <div>
             <label class="block text-xs font-medium text-gray-500 mb-1">Fecha Fin</label>
             <input v-model="filters.fecha_fin" @change="loadData" type="date" class="w-full text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
        </div>
        <div class="flex items-end">
            <button @click="resetFilters" class="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 underline">Limpiar Filtros</button>
        </div>
    </div>

    <!-- TABLA -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <BaseTable
            :columns="columns"
            :rows="facturas"
            :loading="loading"
            :pagination="pagination"
            @change-page="changePage"
        >
            <template #cell-monto="{ row }">
                <span class="font-mono font-medium">Q{{ parseFloat(row.monto).toFixed(2) }}</span>
            </template>
            <template #cell-categoria="{ row }">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {{ row.categoria?.nombre || 'N/A' }}
                </span>
            </template>
            <template #cell-fecha="{ row }">
                {{ formatDate(row.fecha_factura) }}
            </template>
            <template #cell-actions="{ row }">
                 <div class="flex justify-end gap-2 text-sm">
                    <button @click="openModal(row)" class="text-blue-600 hover:underline">Editar</button>
                    <button @click="deleteItem(row)" class="text-red-600 hover:underline">Eliminar</button>
                </div>
            </template>
        </BaseTable>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white border-b pb-2">
                {{ isEditing ? 'Editar Factura' : 'Nueva Factura' }}
            </h3>

            <form @submit.prevent="save" class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <!-- Col 1 -->
                <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Factura *</label>
                     <input v-model="form.numero_factura" type="text" required class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
                </div>
                <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Serie *</label>
                     <input v-model="form.numero_serie" type="text" required class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
                </div>

                <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría *</label>
                     <select v-model="form.categoria_id" required class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
                         <option value="" disabled>Seleccione...</option>
                         <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                     </select>
                </div>

                 <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Factura *</label>
                     <input v-model="form.fecha_factura" type="date" required class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
                </div>

                 <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto (Q) *</label>
                     <input v-model="form.monto" type="number" step="0.01" min="0" required class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
                </div>

                <!-- Emisor Info -->
                 <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Emisor</label>
                     <input v-model="form.nombre_emisor" type="text" class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
                </div>
                 <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIT Emisor</label>
                     <input v-model="form.nit_emisor" type="text" class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm">
                </div>

                <!-- Descripcion Full Width -->
                <div class="md:col-span-2">
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (Opcional)</label>
                     <textarea v-model="form.descripcion" rows="3" class="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"></textarea>
                </div>


                <div class="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t dark:border-gray-700">
                    <button type="button" @click="closeModal" class="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
                    <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {{ saving ? 'Guardando...' : 'Guardar Factura' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useFacturasStore } from '@/stores/facturas'
import BaseTable from '@/components/ui/BaseTable.vue'

const store = useFacturasStore()
const facturas = ref([])
const categorias = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)

// Pagination
const pagination = ref({ current_page: 1, last_page: 1 })

// Filtros
const filters = reactive({
    numero: '', // Busqueda general (numero o serie)
    fecha_inicio: '',
    fecha_fin: ''
})

// Form definition
const form = reactive({
    id: null,
    numero_factura: '',
    numero_serie: '',
    categoria_id: '',
    fecha_factura: '',
    monto: '',
    descripcion: '',
    nombre_emisor: '',
    nit_emisor: ''
})

const columns = [
    { key: 'numero_factura', label: 'No. Factura' },
    { key: 'numero_serie', label: 'Serie' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'monto', label: 'Monto' },
    { key: 'nombre_emisor', label: 'Emisor', truncate: true },
    { key: 'actions', label: 'Acciones', align: 'right' }
]

const downloadCsv = async () => {
    loading.value = true
    try {
        const params = {
            search: filters.numero,
            fecha_inicio: filters.fecha_inicio,
            fecha_fin: filters.fecha_fin
        }
        const blob = await store.downloadFacturasCsv(params)

        // Create invisible link to download blob
        const url = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `facturas_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    } catch (e) {
        console.error(e)
        alert('Error al descargar el archivo: ' + (e.message || 'Error desconocido'))
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    loading.value = true
    await Promise.all([
        loadData(),
        loadCategorias()
    ])
    loading.value = false
})

const loadCategorias = async () => {
    try {
        categorias.value = await store.fetchCategorias()
    } catch(e) { console.error(e) }
}

const loadData = async (page = 1) => {
    loading.value = true
    try {
        const params = {
            page,
            search: filters.numero,
            fecha_inicio: filters.fecha_inicio,
            fecha_fin: filters.fecha_fin
        }
        const res = await store.fetchFacturas(params)
        if (Array.isArray(res.data)) {
             facturas.value = res.data
        } else if (Array.isArray(res)) {
             facturas.value = res
        } else {
             facturas.value = []
        }

        if(res.current_page) {
            pagination.value = {
                current_page: res.current_page,
                last_page: res.last_page,
                total: res.total
            }
        }
    } catch (e) { console.error(e) }
    finally { loading.value = false }
}

const changePage = (page) => loadData(page)

// Debounce search
let timeout = null
const debouncedSearch = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
        loadData(1)
    }, 500)
}

const resetFilters = () => {
    filters.numero = ''
    filters.fecha_inicio = ''
    filters.fecha_fin = ''
    loadData(1)
}

const formatDate = (d) => {
    if(!d) return '-'
    return new Date(d).toLocaleDateString()
}

// Modal Logic
const openModal = (item = null) => {
    if (item) {
        isEditing.value = true
        Object.keys(form).forEach(k => {
            if(k === 'fecha_factura') form[k] = item[k]?.split('T')[0] // Fix date input
            else form[k] = item[k] || ''
        })
        form.id = item.id
    } else {
        isEditing.value = false
        Object.keys(form).forEach(k => form[k] = '')
        form.categoria_id = '' // Default empty
    }
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const save = async () => {
    saving.value = true
    try {
        const payload = { ...form }
        // Ensure numeric types
        payload.monto = parseFloat(payload.monto)

        if (isEditing.value) {
            await store.updateFactura(form.id, payload)
        } else {
            await store.createFactura(payload)
        }
        await loadData(pagination.value.current_page)
        closeModal()
    } catch (e) {
        alert("Error: " + (e.response?.data?.message || e.message))
    } finally {
        saving.value = false
    }
}

const deleteItem = async (item) => {
    if (!confirm(`¿Eliminar factura ${item.numero_factura}?`)) return
    try {
        await store.deleteFactura(item.id)
        loadData(pagination.value.current_page)
    } catch (e) {
        alert("Error: " + (e.response?.data?.error || e.message))
    }
}
</script>
