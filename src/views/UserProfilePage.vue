<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 pt-24 pb-12">
    <div class="container mx-auto px-4 max-w-4xl">
      <UserProfile :username="username" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UserProfile from '../components/UserProfile.vue'

const route = useRoute()
const username = computed(() => route.params.username as string)
</script>
