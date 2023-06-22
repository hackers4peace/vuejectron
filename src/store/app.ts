// Utilities
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Agent } from '@/models'
import { useSai } from '@/sai'
import { useCoreStore } from './core'


export const useAppStore = defineStore('app', () => {
  const coreStore = useCoreStore()
  const agents = ref<Agent[]>([])

  async function loadAgents(): Promise<void> {
    const sai = useSai(coreStore.userId)
    agents.value = await sai.getAgents()
  }

  return { agents, loadAgents }
})
