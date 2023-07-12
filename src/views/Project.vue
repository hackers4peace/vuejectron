<template>
    <h2>{{ project?.label }}</h2>
    <h3>Tasks</h3>
    <v-list>
      <v-list-item v-for="task in appStore.tasks" :key="task.id">
        <task-card :task="task" @update="updateTask" @delete="deleteTask"></task-card>
      </v-list-item>
    </v-list>
    <h3>Files</h3>
    <a ref="download" style="visibility: hidden;"></a>
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
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { computedAsync } from '@vueuse/core'

  import { useAppStore } from '@/store/app';
  import { useSai } from '@/sai'
  import { useCoreStore } from '@/store/core';
  import { FileInstance, Task } from '@/models';

  import TaskCard from '@/components/TaskCard.vue';

  const download = ref<HTMLAnchorElement>()

  const coreSotre = useCoreStore()
  const sai = useSai(coreSotre.userId)

  const route = useRoute()
  const projectId = ref(route.query.project)

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

  function updateTask(task: Task) {
    appStore.updateTask(task)
  }

  function deleteTask(task: Task) {
    if (confirm('Are you sure to delete')) {
      appStore.deleteTask(task)
    }
  }
</script>
