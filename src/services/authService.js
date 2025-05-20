import axios from "axios";
import { setAuthToken, setCurrentUser } from './authUtils';

const API_URL = "https://mentorquest-backend.onrender.com/mentorapp";

const authService = {
  register: async (userData) => {
    try {
      console.log("Sending signup data:", userData);
      
      const response = await axios.post(`${API_URL}/signup/`, userData);
      
      if (response.data.token) {
        setAuthToken(response.data.token);
        setCurrentUser({
          email: userData.email,
          userType: userData.user_type
        });
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      throw new Error(errorMessage);
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, {
        email,
        password
      });

      const { token, user, redirect_url } = response.data;
      
      if (token) {
        setAuthToken(token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      return {
        token,
        user,
        redirect_url
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      throw new Error(errorMessage);
    }
  },

  resetPassword: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password/`, {
        email
      });
      
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error.response?.data || error);
      if (error.response?.status === 404) {
        throw new Error("No account found with this email address.");
      }
      throw new Error(error.response?.data?.message || "Password reset failed. Please try again.");
    }
  },

  logout: async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      
      // You can also make an API call to invalidate the token on the server
      // await axios.post(`${API_URL}/logout/`);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error("Failed to logout");
    }
  },

  googleLogin: async (credential) => {
    try {
      const response = await axios.post(`${API_URL}/google-auth/`, {
        token: credential
      });

      const { token, user, isNewUser } = response.data;
      
      if (!isNewUser) {
        setAuthToken(token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error('Google login error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || "Google authentication failed");
    }
  },

  completeGoogleSignup: async (googleToken, accountType) => {
    try {
      const response = await axios.post(`${API_URL}/complete-google-signup/`, {
        token: googleToken,
        user_type: accountType.toLowerCase()
      });

      const { token, user } = response.data;
      setAuthToken(token);
      localStorage.setItem('user_data', JSON.stringify(user));

      return response.data;
    } catch (error) {
      console.error('Complete Google signup error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || "Failed to complete signup");
    }
  }
};

export default authService;
