<template>
  {{ store.userId }}
</template>

<script lang="ts" setup>
import { useCoreStore } from '@/store/core';
const store = useCoreStore()
</script>
