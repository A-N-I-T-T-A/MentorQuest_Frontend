import axios from 'axios';
import { getAuthToken } from './authUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001';

const mentorNotificationService = {
    // Get mentor-specific notifications
    getMentorNotifications: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/mentorapp/notifications/mentor/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching mentor notifications:', error);
            throw error;
        }
    },

    // Get unread mentor notification count
    getUnreadMentorCount: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_URL}/mentorapp/notifications/mentor/unread-count/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.count;
        } catch (error) {
            console.error('Error fetching unread mentor notification count:', error);
            throw error;
        }
    },

    // Mark a mentor notification as read
    markAsRead: async (id) => {
        try {
            const token = getAuthToken();
            const response = await axios.patch(`${API_URL}/mentorapp/notifications/mentor/${id}/`, 
                { is_read: true },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Trigger notification update event
            const event = new Event('mentorNotificationUpdate');
            window.dispatchEvent(event);
            
            return response.data;
        } catch (error) {
            console.error('Error marking mentor notification as read:', error);
            throw error;
        }
    },

    // Mark all mentor notifications as read
    markAllAsRead: async () => {
        try {
            const token = getAuthToken();
            const response = await axios.post(`${API_URL}/mentorapp/notifications/mentor/mark-all-read/`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Trigger notification update event
            const event = new Event('mentorNotificationUpdate');
            window.dispatchEvent(event);
            
            return response.data;
        } catch (error) {
            console.error('Error marking all mentor notifications as read:', error);
            throw error;
        }
    },

    // Delete a mentor notification
    deleteNotification: async (id) => {
        try {
            const token = getAuthToken();
            const response = await axios.delete(`${API_URL}/mentorapp/notifications/mentor/${id}/delete/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Trigger notification update event
            const event = new Event('mentorNotificationUpdate');
            window.dispatchEvent(event);
            
            return response.data;
        } catch (error) {
            console.error('Error deleting mentor notification:', error);
            throw error;
        }
    }
};

export default mentorNotificationService;
