
import React, { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, ClipboardCheck, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const NotificationsDropdown = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;
  
  useEffect(() => {
    // In a real implementation, we would fetch notifications from the API
    // For now, we'll use mock data
    const mockNotifications = [
      {
        id: 1,
        type: 'leave_approved',
        content: 'Your leave request has been approved',
        date: '2025-04-10T14:30:00',
        read: false,
        link: '/employee/leaves/1'
      },
      {
        id: 2,
        type: 'leave_request',
        content: 'New leave request from John Doe',
        date: '2025-04-09T09:15:00',
        read: false,
        link: '/manager/approvals'
      },
      {
        id: 3,
        type: 'profile_update',
        content: 'Please update your emergency contact information',
        date: '2025-04-07T11:45:00',
        read: true,
        link: '/employee/profile'
      },
      {
        id: 4,
        type: 'calendar_event',
        content: 'Team meeting scheduled for tomorrow',
        date: '2025-04-05T16:20:00',
        read: true,
        link: '/manager/calendar'
      }
    ];
    
    setNotifications(mockNotifications);
    
    // This would be the actual implementation:
    /*
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get(`${API_URL}/notifications`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Set up polling for notifications
    const intervalId = setInterval(fetchNotifications, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
    */
  }, []);
  
  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    
    // In a real implementation, we would update the API
    /*
    const updateNotification = async (id) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
          headers: {
            'x-auth-token': token
          }
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    };
    
    updateNotification(id);
    */
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    navigate(notification.link);
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    
    // In a real implementation, we would update the API
    /*
    const markAllNotificationsAsRead = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await axios.put(`${API_URL}/notifications/read-all`, {}, {
          headers: {
            'x-auth-token': token
          }
        });
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    };
    
    markAllNotificationsAsRead();
    */
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'leave_approved':
      case 'leave_request':
      case 'leave_rejected':
        return <ClipboardCheck className="h-4 w-4 text-brand-600" />;
      case 'profile_update':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'calendar_event':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              onClick={markAllAsRead} 
              className="text-xs h-auto p-1 text-brand-600 hover:text-brand-700"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="text-center py-6 text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start p-3 cursor-pointer ${!notification.read ? 'bg-gray-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium flex items-start justify-between">
                    <span>{notification.content}</span>
                    {!notification.read && (
                      <Badge className="ml-2 h-2 w-2 rounded-full p-0 bg-brand-500" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.date)}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              No notifications
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="justify-center text-sm text-brand-600 cursor-pointer"
          onClick={() => navigate('/notifications')}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
