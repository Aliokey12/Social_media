import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { databases } from "@/lib/appwrite/config";
import { Query } from "appwrite";

interface Notification {
  $id: string;
  userId: string;
  type: 'like' | 'follow' | 'comment';
  sourceUserId: string;
  sourceUserName: string;
  sourceUserImage: string;
  postId?: string;
  postId2?: string;
  createdAt: string;
  isRead: boolean;
}

const NotificationsPopover = ({ onClose }: { onClose: () => void }) => {
  const { user } = useUserContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const markAllAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;

    try {
      const unreadNotifications = notifications.filter(notification => !notification.isRead);
      
      if (unreadNotifications.length === 0) return;

      await Promise.all(
        unreadNotifications.map(notification => 
          databases.updateDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
            notification.$id,
            { isRead: true }
          )
        )
      );

      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({
          ...notification,
          isRead: true
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;

      try {
        const response = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
          [
            Query.equal('userId', user.id),
            Query.orderDesc('$createdAt'),
            Query.limit(10)
          ]
        );

        setNotifications(response.documents as unknown as Notification[]);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    if (!loading && notifications.length > 0) {
      markAllAsRead();
    }
  }, [loading, notifications.length]);

  const markAsRead = async (notificationId: string) => {
    try {
      await databases.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
        notificationId,
        {
          isRead: true
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'gönderini beğendi';
      case 'follow':
        return 'seni takip etmeye başladı';
      case 'comment':
        return 'gönderine yorum yaptı';
      default:
        return '';
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        return `/profile/${notification.sourceUserId}`;
      case 'like':
      case 'comment':
        return `/posts/${notification.postId2}`;
      default:
        return '/';
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-dark-2 rounded-lg shadow-lg border border-glassBorder overflow-hidden">
      <div className="p-4">
        <h3 className="text-light-1 font-semibold mb-4">Bildirimler</h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-light-3 text-center py-4">Henüz bildirim yok</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Link
                key={notification.$id}
                to={getNotificationLink(notification)}
                className={`block p-3 rounded-lg transition-all duration-300 ${
                  notification.isRead ? 'bg-dark-3/40' : 'bg-dark-4/60'
                } hover:bg-dark-4`}
                onClick={() => {
                  onClose();
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={notification.sourceUserImage || "/assets/icons/profile-placeholder.svg"}
                    alt="user"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-light-1">
                      <span className="font-semibold">{notification.sourceUserName}</span>{' '}
                      {getNotificationText(notification)}
                    </p>
                    <p className="text-light-3 text-sm">
                      {new Date(notification.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPopover; 