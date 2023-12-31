<template>
    <h2>{{ project?.label }}</h2>
    <h3>
      Tasks
      <v-btn v-if="project?.canAddTasks" size="small" @click="newTask" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
    </h3>
    <v-list>
      <v-list-item v-for="task in appStore.tasks" :key="task.id">
        <v-card>
          <v-card-title>{{ task.label }}</v-card-title>
          <v-card-actions>
            <v-btn v-if="task.canUpdate" @click="editTask(task)" size="small" color="surface-variant" variant="text" icon="mdi-square-edit-outline"></v-btn>
            <v-btn v-if="task.canDelete" @click="deleteTask(task)" size="small" color="surface-variant" variant="text" icon="mdi-delete-outline"></v-btn>
          </v-card-actions>
        </v-card>
      </v-list-item>
    </v-list>
    <h3>
      Files
      <v-btn v-if="project?.canAddFiles" size="small" @click="upload?.click()" color="surface-variant" variant="text" icon="mdi-plus"></v-btn>
    </h3>
    <v-list>
      <v-list-item v-for="file in appStore.files" :key="file.id">
        {{ file.filename }}
        <v-btn icon="mdi-download" variant="plain" @click="downloadFile(file)"></v-btn>
      </v-list-item>
    </v-list>
    <h3>Images</h3>
    <v-list>
      <v-list-item v-for="(dataUrl, index) in imageUrls" :key="index">
        <img :src="dataUrl"/>
      </v-list-item>
    </v-list>
    <input-dialog :text="selectedTask?.label" :dialog="dialog" @cancel="dialog = false" @save="updateTask"></input-dialog>
    <a ref="download" style="visibility: hidden;"></a>
    <input
      ref="upload"
      @change="uploadFile($event)"
      type="file"
      style="visibility: hidden;">
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { computedAsync } from '@vueuse/core'

  import { useAppStore } from '@/store/app';
  import { useSai } from '@/sai'
  import { useCoreStore } from '@/store/core';
  import { FileInstance, Task } from '@/models';

  import InputDialog from '@/components/InputDialog.vue';

  const download = ref<HTMLAnchorElement>()
  const upload = ref<HTMLInputElement>()

  const coreSotre = useCoreStore()
  const sai = useSai(coreSotre.userId)

  const route = useRoute()
  const projectId = ref(route.query.project)
  const dialog = ref(false)

  const selectedTask = ref<Task | null>(null)


  const appStore = useAppStore()
  const project = computed(() => appStore.projects.find(p => p.id === projectId.value))
  const imageUrl = (id: string) => computed(async () => await sai.dataUrl(id))

  const imageUrls = computedAsync(async () => await Promise.all(appStore.images.map(image => sai.dataUrl(image.id))))

  watch(
    () => route.query.project,
    project => {
      projectId.value = project
      if (project) {
        appStore.loadTasks(project as string) //TODO
        appStore.loadFiles(project as string) //TODO
        appStore.loadImages(project as string) //TODO
      }
    }, {immediate: true}
  )

  async function downloadFile(file: FileInstance) {
    if (download.value) {
      download.value.download = file.filename ?? 'file'
      download.value.href = await sai.dataUrl(file.id)
      download.value.click()
    } else {
      console.log('download!')
    }
  }

  function updateTask(label: string) {
    if (selectedTask.value) {
      appStore.updateTask({...selectedTask.value, label})
      selectedTask.value = null
    } else {
      if (label && project.value) {
        const task = { id: 'DRAFT', label, project: project.value.id, owner: project.value.owner }
        appStore.updateTask(task)
      }
    }
    dialog.value = false
  }

  function deleteTask(task: Task) {
    if (confirm('Are you sure to delete')) {
      appStore.deleteTask(task)
    }
  }

  function newTask() {
    dialog.value = true
  }

  function editTask(task: Task) {
    selectedTask.value = task
    dialog.value = true
  }

  function uploadFile(event: Event) {
    const target = event.target as HTMLInputElement
    const blob = target.files?.item(0)
    if (blob && project.value) {
        const file = {id: 'DRAFT', project: project.value.id, owner: project.value.owner}
        console.log(appStore.updateFile)
        appStore.updateFile(file, blob)
    }
  }
</script>
