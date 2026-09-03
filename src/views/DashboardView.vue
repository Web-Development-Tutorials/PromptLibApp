<script setup lang="ts">
import { usePromptStore } from '@/stores/promptStore';
import PromptCard from '@/components/PromptCard.vue';
import PromptModal from '@/components/PromptModal.vue';
import { Plus, Search, FolderOpen, Star, Download, Upload } from 'lucide-vue-next';
import { ref, onMounted, computed } from 'vue';
import type { Prompt } from '@/db/database';

const store = usePromptStore();
const showModal = ref(false);
const editingPrompt = ref<Prompt | null>(null);
const showFavoritesOnly = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  store.loadPrompts();
});

async function handleNewPrompt() {
  editingPrompt.value = null;
  showModal.value = true;
}

async function handleEditPrompt(prompt: Prompt) {
  editingPrompt.value = prompt;
  showModal.value = true;
}

async function handleSavePrompt(promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) {
  if (editingPrompt.value) {
    await store.editPrompt(editingPrompt.value.id, promptData);
  } else {
    await store.addPrompt(promptData);
  }
}

async function handleDeletePrompt(id: number) {
  await store.removePrompt(id);
}

async function handleToggleFavorite(id: number) {
  await store.toggleFavorite(id);
}

function handleCategorySelect(category: string) {
  if (category === 'All') {
    store.selectedCategory = 'All';
  } else {
    store.selectedCategory = category;
  }
  showFavoritesOnly.value = false;
}

function toggleFavoritesView() {
  showFavoritesOnly.value = !showFavoritesOnly.value;
  if (showFavoritesOnly.value) {
    store.selectedCategory = 'All';
  }
}

const displayedPrompts = computed(() => {
  if (showFavoritesOnly.value) {
    return store.prompts.filter(p => p.isFavorite);
  }
  return store.filteredPrompts;
});

async function handleExport() {
  const blob = await store.exportData();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prompt-library-backup-${new Date().toISOString().split('T')[0]}.db`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    try {
      await store.importData(file);
      alert('Database imported successfully!');
    } catch (err) {
      alert('Failed to import database');
      console.error(err);
    }
  }
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function triggerImport() {
  fileInput.value?.click();
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen class="text-blue-600" :size="28" />
            Prompt Library
          </h1>
          <div class="flex items-center gap-3">
            <button
              @click="handleExport"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              title="Export Database"
            >
              <Download :size="18" />
              <span class="hidden sm:inline">Export</span>
            </button>
            <button
              @click="triggerImport"
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              title="Import Database"
            >
              <Upload :size="18" />
              <span class="hidden sm:inline">Import</span>
            </button>
            <input
              ref="fileInput"
              type="file"
              accept=".db"
              class="hidden"
              @change="handleImport"
            />
            <button
              @click="handleNewPrompt"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus :size="18" />
              <span class="hidden sm:inline">New Prompt</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Sidebar -->
        <aside class="w-full md:w-64 flex-shrink-0">
          <div class="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <!-- Search -->
            <div class="relative mb-4">
              <Search 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                :size="18" 
              />
              <input
                v-model="store.searchQuery"
                type="text"
                placeholder="Search prompts..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Navigation -->
            <nav class="space-y-1">
              <button
                @click="toggleFavoritesView"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors',
                  showFavoritesOnly 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <Star :size="18" :fill="showFavoritesOnly ? 'currentColor' : 'none'" />
                Favorites
              </button>

              <div class="pt-4 pb-2">
                <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categories
                </h3>
              </div>

              <button
                v-for="category in store.categories"
                :key="category"
                @click="handleCategorySelect(category)"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors',
                  store.selectedCategory === category && !showFavoritesOnly
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                ]"
              >
                <FolderOpen :size="18" />
                {{ category }}
              </button>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1">
          <!-- Stats Bar -->
          <div class="bg-white rounded-lg shadow-md p-4 mb-6">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-600">
                Showing <span class="font-semibold">{{ displayedPrompts.length }}</span> of 
                <span class="font-semibold">{{ store.prompts.length }}</span> prompts
                <span v-if="store.selectedCategory !== 'All' || showFavoritesOnly">
                  ({{ showFavoritesOnly ? 'Favorites' : store.selectedCategory }})
                </span>
              </p>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="store.loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {{ store.error }}
          </div>

          <!-- Empty State -->
          <div v-else-if="displayedPrompts.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
            <FolderOpen class="mx-auto text-gray-400 mb-4" :size="48" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
            <p class="text-gray-500 mb-4">
              {{ store.prompts.length === 0 
                ? 'Get started by creating your first prompt!' 
                : 'Try adjusting your search or filter criteria.'
              }}
            </p>
            <button
              @click="handleNewPrompt"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus :size="18" />
              Create Prompt
            </button>
          </div>

          <!-- Prompts Grid -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PromptCard
              v-for="prompt in displayedPrompts"
              :key="prompt.id"
              :prompt="prompt"
              @edit="handleEditPrompt"
              @delete="handleDeletePrompt"
              @toggle-favorite="handleToggleFavorite"
            />
          </div>
        </main>
      </div>
    </div>

    <!-- Modal -->
    <PromptModal
      :is-open="showModal"
      :prompt="editingPrompt"
      @close="showModal = false"
      @save="handleSavePrompt"
    />
  </div>
</template>
