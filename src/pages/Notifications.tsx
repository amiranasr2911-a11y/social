import { useState, useEffect } from "react";
import { Check, MessageCircle, Heart, UserPlus, Share2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notificationsApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const notificationIcon = (type: string) => {
  switch (type) {
    case "like_post": return <Heart size={14} className="text-destructive fill-destructive" />;
    case "comment_post": return <MessageCircle size={14} className="text-primary" />;
    case "follow": return <UserPlus size={14} className="text-primary" />;
    case "share_post": return <Share2 size={14} className="text-orange-500" />;
    default: return <MessageCircle size={14} className="text-primary" />;
  }
};

const notificationLabel = (type: string) => {
  switch (type) {
    case "like_post": return "liked your post";
    case "comment_post": return "commented on your post";
    case "follow": return "started following you";
    case "share_post": return "shared your post";
    default: return "sent you a notification";
  }
};

const Notifications = () => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter]);

  const fetchNotifications = async (currentFilter: "all" | "unread") => {
    setLoading(true);
    try {
      // If unread, pass true, else pass undefined to get all notifications
      const unreadParam = currentFilter === "unread" ? true : undefined;
      const data = await notificationsApi.getAll(1, 20, unreadParam);
      const notifs = data?.notifications || (Array.isArray(data) ? data : []);
      setNotifications(notifs);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const filtered = filter === "unread"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium border border-border rounded-full px-4 py-2 hover:bg-accent transition-colors"
        >
          <Check size={16} />
          Mark all as read
        </button>
      </div>
      <p className="text-muted-foreground mb-6">
        Realtime updates for likes, comments, shares, and follows.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            filter === "unread"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold ${
              filter === "unread" ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
            }`}>
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="bg-card rounded-2xl shadow-card p-12 text-center">
          <Loader2 className="animate-spin mx-auto text-primary" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-card p-12 text-center">
          <p className="text-muted-foreground">
            {filter === "unread" ? "No unread notifications." : "No notifications yet."}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-card divide-y">
          {filtered.map((n) => {
            const actor = n.actor || {};
            const initials = actor.name?.charAt(0)?.toUpperCase() || "?";
            return (
              <div
                key={n._id}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  !n.isRead ? "bg-accent/40" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={actor.photo || ""} />
                    <AvatarFallback className="bg-muted text-muted-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-card shadow flex items-center justify-center">
                    {notificationIcon(n.type)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{actor.name || "Someone"}</span>{" "}
                    {notificationLabel(n.type)}
                  </p>
                  {n.entity?.body && (
                    <p className="text-sm text-foreground mt-1">{n.entity.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline font-medium border border-primary/30 rounded-full px-3 py-1"
                      >
                        <Check size={12} />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {n.createdAt
                      ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: false })
                      : ""}
                  </span>
                  {!n.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;