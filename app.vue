<script setup lang="ts">
import { IResponse } from './interfaces/api';

useHead({
  title: 'RSS Notifier',
  meta: [
    {
      name: 'description',
      content:
        'Explore the convenience of our RSS Notifier application – a powerful RSS reader that keeps you effortlessly informed. Receive timely notifications at your preferred intervals, ensuring you stay up-to-date with the latest content that matters to you. Stay connected, stay informed with RSS Notifier.',
    },
  ],
});

const NOTIFIERS_KEY = 'rss-notifiers';

const formState = reactive({
  url: '',
  title: '',
  interval: null,
  loading: false,
});

const notifiers = ref<any[]>([]);

const theme = ref<'dark' | 'light'>('light');

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
};

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
      body: notifyData.items.map((item: any) => '🚀 ' + item.title).join('\n'),
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
  <div class="relative">
    <Html :data-theme="theme"></Html>

    <nav class="navbar bg-base-100 drop-shadow-md sticky top-0 z-10">
      <div class="max-w-4xl mx-auto w-full">
        <div class="flex-1">
          <a class="btn btn-ghost text-xl">RSS Notifier</a>
        </div>

        <label class="swap swap-rotate">
          <input type="checkbox" @change="toggleTheme" />
          <!-- sun icon -->
          <svg
            class="swap-on fill-current w-10 h-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
            />
          </svg>

          <!-- moon icon -->
          <svg
            class="swap-off fill-current w-8 h-8"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
            />
          </svg>
        </label>
      </div>
    </nav>

    <main class="max-w-4xl mx-auto p-4 mb-8">
      <form @submit.prevent="fetchRssData(false)">
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
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

            <h2 class="card-title">
              {{ notifier.title }}
            </h2>

            <div class="text-sm">
              Top 3 items
              <span class="text-primary">
                - Interval: {{ notifier.interval }}s
              </span>
            </div>

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

    <footer
      class="text-center text-sm mt-20 fixed bottom-0 left-0 right-0 bg-base-100 p-4 drop-shadow z-10"
    >
      Created by
      <a
        href="https://github.com/xenom97"
        target="_blank"
        class="link link-info"
      >
        Ahmad Purnomo
      </a>
    </footer>
  </div>
</template>

<style>
.notifier-content {
  a {
    @apply btn btn-accent mt-3 w-full capitalize;
  }
}
</style>
