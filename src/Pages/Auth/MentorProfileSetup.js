"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./MentorProfileSetup.module.css"
import validationStyles from "../../styles/validation.module.css"
import profileService from '../../services/profileService';
import { getAuthToken } from '../../services/authUtils';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateBio, validateDesignation, validateLocation, validateURL, validateSkills, validateAvailability } from '../../utils/validations';

const API_URL = 'http://127.0.0.1:8001/mentorapp';

const MentorProfileSetup = () => {
  const [formData, setFormData] = useState({
    profileImage: null,
    bio: "",
    designation: "",
    company: "",
    experienceYears: "",
    skills: [],
    hourlyRate: "0.00", // Default value that will be hidden from mentors
    availability: {
      Monday: { available: false, start_time: '09:00', end_time: '17:00' },
      Tuesday: { available: false, start_time: '09:00', end_time: '17:00' },
      Wednesday: { available: false, start_time: '09:00', end_time: '17:00' },
      Thursday: { available: false, start_time: '09:00', end_time: '17:00' },
      Friday: { available: false, start_time: '09:00', end_time: '17:00' },
      Saturday: { available: false, start_time: '09:00', end_time: '17:00' },
      Sunday: { available: false, start_time: '09:00', end_time: '17:00' }
    },
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    website: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState("")
  const [newSkill, setNewSkill] = useState({ skill_name: '', description: '' });
  const [showNewSkillModal, setShowNewSkillModal] = useState(false);
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [availableSkills, setAvailableSkills] = useState([]);
  const [formErrors, setFormErrors] = useState({
    bio: "",
    designation: "",
    company: "",
    experienceYears: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    website: "",
    skills: "",
    availability: ""
  });

  const experienceOptions = ["1-3", "4-6", "7-10", "10+"]

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      console.log("No token found on component mount");
      navigate('/login');
    } else {
      fetchSkills();
    }
  }, [navigate]);

  const fetchSkills = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://127.0.0.1:8001/mentorapp/skills/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Fetched skills:', data);  // Debug log
      setAvailableSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Handle hourly rate separately to ensure proper numeric handling
    if (name === 'hourly_rate') {
      // Remove any non-numeric characters except decimal point
      const numericValue = value.replace(/[^\d.]/g, '');
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      const cleanedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
      
      console.log('Hourly rate input value:', value);
      console.log('Cleaned hourly rate:', cleanedValue);
      
      setFormData({
        ...formData,
        [name]: cleanedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({
        ...formData,
        profileImage: file,
      })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleAddSkill = () => {
    if (selectedSkill && !formData.skills.includes(selectedSkill)) {
      // Find the skill object from availableSkills
      const skillObject = availableSkills.find(skill => skill.skill_name === selectedSkill);
      if (skillObject) {
        console.log('Adding skill:', skillObject);  // Debug log
        setFormData({
          ...formData,
          skills: [...formData.skills, skillObject.id]  // Use id instead of skill_id
        });
        setSelectedSkill("");
      }
    }
  };

  const handleRemoveSkill = (skillId) => {
    console.log('Removing skill:', skillId);  // Debug log
    setFormData({
      ...formData,
      skills: formData.skills.filter(id => id !== skillId)
    });
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      bio: "",
      designation: "",
      company: "",
      experienceYears: "",
      location: "",
      linkedinUrl: "",
      githubUrl: "",
      website: "",
      skills: "",
      availability: ""
    };

    if (!validateBio(formData.bio)) {
      errors.bio = "Bio must be between 10 and 100 characters";
      isValid = false;
    }

    if (!validateDesignation(formData.designation)) {
      errors.designation = "Designation must be at least 3 characters long";
      isValid = false;
    }

    if (!formData.company || formData.company.trim().length < 2) {
      errors.company = "Company name must be at least 2 characters long";
      isValid = false;
    }

    if (!formData.experienceYears) {
      errors.experienceYears = "Please select your years of experience";
      isValid = false;
    }

    if (!validateLocation(formData.location)) {
      errors.location = "Location must be at least 3 characters long";
      isValid = false;
    }

    if (!validateURL(formData.linkedinUrl)) {
      errors.linkedinUrl = "Please enter a valid LinkedIn URL";
      isValid = false;
    }

    if (formData.githubUrl && !validateURL(formData.githubUrl)) {
      errors.githubUrl = "Please enter a valid GitHub URL";
      isValid = false;
    }

    if (formData.website && !validateURL(formData.website)) {
      errors.website = "Please enter a valid website URL";
      isValid = false;
    }

    if (!validateSkills(formData.skills)) {
      errors.skills = "Please select at least one skill";
      isValid = false;
    }

    if (!validateAvailability(formData.availability)) {
      errors.availability = "Please select at least one day of availability";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        toast.error("Please fix the form errors before submitting");
        return;
      }

      setLoading(true);
      setError(null);

      // Validate required fields
      const requiredFields = ['bio', 'designation', 'company', 'experienceYears', 'location', 'linkedinUrl'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      if (formData.skills.length === 0) {
        throw new Error('Please add at least one skill');
      }

      // Create form data
      const profileFormData = new FormData();
      
      // Add profile image if selected
      if (formData.profileImage) {
        profileFormData.append('profile_image', formData.profileImage);
      }

      // Add other form data
      profileFormData.append('bio', formData.bio);
      profileFormData.append('designation', formData.designation);
      profileFormData.append('company', formData.company);
      profileFormData.append('experience_years', formData.experienceYears);
      profileFormData.append('location', formData.location);
      profileFormData.append('linkedin_url', formData.linkedinUrl);
      profileFormData.append('github_url', formData.githubUrl || '');
      profileFormData.append('website', formData.website || '');

      // Add skills
      formData.skills.forEach(skill => {
        profileFormData.append('skills', skill);
      });

      // Add availability
      Object.entries(formData.availability).forEach(([day, availability]) => {
        if (availability.available) {
          profileFormData.append('availability', JSON.stringify({
            day_of_week: day,
            start_time: availability.start_time,
            end_time: availability.end_time,
            is_recurring: true
          }));
        }
      });

      // Create mentor profile
      await profileService.createMentorProfile(profileFormData);

      // Remove token after successful profile setup
      localStorage.removeItem('token');
      
      // Navigate to login with success message
      navigate('/login?message=Profile%20created%20successfully!');
    } catch (error) {
      console.error('Error submitting profile:', error);
      setError(error.message || 'Failed to submit profile');
      toast.error(error.message || 'Failed to submit profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewSkill = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      
      // Create the skill (notification will be created automatically in backend)
      const response = await axios.post(`${API_URL}/skills/`, {
        skill_name: newSkill.skill_name,
        description: newSkill.description
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Add the new skill to the available skills list and select it
      const newSkillData = response.data;
      setAvailableSkills(prevSkills => [...prevSkills, newSkillData]);
      
      // Update form data with the new skill
      setFormData(prevData => ({
        ...prevData,
        skills: [...prevData.skills, newSkillData.id]
      }));
      
      // Reset form and close modal
      setNewSkill({ skill_name: '', description: '' });
      setShowNewSkillModal(false);
      
      // Show success message
      setSuccessMessage(`Skill "${newSkillData.skill_name}" has been added and selected!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      setError(null);
    } catch (err) {
      console.error('Error adding new skill:', err);
      setError(err.response?.data?.message || 'Failed to add new skill. Please try again.');
      // Don't close modal or clear form if there's an error
    }
  };

  const handleCloseModal = () => {
    setShowNewSkillModal(false);
    setNewSkill({ skill_name: '', description: '' });
    setError(null);
  };

  return (
    <div className={styles.profileSetupContainer}>
      <div className={styles.profileSetupCard}>
        <h2>Complete Your Mentor Profile</h2>
        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.profileImageSection}>
            <div 
              className={styles.profileImageUpload}
              onClick={triggerFileInput}
              style={{
                backgroundImage: imagePreview ? `url(${imagePreview})` : 'none'
              }}
            >
              {!imagePreview && <span>Add Photo</span>}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              hidden
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="designation">Current Role/Designation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Developer, Product Manager"
                required
                className={`${styles.inputField} ${formErrors.designation ? validationStyles.errorInput : ""}`}
              />
              {formErrors.designation && <div className={validationStyles.errorText}>{formErrors.designation}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="company">Company/Organization</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Google, Microsoft, Freelance"
                required
                className={`${styles.inputField} ${formErrors.company ? validationStyles.errorInput : ""}`}
              />
              {formErrors.company && <div className={validationStyles.errorText}>{formErrors.company}</div>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="experienceYears">Years of Experience</label>
              <select
                id="experienceYears"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                required
                className={`${styles.inputField} ${formErrors.experienceYears ? validationStyles.errorInput : ""}`}
              >
                <option value="">Select Experience</option>
                {experienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} years
                  </option>
                ))}
              </select>
              {formErrors.experienceYears && <div className={validationStyles.errorText}>{formErrors.experienceYears}</div>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Skills You Can Mentor In</label>
            <div className={styles.skillInputContainer}>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className={`${styles.inputField} ${styles.skillSelect}`}
              >
                <option value="">Select a skill</option>
                {availableSkills.map(skill => (
                  <option key={skill.id} value={skill.skill_name}>
                    {skill.skill_name}
                  </option>
                ))}
              </select>
              <button 
                type="button" 
                className={styles.addSkillButton}
                onClick={handleAddSkill}
                disabled={!selectedSkill}
              >
                Add Skill
              </button>
              <button 
                type="button" 
                className={styles.addSkillButton}
                onClick={() => setShowNewSkillModal(true)}
              >
                <i className="fas fa-plus"></i> Add New Skill
              </button>
            </div>

            {formData.skills.length > 0 && (
              <div className={styles.selectedSkills}>
                <p>Skills you can mentor in:</p>
                <div className={styles.skillTags}>
                  {formData.skills.map(skillId => {
                    const skill = availableSkills.find(s => s.id === skillId);
                    return skill ? (
                      <span key={skillId} className={styles.selectedSkill}>
                        {skill.skill_name}
                        <button 
                          type="button" 
                          className={styles.removeSkill}
                          onClick={() => handleRemoveSkill(skillId)}
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {formErrors.skills && <div className={validationStyles.errorText}>{formErrors.skills}</div>}
          </div>

          <div className={styles.formGroup}>
            <label>Availability</label>
            <div className={styles.availabilityGrid}>
              {Object.entries(formData.availability).map(([day, times]) => (
                <div key={day} className={styles.dayRow}>
                  <div className={styles.dayCheck}>
                    <input
                      type="checkbox"
                      checked={times.available}
                      onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                    />
                    <span>{day}</span>
                  </div>
                  {times.available && (
                    <div className={styles.timeInputs}>
                      <input
                        type="time"
                        value={times.start_time}
                        onChange={(e) => handleAvailabilityChange(day, 'start_time', e.target.value)}
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={times.end_time}
                        onChange={(e) => handleAvailabilityChange(day, 'end_time', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {formErrors.availability && <div className={validationStyles.errorText}>{formErrors.availability}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your experience and what you can offer as a mentor"
              rows="4"
              required
              className={`${styles.inputField} ${formErrors.bio ? validationStyles.errorInput : ""}`}
            />
            {formErrors.bio && <div className={validationStyles.errorText}>{formErrors.bio}</div>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter your location"
                className={`${styles.inputField} ${formErrors.location ? validationStyles.errorInput : ""}`}
              />
              {formErrors.location && <div className={validationStyles.errorText}>{formErrors.location}</div>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="linkedinUrl">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                required
                placeholder="https://linkedin.com/in/your-profile"
                className={`${styles.inputField} ${formErrors.linkedinUrl ? validationStyles.errorInput : ""}`}
              />
              {formErrors.linkedinUrl && <div className={validationStyles.errorText}>{formErrors.linkedinUrl}</div>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="githubUrl">GitHub Profile URL (Optional)</label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                className={`${styles.inputField} ${formErrors.githubUrl ? validationStyles.errorInput : ""}`}
              />
              {formErrors.githubUrl && <div className={validationStyles.errorText}>{formErrors.githubUrl}</div>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="website">Personal Website (Optional)</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className={`${styles.inputField} ${formErrors.website ? validationStyles.errorInput : ""}`}
              />
              {formErrors.website && <div className={validationStyles.errorText}>{formErrors.website}</div>}
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Saving Profile..." : "Complete Profile"}
          </button>
        </form>
      </div>

      {/* New Skill Modal */}
      {showNewSkillModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add New Skill</h3>
              <button 
                type="button" 
                className={styles.closeButton}
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddNewSkill}>
              <div className={styles.formGroup}>
                <label htmlFor="skillName">Skill Name:</label>
                <input
                  type="text"
                  id="skillName"
                  value={newSkill.skill_name}
                  onChange={(e) => setNewSkill({
                    ...newSkill,
                    skill_name: e.target.value
                  })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="skillDescription">Description:</label>
                <textarea
                  id="skillDescription"
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({
                    ...newSkill,
                    description: e.target.value
                  })}
                  required
                />
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.modalActions}>
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit">
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfileSetup