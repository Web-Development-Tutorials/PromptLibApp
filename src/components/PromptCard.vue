<script setup lang="ts">
import { ref, computed } from 'vue';
import { Star, Copy, Check, Trash2, Edit3 } from 'lucide-vue-next';
import type { Prompt } from '@/db/database';

const props = defineProps<{
  prompt: Prompt;
}>();

const emit = defineEmits<{
  (e: 'edit', prompt: Prompt): void;
  (e: 'delete', id: number): void;
  (e: 'toggle-favorite', id: number): void;
}>();

const copied = ref(false);

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.prompt.content);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

function handleToggleFavorite() {
  emit('toggle-favorite', props.prompt.id);
}

function handleEdit() {
  emit('edit', props.prompt);
}

function handleDelete() {
  if (confirm('Are you sure you want to delete this prompt?')) {
    emit('delete', props.prompt.id);
  }
}

const tags = computed(() => {
  if (!props.prompt.tags) return [];
  return props.prompt.tags.split(',').map(t => t.trim()).filter(t => t);
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-semibold text-lg text-gray-900">{{ prompt.title }}</h3>
          <button 
            @click="handleToggleFavorite"
            :class="['transition-colors', prompt.isFavorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500']"
          >
            <Star :size="20" :fill="prompt.isFavorite ? 'currentColor' : 'none'" />
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
            {{ prompt.category }}
          </span>
          <span v-if="tags.length > 0" class="text-gray-400">•</span>
          <div v-if="tags.length > 0" class="flex gap-1">
            <span 
              v-for="tag in tags" 
              :key="tag"
              class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 rounded-md p-3 mb-3">
      <p class="text-gray-700 text-sm line-clamp-3 whitespace-pre-wrap">{{ prompt.content }}</p>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
      <span>Updated: {{ new Date(prompt.updatedAt).toLocaleDateString() }}</span>
    </div>

    <div class="flex items-center gap-2">
      <button
        @click="copyToClipboard"
        class="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
      >
        <component :is="copied ? Check : Copy" :size="16" />
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
      <button
        @click="handleEdit"
        class="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm"
      >
        <Edit3 :size="16" />
        Edit
      </button>
      <button
        @click="handleDelete"
        class="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm"
      >
        <Trash2 :size="16" />
        Delete
      </button>
    </div>
  </div>
</template>
