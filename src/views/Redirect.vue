<template>
</template>

<script lang="ts" setup>
  import { useCoreStore } from '@/store/core';
  import { useRouter } from 'vue-router';
  const store = useCoreStore()
  const router = useRouter()
  await store.handleRedirect(window.location.href)
  router.push({ name: 'dashboard' })
</script>
