// Get the authentication token from local storage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set authentication token in local storage
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove authentication token from local storage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get the current user data from local storage
export const getCurrentUser = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

// Set current user data in local storage
export const setCurrentUser = (userData) => {
  localStorage.setItem('user_data', JSON.stringify(userData));
};

// Remove current user data from local storage
export const removeCurrentUser = () => {
  localStorage.removeItem('user_data');
};

// Logout function - clear all auth related data
export const logout = () => {
  removeAuthToken();
  removeCurrentUser();
};