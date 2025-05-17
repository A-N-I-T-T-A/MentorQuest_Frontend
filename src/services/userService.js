import axios from 'axios';
import { getAuthToken } from './authUtils';
import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/user/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    console.log('Profile data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (formData) => {
  try {
    const token = getAuthToken();
    const userData = JSON.parse(localStorage.getItem('user_data'));
    
    // Log the FormData contents for debugging
    console.log('Sending profile update with data:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Use the correct endpoint and method based on user type
    const endpoint = userData.user_type.toLowerCase() === 'mentor' ? 'mentor' : 'mentee';
    const method = userData.user_type.toLowerCase() === 'mentor' ? 'PUT' : 'POST';
    
    const response = await fetch(`${API_BASE_URL}/${endpoint}/profile/`, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    console.log('Response from server:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    // After successful update, fetch the latest profile data
    const updatedProfile = await getUserProfile();
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/user/change-password/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/admin/users/`, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error('Users fetch error:', error.response || error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};
