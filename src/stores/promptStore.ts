import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Prompt } from '@/db/database';
import * as db from '@/db/database';

export const usePromptStore = defineStore('prompts', () => {
  const prompts = ref<Prompt[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref('');
  const selectedCategory = ref<string>('All');

  const filteredPrompts = computed(() => {
    let result = prompts.value;

    if (selectedCategory.value !== 'All') {
      result = result.filter(p => p.category === selectedCategory.value);
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.tags.toLowerCase().includes(query)
      );
    }

    return result;
  });

  const categories = computed(() => {
    const cats = new Set(prompts.value.map(p => p.category));
    return ['All', ...Array.from(cats)];
  });

  async function loadPrompts() {
    loading.value = true;
    error.value = null;
    try {
      prompts.value = await db.getPrompts();
    } catch (e) {
      error.value = 'Failed to load prompts';
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  async function addPrompt(prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) {
    loading.value = true;
    error.value = null;
    try {
      const newPrompt = await db.createPrompt(prompt);
      prompts.value.unshift(newPrompt);
      return newPrompt;
    } catch (e) {
      error.value = 'Failed to create prompt';
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function editPrompt(id: number, updates: Partial<Prompt>) {
    error.value = null;
    try {
      await db.updatePrompt(id, updates);
      const index = prompts.value.findIndex(p => p.id === id);
      if (index !== -1) {
        prompts.value[index] = { ...prompts.value[index], ...updates, updatedAt: new Date().toISOString() };
      }
    } catch (e) {
      error.value = 'Failed to update prompt';
      console.error(e);
      throw e;
    }
  }

  async function removePrompt(id: number) {
    error.value = null;
    try {
      await db.deletePrompt(id);
      prompts.value = prompts.value.filter(p => p.id !== id);
    } catch (e) {
      error.value = 'Failed to delete prompt';
      console.error(e);
      throw e;
    }
  }

  async function toggleFavorite(id: number) {
    const prompt = prompts.value.find(p => p.id === id);
    if (prompt) {
      await editPrompt(id, { isFavorite: !prompt.isFavorite });
    }
  }

  async function loadCategories() {
    // Categories are computed from prompts
  }

  async function exportData(): Promise<Blob> {
    const data = await db.exportDatabase();
    return new Blob([data], { type: 'application/octet-stream' });
  }

  async function importData(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await db.importDatabase(uint8Array);
    await loadPrompts();
  }

  return {
    prompts,
    loading,
    error,
    searchQuery,
    selectedCategory,
    filteredPrompts,
    categories,
    loadPrompts,
    addPrompt,
    editPrompt,
    removePrompt,
    toggleFavorite,
    loadCategories,
    exportData,
    importData
  };
});
