export type ActivityKind =
  | 'invitation'
  | 'game_confirmed'
  | 'player_joined'
  | 'spot_remaining'
  | 'game_updated'
  | 'result_added'
  | 'cancelled';
export type ActivityNotification = Readonly<{
  id: string;
  kind: ActivityKind;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  target:
    | Readonly<{ type: 'invitation'; invitationId: string; gameId: string }>
    | Readonly<{ type: 'game'; gameId: string }>;
}>;
export type NotificationRepository = Readonly<{
  list: () => Promise<readonly ActivityNotification[]>;
  markRead: (id: string) => Promise<void>;
}>;
