<template>
  <div :class="containerClass">
    <div v-if="loading" class="animate-pulse bg-gray-200 rounded flex items-center justify-center h-full w-full">
        <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    </div>

    <div v-else-if="error" class="bg-gray-100 rounded flex items-center justify-center h-full w-full border border-gray-200">
        <span class="text-xs text-gray-400">No imagen</span>
    </div>

    <img
        v-else
        :src="imageUrl"
        :class="imageClass"
        :alt="alt"
        @click="openFull"
        class="cursor-pointer hover:opacity-90 transition-opacity"
    >
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useSolicitudesStore } from '@/stores/solicitudes';

const props = defineProps({
    id: { type: [Number, String], required: true },
    type: { type: String, required: true }, // 'entrega' | 'conocimiento'
    alt: { type: String, default: 'Evidencia' },
    containerClass: { type: String, default: '' },
    imageClass: { type: String, default: 'w-full h-full object-cover rounded' }
});

const store = useSolicitudesStore();
const imageUrl = ref('');
const loading = ref(true);
const error = ref(false);

const fetchSecureUrl = async () => {
  if(!props.id) return;

  loading.value = true;
  error.value = false;
  try {
    const url = await store.getFileUrl(props.id, props.type);
    if(url) {
        imageUrl.value = url;
    } else {
        error.value = true;
    }
  } catch (err) {
    console.error("Error loading secure image", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const openFull = () => {
    if(imageUrl.value) window.open(imageUrl.value, '_blank');
}

onMounted(fetchSecureUrl);

// Refetch if ID changes (e.g. reused component)
watch(() => props.id, fetchSecureUrl);
</script>
