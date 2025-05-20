import axios from 'axios';
import { getAuthToken } from '../services/authUtils';

const API_URL = process.env.REACT_APP_API_URL || 'https://mentorquest-backend.onrender.com';

export const menteeNotificationService = {
    // Get all notifications for mentee
    getAllNotifications: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/mentorapp/mentee-notifications/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Get unread notification count
    getUnreadCount: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/mentorapp/mentee-unread-notification-count/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.count;
        } catch (error) {
            console.error('Error fetching unread notification count:', error);
            throw error;
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const token = getAuthToken();
            const response = await axios.patch(`${API_URL}/mentorapp/mentee-notifications/${notificationId}/`,
                { is_read: true },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            const token = getAuthToken();
            const response = await axios.delete(`${API_URL}/mentorapp/mentee-notifications/${notificationId}/delete/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Trigger notification update event to update sidebar
            const event = new Event('notificationUpdate');
            window.dispatchEvent(event);
            
            return response.data;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.post(`${API_URL}/mentorapp/mentee-mark-all-read/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Trigger notification update event to update sidebar
            const event = new Event('notificationUpdate');
            window.dispatchEvent(event);
            
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
};
