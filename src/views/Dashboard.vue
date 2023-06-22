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
          v-model="user"
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
import { useAppStore } from '@/store/app';
import { useCoreStore } from '@/store/core';
import { ref } from 'vue';
const appStore = useAppStore()
const coreStore = useCoreStore()

const drawer = ref(true)

const items = ['a', 'b', 'c']
await appStore.loadAgents()
const agents = appStore.agents
const user = agents.find(({id}) => id === coreStore.userId)
</script>
