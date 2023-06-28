<style>
  .v-navigation-drawer__content a { display: block;}
</style>
<template>
  <v-card>
    <v-layout>
      <!-- <v-system-bar color="deep-purple darken-3"></v-system-bar> -->

      <v-app-bar color="primary" prominent>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>Projects</v-toolbar-title>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" location="left">
        <v-select v-model="currentAgent" :items="agents" item-title="label" item-value="id">
        </v-select>
        <div v-for="registrtion in registrations">
          <h3>{{ registrtion.label }}</h3>
          <v-list>
            <v-list-item v-for="project in registrtion.projects" :key="project.id" :active="project.id === currentProject">
              <router-link :to="{ name: 'project', query: { ...route.query, project: project.id } }">
                {{ project.label}}
              </router-link>
            </v-list-item>
          </v-list>
        </div>

      </v-navigation-drawer>

      <v-main style="height: 100vh;">
        <router-view></router-view>
      </v-main>
    </v-layout>
  </v-card>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
const route = useRoute()
const router = useRouter()

const drawer = ref(true)

const currentAgent = ref(route.query.agent)
const currentProject = ref(route.query.project)

const registrations = computed(() => {
  return appStore.registrations.map(registration => ({
    ...registration,
    projects: appStore.projects.filter(project => project.registration === registration.id)
  }))
})

const appStore = useAppStore()
await appStore.loadAgents()
const agents = appStore.agents

watch(
  () => route.query.agent,
  agent => {
    currentAgent.value = agent
  }
)

watch(
  () => route.query.project,
  project => {
    currentProject.value = project
  }
)

watch(currentAgent, async selectedAgent => {
  if (currentAgent.value) {
    await appStore.loadProjects(currentAgent.value as string) // TODO
  }
  router.push({ name: 'dashboard', query: { agent: selectedAgent } })
}, { immediate: true })

</script>
