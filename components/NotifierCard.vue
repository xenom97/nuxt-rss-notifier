<script lang="ts" setup>
import { Status } from '@/interfaces/notifier';

defineProps({
  notifier: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(['delete-notif', 'play-notif', 'pause-notif']);
</script>

<template>
  <div class="card shadow-md border border-base-300 mb-3">
    <div class="card-body relative">
      <div class="card-actions justify-end absolute top-4 right-4">
        <button
          class="btn btn-info btn-outline text-white btn-sm"
          @click="
            () => {
              notifier.status === Status.paused
                ? $emit('play-notif', notifier.id)
                : $emit('pause-notif', notifier.id);
            }
          "
        >
          <svg
            v-if="notifier.status === Status.paused"
            width="24"
            height="24"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.79062 2.09314C4.63821 1.98427 4.43774 1.96972 4.27121 2.05542C4.10467 2.14112 4 2.31271 4 2.5V12.5C4 12.6873 4.10467 12.8589 4.27121 12.9446C4.43774 13.0303 4.63821 13.0157 4.79062 12.9069L11.7906 7.90687C11.922 7.81301 12 7.66148 12 7.5C12 7.33853 11.922 7.18699 11.7906 7.09314L4.79062 2.09314Z"
              fill="currentColor"
            />
          </svg>

          <svg
            v-else
            id="pause"
            fill="none"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            data-name="Flat Color"
            xmlns="http://www.w3.org/2000/svg"
            class="icon flat-color"
          >
            <path
              id="primary"
              d="M19,4V20a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h2A2,2,0,0,1,19,4ZM9,2H7A2,2,0,0,0,5,4V20a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V4A2,2,0,0,0,9,2Z"
              fill="currentColor"
            ></path>
          </svg>
        </button>

        <button
          class="btn btn-error text-white btn-sm"
          @click="$emit('delete-notif', notifier.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <h2 class="card-title">
        {{ notifier.title }} <span class="text-sm">(Top 3 items)</span>
      </h2>

      <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
        <span class="badge badge-outline text-xs">
          Interval: {{ notifier.interval }}s
        </span>
        <span> Last updated: {{ notifier.lastUpdated || '-' }} </span>
      </div>

      <div
        v-for="(item, idx) in notifier.items"
        :key="idx"
        class="collapse collapse-arrow bg-base-200"
      >
        <input type="checkbox" />
        <div class="collapse-title text-base font-medium">
          {{ item.title }}
        </div>
        <div
          class="collapse-content text-sm"
          style="overflow-wrap: anywhere"
          v-html="item.content"
        />
      </div>
    </div>
  </div>
</template>

<style>
.collapse-content {
  a {
    @apply link link-accent text-lg font-bold leading-10 w-full capitalize;
  }
}
</style>
