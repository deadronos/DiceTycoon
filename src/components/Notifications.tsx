import React from 'react';

type Note = { id: number; message: string };

type NotificationsProps = {
  notifications: Note[];
  onDismiss: (id: number) => void;
};

export default function Notifications({ notifications, onDismiss }: NotificationsProps) {
  return (
    <div className="dt-notifications" aria-live="polite">
      {notifications.map(n => (
        <div key={n.id} className="dt-notification" role="status">
          <div className="dt-notification-message">{n.message}</div>
          <button className="dt-notification-dismiss" aria-label="dismiss" onClick={() => onDismiss(n.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
