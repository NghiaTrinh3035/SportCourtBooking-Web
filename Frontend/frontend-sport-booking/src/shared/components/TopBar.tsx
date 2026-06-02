import { Bell, LogOut, Menu } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Notification, NotificationRealtimePayload } from '../../entities/notification/types';
import notificationService from '../../services/notificationService';
import notificationSocketService from '../../services/notificationSocketService';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../hooks/useAuth';
import Button from '../ui/Button';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

const TopBar = ({ onOpenMobileMenu }: TopBarProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isLoadingNoti, setIsLoadingNoti] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsLoadingNoti(true);
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoadingNoti(false);
    }
  }, [isAuthenticated]);

  const mergeIncomingNotification = useCallback((incoming: Notification) => {
    setNotifications((prev) => {
      const withoutIncoming = prev.filter((item) => item.id !== incoming.id);
      return [incoming, ...withoutIncoming];
    });
  }, []);

  const handleRealtimePayload = useCallback(
    (payload: NotificationRealtimePayload) => {
      setUnreadCount(payload.unreadCount);

      if (payload.type === 'NEW_NOTIFICATION' && payload.notification) {
        mergeIncomingNotification(payload.notification);
        setHasNewNotification(true);
        setTimeout(() => setHasNewNotification(false), 1000);
      }
    },
    [mergeIncomingNotification],
  );

  const loadInitialNotificationState = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const [count, list] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getMyNotifications(),
      ]);
      setUnreadCount(count);
      setNotifications(list);
    } catch {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsSocketConnected(false);
      setIsNotiOpen(false);
      setNotifications([]);
      setUnreadCount(0);
      notificationSocketService.disconnect();
      return;
    }

    void loadInitialNotificationState();

    const cleanupSocket = notificationSocketService.connect(handleRealtimePayload, setIsSocketConnected);

    return () => {
      setIsSocketConnected(false);
      cleanupSocket();
    };
  }, [handleRealtimePayload, isAuthenticated, loadInitialNotificationState]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const handleWindowFocus = () => {
      void fetchUnreadCount();
      if (isNotiOpen) {
        void fetchNotifications();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchNotifications, fetchUnreadCount, isAuthenticated, isNotiOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) {
        return;
      }
      if (!panelRef.current.contains(event.target as Node)) {
        setIsNotiOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadInList = useMemo(
    () => notifications.filter((item) => !(item.read ?? item.isRead ?? false)).length,
    [notifications],
  );

  const resolveNotificationPath = useCallback(
    (pathname: string) => {
      const normalizedPath = pathname.trim().replace(/\/+$/, '') || '/';

      if (normalizedPath === '/history') {
        return user?.role === 'STAFF' ? ROUTES.staffOperations : ROUTES.profile;
      }

      if (normalizedPath === '/owner/bookings' || normalizedPath === '/owner/revenue') {
        return user?.role === 'STAFF' ? ROUTES.staffOperations : ROUTES.ownerDashboard;
      }

      if (normalizedPath === '/owner/sports') {
        return user?.role === 'STAFF' ? ROUTES.staffOperations : ROUTES.ownerCourts;
      }

      if (user?.role === 'STAFF' && normalizedPath.startsWith('/owner/')) {
        return ROUTES.staffOperations;
      }

      return normalizedPath;
    },
    [user?.role],
  );

  const goToNotificationRedirect = (redirectUrl: string) => {
    const trimmedUrl = redirectUrl.trim();
    if (!trimmedUrl) {
      return;
    }

    try {
      const resolvedUrl = new URL(trimmedUrl, window.location.origin);

      if (resolvedUrl.origin === window.location.origin) {
        const mappedPath = resolveNotificationPath(resolvedUrl.pathname);
        navigate(`${mappedPath}${resolvedUrl.search}${resolvedUrl.hash}`);
        return;
      }

      window.location.assign(resolvedUrl.toString());
    } catch {
      const fallbackPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
      navigate(resolveNotificationPath(fallbackPath));
    }
  };

  const markOneAsRead = async (item: Notification) => {
    const isRead = item.read ?? item.isRead ?? false;
    if (isRead) {
      if (item.redirectUrl) {
        goToNotificationRedirect(item.redirectUrl);
      }
      return;
    }

    try {
      await notificationService.markAsRead(item.id);
      setNotifications((prev) =>
        prev.map((noti) =>
          noti.id === item.id
            ? {
                ...noti,
                read: true,
                isRead: true,
              }
            : noti,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      return;
    }

    if (item.redirectUrl) {
      goToNotificationRedirect(item.redirectUrl);
    }
  };

  const markAll = async () => {
    if (!notifications.length || unreadInList === 0) {
      return;
    }

    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((noti) => ({ ...noti, read: true, isRead: true })));
      setUnreadCount(0);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleLogout = () => {
    setIsNotiOpen(false);
    setNotifications([]);
    setUnreadCount(0);
    logout();
    navigate(ROUTES.login);
  };

  const toggleNotificationPanel = () => {
    const nextOpen = !isNotiOpen;
    setIsNotiOpen(nextOpen);

    if (nextOpen) {
      void fetchNotifications();
      void fetchUnreadCount();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/70 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 lg:hidden"
          onClick={onOpenMobileMenu}
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">SportBooking</p>
          <h1 className="font-display text-lg font-bold text-slate-900">Hệ thống đặt sân</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {/* Notification Bell */}
            <div ref={panelRef} className="relative">
              <button
                type="button"
                className={`relative rounded-xl bg-slate-900 p-2.5 text-white transition-all hover:bg-slate-800 hover:shadow-lg ${
                  hasNewNotification ? 'animate-shake' : ''
                }`}
                onClick={toggleNotificationPanel}
                aria-label="Mở thông báo"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-1.5 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {isNotiOpen && (
                <div className="absolute right-0 top-14 z-50 w-[380px] max-w-[92vw] animate-slide-down overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-float">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                    <p className="text-sm font-bold text-slate-900">
                      Thông báo
                      <span
                        className={`ml-2 inline-block h-2 w-2 rounded-full transition-colors ${
                          isSocketConnected ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-400'
                        }`}
                      />
                    </p>
                    <button
                      type="button"
                      onClick={() => void markAll()}
                      disabled={isMarkingAll || unreadInList === 0}
                      className="text-xs font-semibold text-teal-600 transition-colors hover:text-teal-800 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      {isMarkingAll ? 'Đang xử lý...' : 'Đọc tất cả'}
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingNoti ? (
                      <div className="space-y-3 px-4 py-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="skeleton mt-1.5 h-3 w-3 shrink-0 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="skeleton h-3.5 w-full" />
                              <div className="skeleton h-3 w-24" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                          <Bell size={22} />
                        </div>
                        <p className="mt-3 text-sm text-slate-400">Chưa có thông báo nào</p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const isRead = item.read ?? item.isRead ?? false;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => void markOneAsRead(item)}
                            className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition-all hover:bg-teal-50/50 ${
                              !isRead ? 'bg-teal-50/30' : ''
                            }`}
                          >
                            <span
                              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${
                                isRead ? 'bg-slate-200' : 'bg-teal-500 shadow-sm shadow-teal-500/40'
                              }`}
                            />
                            <span className="min-w-0 flex-1 space-y-1">
                              <span
                                className={`block text-sm leading-snug ${
                                  isRead ? 'text-slate-400' : 'font-semibold text-slate-800'
                                }`}
                              >
                                {item.message}
                              </span>
                              {item.createdAt && (
                                <span className="block text-[11px] text-slate-300">
                                  {new Date(item.createdAt).toLocaleString('vi-VN')}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Button */}
            <Link
              to={ROUTES.profile}
              className="hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-teal-200 hover:bg-teal-50 hover:shadow-sm md:flex"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-[10px] font-bold text-white">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <span className="max-w-[120px] truncate">{user?.fullName ?? 'Tài khoản'}</span>
            </Link>

            {/* Logout */}
            <button
              type="button"
              className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-500 transition-all hover:bg-rose-100 hover:text-rose-600 hover:shadow-sm"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to={ROUTES.login}>
              <Button variant="secondary">Đăng nhập</Button>
            </Link>
            <Link to={ROUTES.register}>
              <Button>Đăng ký</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
