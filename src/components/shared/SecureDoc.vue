<template>
  <div class="inline-block">
    <button
        v-if="!loading"
        @click="handleClick"
        class="flex items-center gap-2 transition-colors"
        :class="computedClasses"
    >
        <slot>
            <!-- Default Icon if no slot -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span>Ver Documento</span>
        </slot>
    </button>
    <span v-else class="text-xs text-gray-400 flex items-center gap-1">
        <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Abriendo...
    </span>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useSolicitudesStore } from '@/stores/solicitudes';

const props = defineProps({
    id: { type: [Number, String], required: true },
    type: { type: String, required: true }, // 'adjunto' | 'firmado'
    customClass: { type: String, default: 'text-indigo-600 hover:text-indigo-800 hover:underline' }
});

const store = useSolicitudesStore();
const loading = ref(false);

const computedClasses = props.customClass;

const handleClick = async () => {
    loading.value = true;
    try {
        const url = await store.getFileUrl(props.id, props.type);
        if(url) {
            window.open(url, '_blank');
        } else {
            alert("No se pudo obtener la URL del archivo.");
        }
    } catch (e) {
        console.error(e);
        alert("Error al abrir el documento. Puede que el archivo no exista.");
    } finally {
        loading.value = false;
    }
}
</script>
