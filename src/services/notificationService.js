import axios from 'axios';
import { getAuthToken } from './authUtils';

const API_URL = process.env.REACT_APP_API_URL || 'https://mentorquest-backend.onrender.com/mentorapp';

const notificationService = {
    // Get all notifications
    getNotifications: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/mentorapp/notifications/?type=system`, {
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
            const response = await axios.get(`${API_URL}/mentorapp/notifications/unread-count/`, {
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

    // Get a single notification
    getNotification: async (id) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/mentorapp/notifications/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching notification:', error);
            throw error;
        }
    },

    // Create a new notification
    createNotification: async (notificationData) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(`${API_URL}/mentorapp/notifications/create/`, notificationData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    // Mark a notification as read
    markAsRead: async (id) => {
        try {
            const token = getAuthToken();
            const response = await axios.patch(`${API_URL}/mentorapp/notifications/${id}/`, 
                { is_read: true },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Trigger notification update event
            const event = new Event('notificationUpdate');
            window.dispatchEvent(event);
            
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.post(`${API_URL}/mentorapp/notifications/mark-all-read/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Trigger notification update event
            const event = new Event('notificationUpdate');
            window.dispatchEvent(event);
            
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // Delete a notification
    deleteNotification: async (id) => {
        try {
            const token = getAuthToken();
            await axios.delete(`${API_URL}/mentorapp/notifications/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};

export default notificationService;
