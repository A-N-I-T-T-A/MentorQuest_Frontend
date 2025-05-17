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

export const getMentorshipRequests = async (userType) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/mentorship-requests/${userType === 'mentor' ? 'pending_requests' : 'my_requests'}/`,
            { headers: getHeaders() }
        );
        // Transform the response to include mentor_id for easier filtering
        const transformedRequests = response.data.map(request => ({
            ...request,
            mentor_id: request.mentor.id
        }));
        return transformedRequests;
    } catch (error) {
        console.error('Error fetching mentorship requests:', error);
        throw error;
    }
};

export const updateMentorshipRequestStatus = async (requestId, status) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/mentorship-requests/${requestId}/update_status/`,
            { status },
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating request status:', error);
        throw error;
    }
};

export const createMentorshipRequest = async (mentorId, message) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/mentorship-requests/`,
            {
                mentor_id: mentorId,
                message: message
            },
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating mentorship request:', error);
        throw error;
    }
};

export const deleteMentorshipRequest = async (requestId) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/mentorship-requests/${requestId}/`,
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting mentorship request:', error);
        throw error;
    }
};