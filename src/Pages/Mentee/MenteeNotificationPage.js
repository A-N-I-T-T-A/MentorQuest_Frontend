import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { menteeNotificationService } from '../../services/menteeNotificationService';
import styles from './MenteeNotificationPage.module.css';
import Sidebar from '../../components/Dashboard/Sidebar';

const MenteeNotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await menteeNotificationService.getAllNotifications();
            setNotifications(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.response?.data?.message || 'Failed to load notifications');
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await menteeNotificationService.markAsRead(notificationId);
            setNotifications(notifications.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, is_read: true }
                    : notification
            ));
            
            // Dispatch notification update event to update sidebar
            const event = new Event('notificationUpdate');
            window.dispatchEvent(event);
            
            toast.success('Notification marked as read');
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Failed to update notification');
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await menteeNotificationService.markAllAsRead();
            setNotifications(notifications.map(notification => ({
                ...notification,
                is_read: true
            })));
            
            // Dispatch notification update event to update sidebar
            const event = new Event('notificationUpdate');
            window.dispatchEvent(event);
            
            toast.success('All notifications marked as read');
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            setError('Failed to update notifications');
            toast.error('Failed to mark notifications as read');
        }
    };

    const handleDelete = async (notificationId) => {
        if (!window.confirm('Are you sure you want to delete this notification?')) {
            return;
        }

        try {
            await menteeNotificationService.deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            
            // Dispatch notification update event to update sidebar
            const event = new Event('notificationUpdate');
            window.dispatchEvent(event);
            
            toast.success('Notification deleted successfully');
        } catch (err) {
            console.error('Error deleting notification:', err);
            setError('Failed to delete notification');
            toast.error('Failed to delete notification');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getSessionStatus = (status) => {
        const statusMap = {
            'Pending': 'warning',
            'Scheduled': 'success',
            'Completed': 'success',
            'Cancelled': 'danger',
            'No-show': 'danger'
        };
        return statusMap[status] || 'info';
    };

    return (
        <div className="dashboard">
            <Sidebar userType="mentee" />
            <div className="dashboard-content">
                <div className={styles.notificationContainer}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>
                            <i className="fas fa-bell"></i> Notifications
                        </h2>
                        {notifications.length > 0 && (
                            <button 
                                className={styles.markAllReadButton}
                                onClick={handleMarkAllRead}
                            >
                                <i className="fas fa-check-double"></i> Mark All as Read
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className={styles.loading}>Loading notifications...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
                    ) : notifications.length === 0 ? (
                        <div className={styles.noNotifications}>
                            No notifications available
                        </div>
                    ) : (
                        <div className={styles.notificationList}>
                            {notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
                                >
                                    <div className={styles.notificationIcon}>
                                        <i className="fas fa-calendar-alt"></i>
                                    </div>
                                    <div className={styles.notificationContent}>
                                        <div className={styles.notificationHeader}>
                                            <span className={styles.notificationType}>
                                                {notification.content}
                                            </span>
                                            <span className={styles.notificationTime}>
                                                {formatDate(notification.created_at)}
                                            </span>
                                        </div>
                                        {notification.session && notification.type !== 'session' && (
                                            <div className={styles.sessionDetails}>
                                                <div className={styles.sessionInfo}>
                                                    <span className={styles.sessionLabel}>Mentor:</span>
                                                    <span>{notification.session.mentor.name}</span>
                                                </div>
                                                <div className={styles.sessionInfo}>
                                                    <span className={styles.sessionLabel}>Date:</span>
                                                    <span>{notification.session.date}</span>
                                                </div>
                                                <div className={styles.sessionInfo}>
                                                    <span className={styles.sessionLabel}>Time:</span>
                                                    <span>{notification.session.time}</span>
                                                </div>
                                                <div className={styles.sessionInfo}>
                                                    <span className={styles.sessionLabel}>Status:</span>
                                                    <span className={`badge badge-${getSessionStatus(notification.session.status)}`}>
                                                        {notification.session.status}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.notificationActions}>
                                        {!notification.is_read && (
                                            <button
                                                className={styles.readButton}
                                                onClick={() => markAsRead(notification.id)}
                                                title="Mark as read"
                                            >
                                                <i className="fas fa-check"></i>
                                            </button>
                                        )}
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDelete(notification.id)}
                                            title="Delete notification"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MenteeNotificationPage;
