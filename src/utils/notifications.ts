import { ref } from 'vue';

export interface NotificationItem {
  id: number;
  message: string;
  timestamp: number;
  action?: string;
  actionCallback?: (() => void) | null;
}

const MAX_HISTORY = 50;
const DISPLAY_DURATION = 3000;

export const notifications = ref<NotificationItem[]>([]);
export const activeNotification = ref<NotificationItem | null>(null);

let nextId = 1;
let displayTimer: ReturnType<typeof setTimeout> | null = null;
const queue: NotificationItem[] = [];

const showNext = () => {
  if (queue.length === 0) {
    activeNotification.value = null;
    return;
  }
  const item = queue.shift()!;
  activeNotification.value = item;
  displayTimer = setTimeout(() => {
    displayTimer = null;
    showNext();
  }, DISPLAY_DURATION);
};

export const pushNotification = (message: string, action?: string, actionCallback?: () => void) => {
  const item: NotificationItem = {
    id: nextId++,
    message,
    timestamp: Date.now(),
    action: action || undefined,
    actionCallback: actionCallback || null,
  };

  notifications.value.unshift(item);
  if (notifications.value.length > MAX_HISTORY) {
    notifications.value = notifications.value.slice(0, MAX_HISTORY);
  }

  queue.push(item);
  if (activeNotification.value === null) {
    showNext();
  }
};

export const dismissActiveNotification = () => {
  if (displayTimer !== null) {
    clearTimeout(displayTimer);
    displayTimer = null;
  }
  showNext();
};

export const executeNotificationAction = (item: NotificationItem) => {
  if (item.actionCallback) {
    item.actionCallback();
  }
};