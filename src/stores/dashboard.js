import { defineStore } from 'pinia'
import axios from '@/api/axios'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        stats: null,
        upcomingEvents: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchDashboardData() {
            this.loading = true
            this.error = null
            try {
                const response = await axios.get('/dashboard')
                this.stats = response.data.stats
                this.upcomingEvents = response.data.upcoming_events
                return response.data
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
                this.error = error
                throw error
            } finally {
                this.loading = false
            }
        }
    }
})
