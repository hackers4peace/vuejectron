<template>
  <v-card>
    <template v-if="!editing">
      <v-card-title>{{ task.label }}</v-card-title>
      <v-card-actions>
        <v-btn v-if="task.canUpdate" @click="editing = true" size="small" color="surface-variant" variant="text" icon="mdi-square-edit-outline"></v-btn>
        <v-btn v-if="task.canDelete" @click="deleteTask" size="small" color="surface-variant" variant="text" icon="mdi-delete-outline"></v-btn>
      </v-card-actions>
    </template>
    <template v-else>
      <v-card-title>
        <v-text-field v-model="label" required>
        </v-text-field>
      </v-card-title>
      <v-card-actions>
        <v-btn size="small" @click="updateTask" color="surface-variant" variant="text" icon="mdi-check"></v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
import { Task } from '@/models';
import { ref } from 'vue';

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{
  update: [task: Task]
  delete: [task: Task]
}>()

const editing = ref(false)
const label = ref(props.task.label)

function updateTask() {
  editing.value = false;
  emit('update', {...props.task, label: label.value})
}

function deleteTask() {
  emit('delete', {...props.task})
}

</script>
