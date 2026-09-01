<script setup lang="ts">
import { usePromptStore } from '@/stores/promptStore';
import PromptCard from '@/components/PromptCard.vue';
import { Star, ArrowLeft } from 'lucide-vue-next';
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const store = usePromptStore();
const router = useRouter();

onMounted(() => {
  store.loadPrompts();
});

const favoritePrompts = computed(() => {
  return store.prompts.filter(p => p.isFavorite);
});

function goBack() {
  router.push('/');
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft :size="24" />
          </button>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star class="text-yellow-500" :size="28" :fill="currentColor" />
            Favorite Prompts
          </h1>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Stats Bar -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <p class="text-sm text-gray-600">
          Showing <span class="font-semibold">{{ favoritePrompts.length }}</span> favorite prompt(s)
        </p>
      </div>

      <!-- Empty State -->
      <div v-if="favoritePrompts.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
        <Star class="mx-auto text-gray-400 mb-4" :size="48" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
        <p class="text-gray-500 mb-4">
          Mark prompts as favorites to quickly access them here.
        </p>
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft :size="18" />
          Browse Prompts
        </button>
      </div>

      <!-- Prompts Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PromptCard
          v-for="prompt in favoritePrompts"
          :key="prompt.id"
          :prompt="prompt"
          @toggle-favorite="store.toggleFavorite"
          @edit="(p) => router.push('/')"
          @delete="(id) => store.removePrompt(id)"
        />
      </div>
    </div>
  </div>
</template>
