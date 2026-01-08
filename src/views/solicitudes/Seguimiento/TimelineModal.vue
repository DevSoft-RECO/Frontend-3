<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20">

        <!-- HEADER -->
        <div class="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Seguimiento de Solicitud</h2>
                <p class="text-sm text-gray-500">ID #{{ request?.id }} - {{ request?.nombre_solicitante }}</p>
            </div>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <!-- BODY -->
        <div class="flex-1 overflow-y-auto p-6">

            <!-- STEPPER NAV -->
            <div class="mb-8 px-4">
                <div class="flex items-center justify-between w-full">
                    <template v-for="(step, index) in steps" :key="index">
                        <!-- Step Item -->
                        <div class="flex flex-col items-center relative z-10">
                            <button
                                @click="handleStepClick(index + 1)"
                                :disabled="index + 1 > maxAccessibleStep"
                                class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2"
                                :class="getStepCircleClass(index + 1)"
                            >
                                <span v-if="activeStep > index + 1 && index + 1 <= maxAccessibleStep">✓</span>
                                <span v-else>{{ index + 1 }}</span>
                            </button>
                            <span
                                class="absolute top-12 text-xs font-bold uppercase whitespace-nowrap transition-colors duration-300"
                                :class="activeStep === index + 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'"
                            >
                                {{ step.label }}
                            </span>
                        </div>

                        <!-- Connector Line (not after last item) -->
                        <div
                            v-if="index < steps.length - 1"
                            class="flex-1 h-1 mx-2 rounded transition-colors duration-300"
                            :class="activeStep > index + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'"
                        ></div>
                    </template>
                </div>
            </div>

            <!-- STEP CONTENT -->
            <div class="transition-all duration-300 ease-in-out">
                <StepSolicitud v-if="activeStep === 1" :request="request" />
                <StepGestion v-if="activeStep === 2" :request="request" />
                <StepAprobacion v-if="activeStep === 3" :request="request" />
                <StepFinalizacion v-if="activeStep === 4" :request="request" @refresh="emit('refresh')" />
            </div>

        </div>

        <!-- FOOTER (Nav Buttons) -->
        <div class="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between">
            <button
                @click="activeStep > 1 ? activeStep-- : null"
                :disabled="activeStep === 1"
                class="px-4 py-2 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            >
                ← Anterior
            </button>
            <button
                @click="activeStep < 4 ? activeStep++ : null"
                :disabled="activeStep === 4 || activeStep >= maxAccessibleStep"
                class="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed font-medium shadow"
            >
                Siguiente →
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import StepSolicitud from './StepSolicitud.vue'
import StepGestion from './StepGestion.vue'
import StepAprobacion from './StepAprobacion.vue'
import StepFinalizacion from './StepFinalizacion.vue'

const props = defineProps({
    show: { type: Boolean, default: false },
    request: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'refresh'])

const activeStep = ref(1)

const steps = [
    { label: 'Solicitud' },
    { label: 'Gestión' },
    { label: 'Aprobación' },
    { label: 'Finalización' }
]

// Auto-navigate to latest active step when opening
watch(() => props.show, (newVal) => {
    if(newVal && props.request) {
        determineInitialStep()
    }
})

const determineInitialStep = () => {
    // Determines the current "active" stage based on status
    const s = props.request?.estado
    if(s === 'SOLICITADO') activeStep.value = 1
    else if(s === 'EN_GESTION') activeStep.value = 2
    else if(s === 'APROBADO') activeStep.value = 4 // Salta al 4 directo para que suba evidencias
    else if(s === 'FINALIZADO') activeStep.value = 4
    else activeStep.value = 1
}

const maxAccessibleStep = computed(() => {
    const s = props.request?.estado
    if(s === 'SOLICITADO') return 1
    if(s === 'EN_GESTION') return 2
    if(s === 'APROBADO') return 4 // Permitir ver hasta el 4 (Evidencias)
    if(s === 'FINALIZADO') return 4
    if(s === 'RECHAZADO') return 4 // Permitir ver todo para ver donde fallo (o restringir si se prefiere)
    return 1
})

const getStepCircleClass = (stepNum) => {
    // Current Active
    if (activeStep.value === stepNum) {
        return 'bg-indigo-600 text-white border-indigo-200 dark:border-indigo-900 shadow-lg scale-110'
    }
    // Completed / Accessible
    if (stepNum <= maxAccessibleStep.value) {
        return 'bg-green-500 text-white border-green-200 dark:border-green-900 cursor-pointer hover:bg-green-600'
    }
    // Locked / Future
    return 'bg-gray-100 dark:bg-gray-700 text-gray-300 border-gray-200 dark:border-gray-600 cursor-not-allowed opacity-50'
}

const handleStepClick = (stepNum) => {
    if(stepNum <= maxAccessibleStep.value) {
        activeStep.value = stepNum
    }
}

const close = () => {
    emit('close')
}
</script>
