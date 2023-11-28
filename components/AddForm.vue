<script setup lang="ts">
const props = defineProps({
  formState: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['fetch-rss-data', 'update:form-state']);

const state = computed({
  get: () => props.formState,
  set: (value) => emit('update:form-state', value),
});
</script>

<template>
  <form @submit.prevent="$emit('fetch-rss-data', false)">
    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">RSS URL to Notify</span>
      </label>
      <input
        v-model="state.url"
        type="text"
        placeholder="e.g. https://example.com/rss"
        class="input input-bordered w-full"
        required
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Notification Title</span>
        </label>
        <input
          v-model="state.title"
          type="text"
          placeholder="e.g. New Post"
          class="input input-bordered w-full"
          required
        />
      </div>

      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Checker Interval (second)</span>
        </label>
        <input
          v-model="state.interval"
          type="number"
          placeholder="e.g. 60"
          class="input input-bordered w-full"
          required
        />
      </div>
    </div>

    <button
      type="submit"
      class="btn btn-primary w-full mt-6 text-white"
      :class="{ 'btn-disabled': state.loading }"
      :disabled="state.loading"
    >
      <template v-if="state.loading">
        <span class="loading loading-spinner"></span>
        Loading
      </template>
      <span v-else>Add Notifier</span>
    </button>
  </form>
</template>
