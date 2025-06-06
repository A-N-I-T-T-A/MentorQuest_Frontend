import axios from 'axios';
import { getAuthToken } from './authUtils';

const API_URL = process.env.REACT_APP_API_URL || 'https://mentorquest-backend.onrender.com/mentorapp';

const mentorProfileService = {
    createMentorProfile: async (formData) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_URL}/mentor-profile/`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating mentor profile:', error);
            throw error;
        }
    }
};

export default mentorProfileService;
