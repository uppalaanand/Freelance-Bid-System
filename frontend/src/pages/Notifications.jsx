import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiBell, HiCheckCircle, HiMailOpen } from 'react-icons/hi';
import { fetchNotifications, markAsRead, markAllAsRead } from '../redux/slices/notificationSlice';

import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, isLoading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await dispatch(markAsRead(notification._id)).unwrap();
      } catch (err) {
        console.error('Failed to mark notification as read', err);
      }
    }
    
    // Redirect if a link target is present
    const destination = notification.link || notification.targetUrl || notification.url;
    if (destination) {
      navigate(destination);
    }
  };

  // Sort notifications by date desc
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <HiBell className="text-indigo-600" />
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have <span className="font-bold text-indigo-650">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead}
            icon={HiCheckCircle}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : sortedNotifications.length > 0 ? (
        <div className="space-y-3">
          {sortedNotifications.map((n) => (
            <Card
              key={n._id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 border transition-all cursor-pointer relative overflow-hidden ${
                !n.isRead 
                  ? 'border-indigo-150 bg-indigo-50/30 hover:bg-indigo-50/50 shadow-sm' 
                  : 'border-slate-150 hover:bg-slate-50/50'
              }`}
            >
              {/* Highlight bar for unread notifications */}
              {!n.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
              )}
              
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg h-fit ${!n.isRead ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  <HiBell className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <h3 className={`text-sm font-bold ${!n.isRead ? 'text-slate-850' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {n.message}
                  </p>
                  {!n.isRead && (
                    <div className="pt-1">
                      <Badge variant="primary" className="text-[10px] py-0 px-1.5 font-medium">New</Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={HiMailOpen}
          title="All caught up!"
          description="You don't have any notifications at the moment. We'll let you know when something updates."
        />
      )}
    </div>
  );
};

export default Notifications;
