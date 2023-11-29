<script setup lang="ts">
import { INotifier, Status } from '~/interfaces/notifier.interface';
import { IPayloadFetchRss } from '~/interfaces/api.interface';
import { LOCAL_STORAGE_RSS_KEY } from '~/constants/key.constant';
import { dateFormatter } from '~/utils/date.util';
import { getBaseUrl, getDomainName } from '~/utils/url.util';

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

const formState = reactive({
  url: '',
  title: '',
  interval: null,
  loading: false,
});

const notifiers = ref<INotifier[]>([]);

const fetchRssData = async (
  isRefetch = false,
  notifierId?: number,
  skipNotif?: boolean
) => {
  if (!isRefetch) {
    formState.loading = true;
  }

  try {
    let body: IPayloadFetchRss = {
      url: formState.url,
      title: formState.title,
      interval: formState.interval!,
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
      const resData = (res.data || {}) as INotifier;

      if (!isRefetch) {
        const newData: INotifier = {
          ...resData,
          items: resData.items.slice(0, 3),
          intervalId: setInterval(() => {
            fetchRssData(true, newData.id);
          }, resData.interval * 1000),
          lastUpdated: dateFormatter(new Date()),
        };
        notifiers.value = [...notifiers.value, newData];

        resetForm();

        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          });
        }, 300);
      } else {
        const newData = {
          ...currentNotifierData,
          ...resData,
          intervalId:
            currentNotifierData.intervalId ||
            setInterval(() => {
              fetchRssData(true, newData.id);
            }, currentNotifierData.interval * 1000),
          items: resData.items.slice(0, 3),
          lastUpdated: dateFormatter(new Date()),
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

const resetForm = () => {
  formState.url = '';
  formState.title = '';
  formState.interval = null;
};

const pauseNotif = (id: number) => {
  const idx = notifiers.value.findIndex((item) => item.id === id);
  clearInterval(notifiers.value[idx].intervalId!);
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
  clearInterval(notifiers.value[idx].intervalId!);
  notifiers.value.splice(idx, 1);
};

watch(
  notifiers,
  (val) => {
    localStorage.setItem(LOCAL_STORAGE_RSS_KEY, JSON.stringify(val));
  },
  { deep: true }
);

const showNotification = (notifyData: INotifier) => {
  if ('Notification' in window) {
    if (Notification.permission === 'granted' && notifiers.value.length > 0) {
      const options = {
        body: notifyData.items.map((item) => `🚀  ${item.title}`).join('\n'),
        icon: '/images/rss-logo.png',
        data: { link: getBaseUrl(notifyData.rss) },
        actions: [
          { action: 'rss-notifier', title: 'RSS Notifier' },
          { action: 'custom', title: getDomainName(notifyData.rss) },
        ],
      };

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(
          `RSS Notifier - ${notifyData.title}`,
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
    clearInterval(item.intervalId!);
    item.intervalId = null;
  });
};

onMounted(() => {
  const notifiersData = localStorage.getItem(LOCAL_STORAGE_RSS_KEY);
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
