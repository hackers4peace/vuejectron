// Utilities
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { Agent, FileInstance, ImageInstance, Project, Registration, Task } from '@/models'
import { useSai } from '@/sai'
import { useCoreStore } from './core'


export const useAppStore = defineStore('app', () => {
  const coreStore = useCoreStore()
  const agents = ref<Agent[]>([])
  const projects = ref<Project[]>([])
  const registrations = ref<Registration[]>([])
  const tasks = ref<Task[]>([])
  const files = ref<FileInstance[]>([])
  const images = ref<ImageInstance[]>([])

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

  async function loadTasks(projectId: string): Promise<void> {
    const sai = useSai(coreStore.userId)
    const data = await sai.getTasks(projectId)
    tasks.value = data.tasks
  }

  async function loadFiles(projectId: string): Promise<void> {
    const sai = useSai(coreStore.userId)
    const data = await sai.getFiles(projectId)
    files.value = data.files
  }

  async function loadImages(projectId: string): Promise<void> {
    const sai = useSai(coreStore.userId)
    const data = await sai.getImages(projectId)
    images.value = data.images
  }

  return { agents, registrations, projects, tasks, files, images, loadAgents, loadProjects, loadTasks, loadFiles, loadImages }
})
