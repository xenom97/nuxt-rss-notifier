<script setup lang="ts">
import { IResponse } from './interfaces/api';

const NOTIFIERS_KEY = 'rss-notifiers';

const formState = reactive({
  url: '',
  title: '',
  interval: null,
  loading: false,
});

const notifiers = ref<any[]>([]);

const fetchRssData = async (isRefetch = false, notifierId?: number) => {
  if (!isRefetch) {
    formState.loading = true;
  }

  try {
    let body = {
      url: formState.url,
      title: formState.title,
      interval: formState.interval,
      id: null,
    };

    const currentNotifierIdx = notifiers.value.findIndex(
      (item) => item.id === notifierId
    );
    const currentNotifierData = notifiers.value[currentNotifierIdx];

    if (isRefetch) {
      body = {
        url: currentNotifierData.rss,
        title: currentNotifierData.title,
        interval: currentNotifierData.interval,
        id: currentNotifierData.id,
      };
    }

    const res = await $fetch('/api/rss', { method: 'POST', body });

    if (res.error) {
      alert(res.error);
    } else {
      const resData = (res as IResponse).data as IResponse['data'];

      if (!isRefetch) {
        const newData = {
          ...resData,
          items: resData.items.slice(0, 3),
          intervalId: setInterval(() => {
            fetchRssData(true, newData.id);
          }, resData.interval * 1000),
        };
        notifiers.value = [...notifiers.value, newData];

        formState.url = '';
        formState.title = '';
        formState.interval = null;
      } else {
        const newData = {
          ...currentNotifierData,
          intervalId:
            currentNotifierData.intervalId ||
            setInterval(() => {
              fetchRssData(true, newData.id);
            }, currentNotifierData.interval * 1000),
          items: resData.items.slice(0, 3),
        };
        notifiers.value.splice(currentNotifierIdx, 1, newData);
        showNotification(newData);
      }
    }
  } catch (error: any) {
    alert(error?.message);
  } finally {
    formState.loading = false;
  }
};

const deleteNotif = (id: number) => {
  const idx = notifiers.value.findIndex((item) => item.id === id);
  clearInterval(notifiers.value[idx].intervalId);
  notifiers.value.splice(idx, 1);
};

watch(
  notifiers,
  (val) => {
    localStorage.setItem(NOTIFIERS_KEY, JSON.stringify(val));
  },
  { deep: true }
);

const showNotification = (notifyData: any) => {
  if (Notification.permission === 'granted' && notifiers.value.length > 0) {
    const options = {
      body: notifyData.items.map((item: any) => '> ' + item.title).join('\n'),
    };
    const notification = new Notification(
      'RSS Notifier - ' + notifyData.title,
      options
    );
    notification.addEventListener('click', () => {
      window.open('https://www.upwork.com/', '_blank');
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted' && notifiers.value.length > 0) {
        showNotification(notifyData);
      }
    });
  }
};

const cleanUpInterval = () => {
  notifiers.value.forEach((item) => {
    clearInterval(item.intervalId);
    item.intervalId = null;
  });
};

onMounted(() => {
  const notifiersData = localStorage.getItem(NOTIFIERS_KEY);
  if (notifiersData) {
    const loadedData = JSON.parse(notifiersData);
    notifiers.value = loadedData;

    notifiers.value.forEach((item) => {
      fetchRssData(true, item.id);
    });
  }
  window.addEventListener('beforeunload', cleanUpInterval);
});

onBeforeUnmount(() => {
  cleanUpInterval();
  window.removeEventListener('beforeunload', cleanUpInterval);
});
</script>

<template>
  <main class="max-w-4xl mx-auto p-4">
    <h1 class="text-3xl font-bold uppercase text-center">RSS Notifier</h1>

    <form class="mt-10" @submit.prevent="fetchRssData(false)">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">RSS URL to Notify</span>
        </label>
        <input
          v-model="formState.url"
          type="text"
          placeholder="e.g. https://example.com/rss"
          class="input input-bordered w-full"
          required
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Notification Title</span>
          </label>
          <input
            v-model="formState.title"
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
            v-model="formState.interval"
            type="number"
            placeholder="e.g. 60"
            class="input input-bordered w-full"
            required
          />
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-full mt-6 text-white">
        <template v-if="formState.loading">
          <span class="loading loading-spinner"></span>
          Loading
        </template>
        <span v-else>Add Notifier</span>
      </button>
    </form>

    <div v-if="notifiers.length" class="mt-10">
      <div
        v-for="notifier in notifiers"
        :key="notifier.id"
        class="card shadow-xl border border-base-300 mb-3"
      >
        <div class="card-body relative">
          <div class="card-actions justify-end absolute top-4 right-4">
            <button
              class="btn btn-error text-white btn-sm"
              @click="deleteNotif(notifier.id)"
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

          <h2 class="card-title mb-4">
            {{ notifier.title }}
            <span class="text-primary text-sm">
              (Interval: {{ notifier.interval }}s)
            </span>
          </h2>

          <div
            v-for="(item, idx) in notifier.items"
            :key="idx"
            class="collapse collapse-arrow bg-base-200"
          >
            <input type="radio" name="list" />
            <div class="collapse-title text-xl font-medium">
              {{ item.title }}
            </div>
            <div class="collapse-content">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="notifier-content" v-html="item.content"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.notifier-content {
  a {
    @apply btn btn-accent mt-3 w-full capitalize;
  }
}
</style>
