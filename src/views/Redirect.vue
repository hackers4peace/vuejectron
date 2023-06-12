<template>
    {{ store.userId }}
    <router-link :to="{name: 'dashboard'}">Go to Dashboard</router-link>
</template>

<script lang="ts" setup>
  import { useCoreStore } from '@/store/core';
  const store = useCoreStore()
  store.handleRedirect(window.location.href)
</script>
