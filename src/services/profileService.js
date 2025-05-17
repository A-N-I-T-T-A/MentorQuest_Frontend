import axios from 'axios';
import { getAuthToken } from './authUtils';

const API_BASE_URL = "http://127.0.0.1:8001/mentorapp";

const profileService = {
  updateMenteeProfile: async (profileData, token) => {
    try {
      console.log('Sending profile data to backend:', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: Object.fromEntries(profileData)
      });

      const response = await fetch('http://127.0.0.1:8001/mentorapp/mentee/profile/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: profileData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile update error response:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const responseData = await response.json();
      console.log('Profile update response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  getMenteeProfile: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/mentee/profile/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('Network error occurred');
    }
  },

  updateMentorProfile: async (profileData, token) => {
    try {
      const response = await fetch('http://127.0.0.1:8001/mentorapp/mentor/profile/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: profileData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getMentorProfile: async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/mentor/profile/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('Network error occurred');
    }
  },

  updateProfileImage: async (imageFile) => {
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('profile_image', imageFile);
      
      const response = await axios.patch(
        `${API_BASE_URL}/user/profile/image/`,
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
      if (error.response) {
        throw error.response.data;
      }
      throw new Error('Failed to update profile image');
    }
  },

  createMentorProfile: async (formData) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/mentor-profile/`,
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
  },

  createMenteeProfile: async (formData) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/mentee-profile/`,
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
      console.error('Error creating mentee profile:', error);
      throw error;
    }
  }
};

export default profileService;