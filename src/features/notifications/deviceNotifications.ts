import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { createReminderReconciler, type ReminderScheduler } from './reminders';

export const supportsDeviceReminders =
  Platform.OS === 'ios' || Platform.OS === 'android';

const scheduler: ReminderScheduler = {
  list: async () =>
    (await Notifications.getAllScheduledNotificationsAsync()).map(
      (request) => ({
        id: request.identifier,
        at:
          typeof request.content.data?.reminderAt === 'number'
            ? request.content.data.reminderAt
            : null,
      }),
    ),
  cancel: Notifications.cancelScheduledNotificationAsync,
  schedule: async (reminder) => {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: reminder.title,
        body: reminder.body,
        data: {
          kind: 'gameReminder',
          reminderAt: reminder.at,
          userId: reminder.userId,
          gameId: reminder.gameId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(reminder.at),
        channelId: 'games',
      },
    });
  },
};

export const reconcileDeviceReminders = createReminderReconciler(scheduler);

function permissionGranted(
  permission: Notifications.NotificationPermissionsStatus,
) {
  return (
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function canShowReminders() {
  return (
    supportsDeviceReminders &&
    permissionGranted(await Notifications.getPermissionsAsync())
  );
}

export async function requestReminderPermission() {
  if (!supportsDeviceReminders) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('games', {
      name: 'Game reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return permissionGranted(await Notifications.requestPermissionsAsync());
}
