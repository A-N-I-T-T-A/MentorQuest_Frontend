import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import styles from './NotificationPage.module.css';
import Sidebar from '../../components/Dashboard/Sidebar';

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
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
            await notificationService.markAsRead(notificationId);
            setNotifications(notifications.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, is_read: true }
                    : notification
            ));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            setError('Failed to update notification');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(notification => ({
                ...notification,
                is_read: true
            })));
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            setError('Failed to update notifications');
        }
    };

    const handleDelete = async (notificationId) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await notificationService.deleteNotification(notificationId);
                setNotifications(notifications.filter(n => n.id !== notificationId));
            } catch (err) {
                console.error('Error deleting notification:', err);
                setError('Failed to delete notification');
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getNotificationIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'skill':
                return <i className="fas fa-tools"></i>;
            case 'mentorship':
                return <i className="fas fa-user-friends"></i>;
            case 'message':
                return <i className="fas fa-envelope"></i>;
            default:
                return <i className="fas fa-bell"></i>;
        }
    };

    return (
        <div className="dashboard">
            <Sidebar userType="admin" />
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
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className={styles.notificationContent}>
                                        <div className={styles.notificationHeader}>
                                            <span className={styles.notificationType}>
                                                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                            </span>
                                            <span className={styles.notificationTime}>
                                                {formatDate(notification.created_at)}
                                            </span>
                                        </div>
                                        <p className={styles.notificationMessage}>
                                            {notification.content}
                                        </p>
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

export default NotificationPage;
