// Utilities
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { Agent, Project, Registration } from '@/models'
import { useSai } from '@/sai'
import { useCoreStore } from './core'


export const useAppStore = defineStore('app', () => {
  const coreStore = useCoreStore()
  const agents = ref<Agent[]>([])
  const projects = ref<Project[]>([])
  const registrations = ref<Registration[]>([])

  async function loadAgents(): Promise<void> {
    const sai = useSai(coreStore.userId)
    agents.value = await sai.getAgents()
  }

  async function loadProjects(ownerId: string): Promise<void> {
    const sai = useSai(coreStore.userId)
    const data = await sai.getProjects(ownerId)
    projects.value = data.projects
    registrations.value = data.registrations
  }

  return { agents, projects, registrations, loadAgents, loadProjects }
})
