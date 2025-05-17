// Validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateName = (name) => {
  return name.trim().length >= 2;
};

export const validateBio = (bio) => {
  return bio.trim().length >= 10 && bio.trim().length <= 100;
};

export const validateDesignation = (designation) => {
  return designation.trim().length >= 3;
};

export const validateLocation = (location) => {
  return location.trim().length >= 3;
};

export const validateHourlyRate = (rate) => {
  const numRate = parseFloat(rate);
  return !isNaN(numRate) && numRate >= 0;
};

export const validateSkills = (skills) => {
  return skills.length > 0;
};

export const validateAvailability = (availability) => {
  return Object.values(availability).some(day => day.available);
}; 