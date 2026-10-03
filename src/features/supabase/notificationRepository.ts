import type {
  ActivityNotification,
  NotificationRepository,
} from '../notifications/activity';
import { accountAuthorization } from './accountAuthorization';
import type { PadelSupabaseClient } from './client';

export function createSupabaseNotificationRepository(
  client: PadelSupabaseClient,
  userId: string,
): NotificationRepository {
  return {
    list: async () => {
      const notifications: ActivityNotification[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await client
          .from('activity_notifications')
          .select('*')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .range(offset, offset + 999);
        if (error) throw error;
        for (const row of data ?? []) {
          notifications.push({
            id: row.id,
            kind: row.kind,
            title: row.title,
            message: row.message,
            createdAt: row.created_at,
            readAt: row.read_at,
            target:
              row.kind === 'invitation' && row.invitation_id
                ? {
                    type: 'invitation',
                    invitationId: row.invitation_id,
                    gameId: row.game_id,
                  }
                : { type: 'game', gameId: row.game_id },
          });
        }
        if (!data || data.length < 1000) return notifications;
      }
    },
    markRead: async (id) => {
      const authorization = await accountAuthorization(client, userId);
      const { data, error } = await client
        .rpc('mark_activity_notification_read', { notification_id: id })
        .setHeader('Authorization', authorization);
      if (error) throw error;
      if (data !== true)
        throw new Error('This notification is no longer available.');
    },
  };
}
