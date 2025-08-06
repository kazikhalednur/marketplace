"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";
import { Bell, Info, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { getRelativeTime } from "@/utils/time";
import { useNotificationContext } from "@/components/NotificationWebSocketProvider";
import { useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from "@/features/api/notificationsApi";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Notification } from "@/services/notificationWebSocket";

type NotificationType = "info" | "success" | "warning" | "error";

// We'll map message_type from the API to our UI notification types
const mapMessageTypeToNotificationType = (messageType: string): NotificationType => {
  const lowerType = messageType.toLowerCase();
  if (lowerType.includes('success') || lowerType.includes('payment')) return 'success';
  if (lowerType.includes('error') || lowerType.includes('fail') || lowerType.includes('alert')) return 'error';
  if (lowerType.includes('warn') || lowerType.includes('maintenance')) return 'warning';
  return 'info';
};

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

export default function NotificationDropdown() {
  const { notifications, isLoading, refreshNotifications } = useNotificationContext();
  const [open, setOpen] = useState(false);
  // Ref to track if this is the first render
  const firstRender = useRef(true);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // When dropdown is opened, update firstRender flag
  useEffect(() => {
    if (open && notifications.length > 0) {
      firstRender.current = false;
    }
  }, [open, notifications.length]);

  // On first render, set firstRender to false if we have notifications
  useEffect(() => {
    if (firstRender.current && notifications.length > 0) {
      firstRender.current = false;
    }
  }, [notifications.length]);

  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsRead, { isLoading: isMarkingAllAsRead }] = useMarkAllNotificationsAsReadMutation();

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead().unwrap();
      refreshNotifications(); // Refresh to get updated notification states
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id).unwrap();
        refreshNotifications(); // Refresh to get updated notification states
      } catch (error) {
        console.error(`Failed to mark notification ${notification.id} as read:`, error);
      }
    }
    // Additional action when clicking on a notification (e.g., navigate to related content)
    alert(`Clicked notification: ${notification.message}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative p-1.5 hover:bg-accent/50 transition-colors" aria-label="Open notifications">
          <Icon icon={Bell} size={28} />
          {unreadCount > 0 && !open && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-background z-10 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-80 shadow-xl rounded-xl border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-gradient-to-r from-background to-muted/20">
          <span className="font-semibold text-lg flex items-center gap-3">
            Notifications
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20">
              {notifications.length}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead} 
              className="text-xs px-3 py-1.5 rounded-full h-8 whitespace-nowrap font-medium hover:bg-primary/5" 
              disabled={isMarkingAllAsRead || notifications.length === 0}
            >
              {isMarkingAllAsRead ? 'Marking...' : 'Mark all as read'}
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[400px] min-h-[120px] divide-y divide-border/50 bg-background">
          {(() => {
            if (isLoading) {
              return (
                <div className="p-10 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">Loading notifications...</p>
                </div>
              );
            } else if (notifications.length === 0) {
              return (
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <p className="text-base font-semibold text-muted-foreground mb-1">No notifications yet</p>
                  <p className="text-sm text-muted-foreground/70">We&apos;ll notify you when something important happens</p>
                </div>
              );
            } else {
              return notifications.map((n) => {
                // Map the message_type to our UI notification type
                const notificationType = mapMessageTypeToNotificationType(n.message_type);
                const IconComp = NOTIFICATION_ICONS[notificationType];
                const colorClass = NOTIFICATION_COLORS[notificationType];
                
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full flex items-start gap-4 px-5 py-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 hover:bg-accent/30 active:bg-accent/50 ${n.is_read ? "bg-transparent opacity-75" : "bg-primary/5"} cursor-pointer group`}
                    role="listitem"
                    tabIndex={0}
                    aria-label={n.message}
                  >
                    <span className={`flex items-center justify-center rounded-xl w-10 h-10 ${colorClass} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                      <Icon icon={IconComp} size={20} />
                    </span>
                    <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
                      <span className={`text-sm ${n.is_read ? "font-normal text-foreground/80" : "font-semibold text-foreground"} text-left break-words w-full leading-relaxed`}>{n.message}</span>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground/80 text-left font-medium">{getRelativeTime(n.created_at)}</span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-sm" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              });
            }
          })()}
        </div>
      </PopoverContent>
    </Popover>
  );
}