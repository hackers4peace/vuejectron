<template>
  <v-card>
    <v-card-item>
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="oidcIssuer" :placeholder="defaultOidcIssuer" label="OIDC issuer"></v-text-field>
        <v-btn type="submit" block class="mt-2">Login</v-btn>
      </v-form>
    </v-card-item>
  </v-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useCoreStore } from '@/store/core';
  const defaultOidcIssuer = import.meta.env.VITE_DEFAULT_OIDC_ISSUER
  const oidcIssuer = ref('')

  async function onSubmit() {
    const store = useCoreStore()
    store.login(oidcIssuer.value || defaultOidcIssuer)
  }
</script>
