import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getAuthToken } from './authUtils';

const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Get all sessions for the current mentee
export const getMenteeSessions = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/sessions/mentee/`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching mentee sessions:', error);
        throw error;
    }
};

// Check if there are any pending sessions between a mentee and a mentor
export const hasPendingSessionWithMentor = async (mentorId) => {
    try {
        const sessions = await getMenteeSessions();
        return sessions.some(session => 
            session.relationship.mentor.id === mentorId && 
            (session.status === 'Pending' || session.status === 'Scheduled')
        );
    } catch (error) {
        console.error('Error checking pending sessions with mentor:', error);
        return false; // Default to false on error to not block functionality
    }
};

// Get all sessions for the current mentor
export const getMentorSessions = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/sessions/mentor/`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching mentor sessions:', error);
        throw error;
    }
};

// Schedule a session
export const scheduleSession = async (sessionData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/sessions/`,
            sessionData,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error scheduling session:', error);
        throw error;
    }
}; 