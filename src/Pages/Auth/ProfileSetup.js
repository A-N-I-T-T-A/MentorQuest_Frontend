"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./ProfileSetup.module.css"
import validationStyles from "../../styles/validation.module.css"
import profileService from '../../services/profileService';
import { getAuthToken } from '../../services/authUtils';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { validateBio, validateDesignation, validateLocation, validateURL, validateSkills } from '../../utils/validations';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    profileImage: null,
    bio: "",
    designation: "",
    experienceLevel: "",
    skills: [],
    location: "",
    linkedinUrl: "",
    githubUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState("")
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [availableSkills, setAvailableSkills] = useState([]);
  const [formErrors, setFormErrors] = useState({
    bio: "",
    designation: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    skills: ""
  });

  const experienceLevels = ["Beginner", "Intermediate", "Advanced"]

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
      const response = await fetch('https://mentorquest-backend.onrender.com/mentorapp/skills/', {
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
    setFormData({
      ...formData,
      [name]: value,
    })
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
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skillObject.id]  // Use id instead of skill_id
        }));
        setSelectedSkill("");
      }
    }
  };

  const handleRemoveSkill = (skillId) => {
    console.log('Removing skill:', skillId);  // Debug log
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(id => id !== skillId)
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      bio: "",
      designation: "",
      location: "",
      linkedinUrl: "",
      githubUrl: "",
      skills: ""
    };

    if (!validateBio(formData.bio)) {
      errors.bio = "Bio must be between 10 and 100 characters";
      isValid = false;
    }

    if (!validateDesignation(formData.designation)) {
      errors.designation = "Designation must be at least 3 characters long";
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

    if (!validateSkills(formData.skills)) {
      errors.skills = "Please select at least one skill";
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
      const requiredFields = ['bio', 'designation', 'location', 'linkedinUrl'];
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
      profileFormData.append('experience_level', formData.experienceLevel);
      profileFormData.append('location', formData.location);
      profileFormData.append('linkedin_url', formData.linkedinUrl);
      profileFormData.append('github_url', formData.githubUrl || '');

      // Add skills
      formData.skills.forEach(skill => {
        profileFormData.append('skills', skill);
      });

      // Create mentee profile
      await profileService.createMenteeProfile(profileFormData);

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

  return (
    <div className={styles.profileSetupContainer}>
      <div className={styles.profileSetupCard}>
        <h2>Complete Your Mentee Profile</h2>
        <p className={styles.subtitle}>Help us match you with the perfect mentor</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}

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

          <div className={styles.formGroup}>
            <label htmlFor="designation">Current Role/Designation</label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="e.g. Software Developer, Student"
              required
              className={`${styles.inputField} ${formErrors.designation ? validationStyles.errorInput : ""}`}
            />
            {formErrors.designation && <div className={validationStyles.errorText}>{formErrors.designation}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="experienceLevel">Experience Level</label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
            >
              <option value="">Select Level</option>
              {experienceLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="skills">Skills You Want to Learn</label>
            <div className={styles.skillInputContainer}>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className={styles.skillSelect}
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
            </div>

            {formData.skills.length > 0 && (
              <div className={styles.selectedSkills}>
                <p>Skills you want to learn:</p>
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
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself and what you're looking to learn"
              rows="4"
              required
              className={`${styles.inputField} ${formErrors.bio ? validationStyles.errorInput : ""}`}
            />
            {formErrors.bio && <div className={validationStyles.errorText}>{formErrors.bio}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. New York, USA"
              required
              className={`${styles.inputField} ${formErrors.location ? validationStyles.errorInput : ""}`}
            />
            {formErrors.location && <div className={validationStyles.errorText}>{formErrors.location}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
            <input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourusername"
              required
              className={`${styles.inputField} ${formErrors.linkedinUrl ? validationStyles.errorInput : ""}`}
            />
            {formErrors.linkedinUrl && <div className={validationStyles.errorText}>{formErrors.linkedinUrl}</div>}
          </div>

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

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Saving Profile..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
