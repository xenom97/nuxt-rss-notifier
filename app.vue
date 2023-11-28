<script setup lang="ts">
import { IResponse } from './interfaces/api';
import { Status } from './interfaces/notifier';

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

const fetchRssData = async (
  isRefetch = false,
  notifierId?: number,
  skipNotif?: boolean
) => {
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

        if (!skipNotif) {
          showNotification(newData);
        }
      }
    }
  } catch (error: any) {
    alert(error?.message);
  } finally {
    formState.loading = false;
  }
};

const pauseNotif = (id: number) => {
  const idx = notifiers.value.findIndex((item) => item.id === id);
  clearInterval(notifiers.value[idx].intervalId);
  notifiers.value.splice(idx, 1, {
    ...notifiers.value[idx],
    status: Status.paused,
    intervalId: null,
  });
};

const playNotif = (id: number) => {
  const idx = notifiers.value.findIndex((item) => item.id === id);
  notifiers.value.splice(idx, 1, {
    ...notifiers.value[idx],
    status: Status.running,
    intervalId: setInterval(() => {
      fetchRssData(true, notifiers.value[idx].id);
    }, notifiers.value[idx].interval * 1000),
  });
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
  if ('Notification' in window) {
    if (Notification.permission === 'granted' && notifiers.value.length > 0) {
      const options = {
        body: notifyData.items
          .map((item: any) => '🚀 ' + item.title)
          .join('\n'),
        icon: 'https://cdn.icon-icons.com/icons2/2429/PNG/512/rss_logo_icon_147244.png',
      };

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(
          'RSS Notifier - ' + notifyData.title,
          options
        );
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted' && notifiers.value.length > 0) {
          showNotification(notifyData);
        }
      });
    }
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
      if (item.status === Status.running) {
        fetchRssData(true, item.id, true);
      }
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
    <NavBar />

    <main class="max-w-4xl mx-auto p-4 mb-8">
      <AddForm v-model:form-state="formState" @fetch-rss-data="fetchRssData" />

      <div v-if="notifiers.length" class="mt-10">
        <NotifierCard
          v-for="notifier in notifiers"
          :key="notifier.id"
          :notifier="notifier"
          @delete-notif="deleteNotif"
          @play-notif="playNotif"
          @pause-notif="pauseNotif"
        />
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
