<template>
  <v-card-text>
    <h2>{{ task?.label }}</h2>
  </v-card-text>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAppStore } from '@/store/app';

  const route = useRoute()
  const taskId = ref(route.query.task)

  const appStore = useAppStore()
  const task = computed(() => appStore.tasks.find(p => p.id === taskId.value))

  watch(
    () => route.query.task,
    async task => {
      taskId.value = task
      if (task) {
        await appStore.loadTasks(task as string) //TODO
      }
    }
  )
</script>
