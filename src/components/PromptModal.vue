<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { Prompt } from '@/db/database';

const props = defineProps<{
  isOpen: boolean;
  prompt?: Prompt | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): void;
}>();

const title = ref('');
const content = ref('');
const category = ref('General');
const tags = ref('');
const isFavorite = ref(false);
const errors = ref<Record<string, string>>({});

watch(() => props.prompt, (prompt) => {
  if (prompt) {
    title.value = prompt.title;
    content.value = prompt.content;
    category.value = prompt.category;
    tags.value = prompt.tags;
    isFavorite.value = prompt.isFavorite;
  } else {
    resetForm();
  }
}, { immediate: true });

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !props.prompt) {
    resetForm();
  }
});

function resetForm() {
  title.value = '';
  content.value = '';
  category.value = 'General';
  tags.value = '';
  isFavorite.value = false;
  errors.value = {};
}

function validate(): boolean {
  errors.value = {};
  
  if (!title.value.trim()) {
    errors.value.title = 'Title is required';
  }
  
  if (!content.value.trim()) {
    errors.value.content = 'Content is required';
  }
  
  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (!validate()) {
    return;
  }
  
  emit('save', {
    title: title.value.trim(),
    content: content.value.trim(),
    category: category.value.trim() || 'General',
    tags: tags.value.trim(),
    isFavorite: isFavorite.value
  });
  
  emit('close');
  resetForm();
}

function handleClose() {
  emit('close');
  resetForm();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <div 
            class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
            @click="handleClose"
          ></div>

          <div class="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900">
                {{ prompt ? 'Edit Prompt' : 'New Prompt' }}
              </h3>
              <button 
                @click="handleClose"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X :size="24" />
              </button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  v-model="title"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter prompt title"
                />
                <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  id="category"
                  v-model="category"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Coding, Writing, Analysis"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  <option value="General" />
                  <option value="Coding" />
                  <option value="Writing" />
                  <option value="Analysis" />
                  <option value="Creative" />
                  <option value="Business" />
                </datalist>
              </div>

              <div>
                <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  id="content"
                  v-model="content"
                  rows="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter your prompt content..."
                ></textarea>
                <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
              </div>

              <div>
                <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  v-model="tags"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., python, api, automation"
                />
              </div>

              <div class="flex items-center">
                <input
                  id="isFavorite"
                  v-model="isFavorite"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label for="isFavorite" class="ml-2 text-sm text-gray-700">
                  Mark as Favorite
                </label>
              </div>

              <div class="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  @click="handleClose"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {{ prompt ? 'Save Changes' : 'Create Prompt' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .inline-block,
.modal-leave-active .inline-block {
  transition: all 0.3s ease;
}

.modal-enter-from .inline-block,
.modal-leave-to .inline-block {
  opacity: 0;
  transform: scale(0.95);
}
</style>
