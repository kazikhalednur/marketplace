import { useState, useRef, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { Bell, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { getRelativeTime } from "@/utils/time";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  timestamp: string;
  read: boolean;
}

const NOTIFICATION_ICONS: Record<NotificationType, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  info: "bg-blue-100 text-blue-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
};

// Helper to generate a UTC ISO string for a time relative to now
function getRelativeUTCTimestamp({ seconds = 0, minutes = 0, hours = 0, days = 0 }) {
  const d = new Date();
  d.setUTCSeconds(d.getUTCSeconds() - seconds);
  d.setUTCMinutes(d.getUTCMinutes() - minutes);
  d.setUTCHours(d.getUTCHours() - hours);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "info",
    message: "Welcome to UniMarket!",
    timestamp: getRelativeUTCTimestamp({ seconds: 45 }), // 45 seconds ago
    read: false,
  },
  {
    id: 2,
    type: "success",
    message: "Your job post was approved.",
    timestamp: getRelativeUTCTimestamp({ minutes: 3 }), // 3 minutes ago
    read: false,
  },
  {
    id: 3,
    type: "warning",
    message: "Profile incomplete. Add more details.",
    timestamp: getRelativeUTCTimestamp({ hours: 2, minutes: 15 }), // 2 hours 15 min ago
    read: true,
  },
  {
    id: 4,
    type: "error",
    message: "Payment failed. Please try again.",
    timestamp: getRelativeUTCTimestamp({ hours: 6 }), // 6 hours ago
    read: true,
  },
  {
    id: 5,
    type: "info",
    message: "New message from John Doe.",
    timestamp: getRelativeUTCTimestamp({ hours: 23 }), // 23 hours ago
    read: false,
  },
  {
    id: 6,
    type: "success",
    message: "Bid accepted for project 'Redesign Website'.",
    timestamp: getRelativeUTCTimestamp({ days: 1, hours: 3 }), // 1 day 3 hours ago
    read: false,
  },
  {
    id: 7,
    type: "warning",
    message: "Your subscription will expire soon.",
    timestamp: getRelativeUTCTimestamp({ days: 2, hours: 4 }), // 2 days 4 hours ago
    read: true,
  },
  {
    id: 8,
    type: "error",
    message: "Document upload failed.",
    timestamp: getRelativeUTCTimestamp({ days: 4, hours: 5 }), // 4 days 5 hours ago
    read: true,
  },
  {
    id: 9,
    type: "info",
    message: "System maintenance scheduled for Sunday.",
    timestamp: getRelativeUTCTimestamp({ days: 6, hours: 6 }), // 6 days 6 hours ago
    read: false,
  },
  {
    id: 10,
    type: "success",
    message: "Profile verified successfully.",
    timestamp: getRelativeUTCTimestamp({ days: 7 }), // 7 days ago
    read: true,
  },
];

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);
  // Track the last seen notification ID
  const [lastSeenId, setLastSeenId] = useState<number | null>(null);
  // Ref to track if this is the first render
  const firstRender = useRef(true);

  // Find the latest notification ID
  const latestId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) : null;
  // Count notifications with ID greater than lastSeenId
  const newCount = lastSeenId === null ? notifications.length : notifications.filter(n => n.id > lastSeenId).length;

  // When dropdown is opened, update lastSeenId to latest notification
  useEffect(() => {
    if (open && notifications.length > 0) {
      setLastSeenId(latestId);
    }
  }, [open, latestId, notifications.length]);

  // On first render, set lastSeenId to latest notification (so badge doesn't show on initial load)
  useEffect(() => {
    if (firstRender.current && notifications.length > 0) {
      setLastSeenId(latestId);
      firstRender.current = false;
    }
  }, [latestId, notifications.length]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative p-1.5" aria-label="Open notifications">
          <Icon icon={Bell} size={28} />
          {newCount > 0 && !open && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-background z-10">
              {newCount > 9 ? '9+' : newCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-base flex items-center gap-2">
            Notifications
            <span className="ml-1 px-2 py-0.5 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {notifications.length}
            </span>
          </span>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs px-2 py-1">
            Mark all as read
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[350px] min-h-[100px] divide-y divide-border bg-background">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">No notifications</div>
          ) : (
            notifications.map((n) => {
              const IconComp = NOTIFICATION_ICONS[n.type];
              const colorClass = NOTIFICATION_COLORS[n.type];
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => alert(`Clicked notification: ${n.message}`)}
                  className={`w-full flex items-start gap-3 px-4 py-3 transition-colors focus:outline-none focus:bg-accent/40 hover:bg-accent/40 active:bg-accent/60 ${n.read ? "bg-transparent" : "bg-accent/30"} cursor-pointer`}
                  role="listitem"
                  tabIndex={0}
                  aria-label={n.message}
                >
                  <span className={`flex items-center justify-center rounded-full w-8 h-8 ${colorClass}`}>
                    <Icon icon={IconComp} size={20} />
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
                    <span className={`text-sm ${n.read ? "font-normal" : "font-semibold"} text-left break-words w-full leading-snug`}>{n.message}</span>
                    <span className="text-xs text-muted-foreground mt-1 text-left w-full">{getRelativeTime(n.timestamp)}</span>
                  </div>
                  {!n.read && <span className="mt-1 w-2 h-2 rounded-full bg-primary" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 