import { useState, useEffect, useRef } from 'react';
import styles from './UserProfile.module.css';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import ChangePasswordModal from './ChangePasswordModal';
import { MEDIA_BASE_URL, API_BASE_URL } from '../../config';

// Move defaultAvailability outside the component since it's a constant
const DEFAULT_AVAILABILITY = {
  Monday: { available: false, start_time: '09:00', end_time: '17:00' },
  Tuesday: { available: false, start_time: '09:00', end_time: '17:00' },
  Wednesday: { available: false, start_time: '09:00', end_time: '17:00' },
  Thursday: { available: false, start_time: '09:00', end_time: '17:00' },
  Friday: { available: false, start_time: '09:00', end_time: '17:00' },
  Saturday: { available: false, start_time: '09:00', end_time: '17:00' },
  Sunday: { available: false, start_time: '09:00', end_time: '17:00' }
};

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");

  const experienceOptions = [
    { label: "1-3 years", value: "1-3" },
    { label: "4-6 years", value: "4-6" },
    { label: "7-10 years", value: "7-10" },
    { label: "10+ years", value: "10+" }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching user profile...');
        const data = await getUserProfile();
        console.log('Received profile data:', data);
        
        // Transform availability data from array to object format
        let transformedAvailability = { ...DEFAULT_AVAILABILITY };
        if (Array.isArray(data.availability)) {
          data.availability.forEach(slot => {
            transformedAvailability[slot.day_of_week] = {
              available: true,
              start_time: slot.start_time,
              end_time: slot.end_time
            };
          });
        }
        
        // Transform the data to match the component's state structure
        const transformedData = {
          ...data,
          user: data.user || {},
          skills: Array.isArray(data.skills) ? data.skills.map(skill => ({
            skill_id: skill.id,
            skill_name: skill.skill_name
          })) : [],
          availability: transformedAvailability,
          profile_image: data.profile_image ? `${MEDIA_BASE_URL}${data.profile_image}` : null,
          experience_years: data.experience_years || "1-3",
          designation: data.designation || '',
          company: data.company || '',
          hourly_rate: data.hourly_rate || '',
          bio: data.bio || '',
          location: data.location || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          website: data.website || ''
        };

        console.log('Transformed profile data:', transformedData);
        setProfile(transformedData);
        setEditedProfile(transformedData);
        setImagePreview(transformedData.profile_image);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/skills/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setAvailableSkills(data);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };

    fetchSkills();
  }, []);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setImagePreview(profile.profile_image);
    setEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  const handleImageFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should be less than 5MB');
      return;
    }

    setImageError(null);
    setEditedProfile(prev => ({
      ...prev,
      profile_image: file
    }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleAvailabilityChange = (day, field, value) => {
    setEditedProfile(prev => ({
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

  const renderAvailability = () => {
    if (!profile?.availability) {
      return <p>No availability specified</p>;
    }

    if (editing) {
      return (
        <div className={styles.availabilityGrid}>
          {Object.entries(editedProfile.availability).map(([day, times]) => (
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
      );
    }

    // Display mode - show only available days with their times
    const availableDays = Object.entries(profile.availability)
      .filter(([_, times]) => times.available);

    if (availableDays.length === 0) {
      return <p>No available time slots</p>;
    }

    return (
      <div className={styles.availabilityDisplay}>
        {availableDays.map(([day, times]) => (
          <div key={day} className={styles.availabilitySlot}>
            <span className={styles.dayName}>{day}</span>
            <span className={styles.timeRange}>
              {times.start_time} - {times.end_time}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Handle nested fields (e.g., user.first_name)
      const [parent, child] = name.split('.');
      setEditedProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle experience_years specially
      if (name === 'experience_years') {
        const selectedOption = experienceOptions.find(opt => opt.value === value);
        setEditedProfile(prev => ({
          ...prev,
          [name]: selectedOption ? selectedOption.value : "1-3"
        }));
      } else {
        setEditedProfile(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleAddSkill = () => {
    if (selectedSkill && !editedProfile.skills.some(s => s.skill_id === selectedSkill)) {
      const skillObject = availableSkills.find(skill => skill.skill_name === selectedSkill);
      if (skillObject) {
        const newSkill = {
          skill_id: skillObject.id,  // Use id from the backend as skill_id
          skill_name: skillObject.skill_name
        };
      setEditedProfile(prev => ({
        ...prev,
          skills: [...prev.skills, newSkill]
        }));
        setSelectedSkill("");
      }
    }
  };

  const handleRemoveSkill = (skillId) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.skill_id !== skillId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      console.log('Preparing profile update:', editedProfile);

      // Create FormData object
      const formData = new FormData();

      // Add profile image if it's a File object
      if (editedProfile.profile_image instanceof File) {
        formData.append('profile_image', editedProfile.profile_image);
      }

      // Add basic fields
      const basicFields = ['bio', 'location', 'linkedin_url', 'github_url', 'website'];
      basicFields.forEach(field => {
        if (editedProfile[field] !== undefined) {
          formData.append(field, editedProfile[field] || '');
        }
      });

      // Add mentor-specific fields if user is a mentor
      if (profile.user?.user_type === 'mentor') {
        const mentorFields = {
          designation: editedProfile.designation || '',
          company: editedProfile.company || '',
          experience_years: editedProfile.experience_years || '',
          hourly_rate: editedProfile.hourly_rate || '0'
        };

        Object.entries(mentorFields).forEach(([key, value]) => {
          formData.append(key, value);
        });

        // Handle availability
        if (editedProfile.availability) {
          formData.append('availability', JSON.stringify(editedProfile.availability));
        }
      }

      // Handle skills - send only skill IDs
      if (editedProfile.skills && editedProfile.skills.length > 0) {
        const skillIds = editedProfile.skills.map(skill => skill.skill_id);
        formData.append('skills', JSON.stringify(skillIds));
      } else {
        formData.append('skills', JSON.stringify([]));  // Send empty array if no skills
      }

      // Add user data
      if (editedProfile.user) {
        const userData = {
          first_name: editedProfile.user.first_name || '',
          last_name: editedProfile.user.last_name || '',
          email: editedProfile.user.email || ''
        };
        formData.append('user_data', JSON.stringify(userData));
      }

      // Debug: Log FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Update the profile
      await updateUserProfile(formData);
      
      // Immediately fetch the updated profile data
      const updatedProfileData = await getUserProfile();
      console.log('Fetched updated profile:', updatedProfileData);
      
      // Transform the data to match the component's state structure
      const transformedProfile = {
        ...updatedProfileData,
        user: updatedProfileData.user || {},
        skills: Array.isArray(updatedProfileData.skills) ? updatedProfileData.skills.map(skill => ({
          skill_id: skill.id,
          skill_name: skill.skill_name
        })) : [],
        availability: updatedProfileData.availability || DEFAULT_AVAILABILITY,
        profile_image: updatedProfileData.profile_image ? `${MEDIA_BASE_URL}${updatedProfileData.profile_image}` : null,
        experience_years: updatedProfileData.experience_years || "1-3",
        designation: updatedProfileData.designation || '',
        company: updatedProfileData.company || '',
        hourly_rate: updatedProfileData.hourly_rate || '',
        bio: updatedProfileData.bio || '',
        location: updatedProfileData.location || '',
        linkedin_url: updatedProfileData.linkedin_url || '',
        github_url: updatedProfileData.github_url || '',
        website: updatedProfileData.website || ''
      };
      
      console.log('Setting transformed profile:', transformedProfile);
      
      // Update both profile and editedProfile states
      setProfile(transformedProfile);
      setEditedProfile(transformedProfile);
      setImagePreview(transformedProfile.profile_image);
      setEditing(false);

      // Show success message
      alert('Profile updated successfully!');

      // Use window.location to ensure a clean state
      window.location.href = '/profile';
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    }
  };

  if (loading) return <div className={styles.loading}>Loading profile...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!profile) return <div className={styles.error}>Profile not found</div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div className={styles.profileImageSection}>
          <div 
            className={`${styles.profileImageUpload} ${isDragging ? styles.dragging : ''}`}
            onClick={editing ? triggerFileInput : undefined}
            onDragOver={editing ? handleDragOver : undefined}
            onDragLeave={editing ? handleDragLeave : undefined}
            onDrop={editing ? handleDrop : undefined}
            style={{
              backgroundImage: `url(${imagePreview || '/placeholder.svg'})`,
              cursor: editing ? 'pointer' : 'default'
            }}
          >
            {editing && (
              <div className={styles.imageOverlay}>
                <span className={styles.uploadText}>Click or drag to upload</span>
                <span className={styles.uploadSubtext}>Max size: 5MB</span>
              </div>
            )}
            {!editing && !imagePreview && <span>No Photo</span>}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            hidden
          />
          {imageError && <div className={styles.imageError}>{imageError}</div>}
        </div>
        <div className={styles.headerContent}>
        <h1>Profile Settings</h1>
        <div className={styles.actions}>
          {!editing && (
            <>
              <button onClick={handleEdit} className={styles.editButton}>
                Edit Profile
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)} 
                className={styles.changePasswordButton}
              >
                Change Password
              </button>
            </>
          )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.profileForm}>
        <div className={styles.formSection}>
          <h2>Personal Information</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                name="user.first_name"
                value={editedProfile.user.first_name || ''}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                name="user.last_name"
                value={editedProfile.user.last_name || ''}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                name="user.email"
                value={editedProfile.user.email || ''}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Profile Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Bio</label>
              <textarea
                name="bio"
                value={editedProfile.bio || ''}
                onChange={handleChange}
                disabled={!editing}
                rows={4}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={editedProfile.location || ''}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
            {profile.user?.user_type === 'mentor' && (
              <>
                <div className={styles.formGroup}>
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={editedProfile.designation || ''}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Company</label>
                  <input
                    type="text"
                    name="company"
                    value={editedProfile.company || ''}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Experience</label>
                  {editing ? (
                    <select
                      name="experience_years"
                      value={editedProfile.experience_years || "1-3"}
                      onChange={handleChange}
                      className={styles.select}
                    >
                      {experienceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editedProfile.experience_years ? 
                        experienceOptions.find(opt => opt.value === editedProfile.experience_years)?.label || 
                        `${editedProfile.experience_years} years` : 
                        'Not specified'}
                      disabled
                    />
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Hourly Rate (₹)</label>
                  <input
                    type="number"
                    name="hourly_rate"
                    value={editedProfile.hourly_rate || ''}
                    onChange={handleChange}
                    disabled
                    step="1"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Social Links</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>LinkedIn URL</label>
              <input
                type="url"
                name="linkedin_url"
                value={editedProfile.linkedin_url || ''}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
            <div className={styles.formGroup}>
              <label>GitHub URL</label>
              <input
                type="url"
                name="github_url"
                value={editedProfile.github_url || ''}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={editedProfile.website || ''}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
          </div>
        </div>

        {profile.user?.user_type === 'mentor' && (
          <>
            <div className={styles.formSection}>
              <h2>Skills</h2>
              {editing ? (
                <div className={styles.formGroup}>
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

                  {editedProfile.skills.length > 0 && (
                    <div className={styles.selectedSkills}>
                      <div className={styles.skillTags}>
                        {editedProfile.skills.map(skill => (
                          <span key={skill.skill_id} className={styles.selectedSkill}>
                            {skill.skill_name}
                            <button 
                              type="button" 
                              className={styles.removeSkill}
                              onClick={() => handleRemoveSkill(skill.skill_id)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.skillTags}>
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map(skill => (
                      <span key={skill.skill_id} className={styles.selectedSkill}>
                        {skill.skill_name}
                      </span>
                    ))
                  ) : (
                    <p>No skills specified</p>
                  )}
                </div>
              )}
            </div>

            <div className={styles.formSection}>
              <h2>Availability</h2>
              {renderAvailability()}
            </div>
          </>
        )}

        {profile.user?.user_type === 'mentee' && (
          <div className={styles.formSection}>
            <h2>Skills to Learn</h2>
            {editing ? (
              <div className={styles.formGroup}>
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

                {editedProfile.skills.length > 0 && (
                  <div className={styles.selectedSkills}>
                    <div className={styles.skillTags}>
                      {editedProfile.skills.map(skill => (
                        <span key={skill.skill_id} className={styles.selectedSkill}>
                          {skill.skill_name}
                          <button 
                            type="button" 
                            className={styles.removeSkill}
                            onClick={() => handleRemoveSkill(skill.skill_id)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.skillTags}>
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map(skill => (
                    <span key={skill.skill_id} className={styles.selectedSkill}>
                      {skill.skill_name}
                    </span>
                  ))
                ) : (
                  <p>No skills specified</p>
                )}
              </div>
            )}
          </div>
        )}

        {editing && (
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      </form>

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
