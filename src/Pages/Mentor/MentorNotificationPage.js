import React, { useState, useEffect } from 'react';
import mentorNotificationService from '../../services/mentorNotificationService';
import styles from './MentorNotificationPage.module.css';
import Sidebar from '../../components/Dashboard/Sidebar';

const MentorNotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await mentorNotificationService.getMentorNotifications();
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
            await mentorNotificationService.markAsRead(notificationId);
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
            await mentorNotificationService.markAllAsRead();
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
                await mentorNotificationService.deleteNotification(notificationId);
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

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking':
                return 'fas fa-calendar-alt';
            case 'feedback':
                return 'fas fa-comment-alt';
            default:
                return 'fas fa-bell';
        }
    };

    const getNotificationTitle = (type) => {
        switch (type) {
            case 'booking':
                return 'Booking';
            case 'feedback':
                return 'Feedback';
            default:
                return 'Notification';
        }
    };

    return (
        <div className="dashboard">
            <Sidebar userType="mentor" />
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
                                        <i className={getNotificationIcon(notification.type)}></i>
                                    </div>
                                    <div className={styles.notificationContent}>
                                        <div className={styles.notificationHeader}>
                                            <span className={styles.notificationType}>
                                                {getNotificationTitle(notification.type)}
                                            </span>
                                            <span className={styles.notificationTime}>
                                                {formatDate(notification.created_at)}
                                            </span>
                                        </div>
                                        <p className={styles.notificationMessage}>
                                            {notification.content}
                                        </p>
                                        {notification.session_details && (
                                            <div className={styles.sessionDetails}>
                                                <div className={styles.sessionInfo}>
                                                    <span className={styles.sessionLabel}>Date:</span>
                                                    <span>{notification.session_details.session_date}</span>
                                                </div>
                                                <div className={styles.sessionInfo}>
                                                    <span className={styles.sessionLabel}>Time:</span>
                                                    <span>{notification.session_details.start_time} - {notification.session_details.end_time}</span>
                                                </div>
                                                <div className={styles.sessionInfo}>
                                                    <span className={styles.sessionLabel}>Mentee:</span>
                                                    <span>{notification.session_details.mentee}</span>
                                                </div>
                                                <div className={styles.sessionInfo}>
                                                    <span className={styles.sessionLabel}>Status:</span>
                                                    <span className={`badge badge-${getSessionStatus(notification.session_details.status)}`}>
                                                        {notification.session_details.status}
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

export default MentorNotificationPage;
