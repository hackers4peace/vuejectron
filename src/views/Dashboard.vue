<template>
  <v-card>
    <v-layout>
      <!-- <v-system-bar color="deep-purple darken-3"></v-system-bar> -->

      <v-app-bar color="primary" prominent>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>Projects</v-toolbar-title>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" location="left">
        <v-select
          v-model="currentAgent"
          :items="agents"
          item-title="label"
          item-value="id"
        >
        </v-select>
        <!-- <v-list :items="items"></v-list> -->
      </v-navigation-drawer>

      <v-main style="height: 500px;">
        <v-card-text>
          The navigation drawer will appear from the bottom on smaller size screens.
        </v-card-text>
      </v-main>
    </v-layout>
  </v-card>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';

const route = useRoute()
const router = useRouter()

const appStore = useAppStore()

const drawer = ref(true)

const items = ['a', 'b', 'c']
await appStore.loadAgents()
const agents = appStore.agents

const currentAgent = ref(route.query.agent)

watch(
  () => route.query.agent,
  agent => {
    currentAgent.value = agent
  }
)

watch(currentAgent, selectedAgent => {
  router.push({name: 'dashboard', query: {agent: selectedAgent}})
})

</script>
