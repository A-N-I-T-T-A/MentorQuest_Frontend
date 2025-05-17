import { useState } from 'react';
import styles from './ChangePasswordModal.module.css';
import { changePassword } from '../../services/userService';
import validationStyles from '../../styles/validation.module.css';
import { validatePassword } from '../../utils/validations';

const ChangePasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing again
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      old_password: '',
      new_password: '',
      confirm_password: ''
    };

    // Validate current password
    if (!formData.old_password) {
      errors.old_password = 'Current password is required';
      isValid = false;
    }

    // Validate new password
    if (!formData.new_password) {
      errors.new_password = 'New password is required';
      isValid = false;
    } else if (formData.old_password === formData.new_password) {
      errors.new_password = 'New password must be different from current password';
      isValid = false;
    } else if (!validatePassword(formData.new_password)) {
      errors.new_password = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character (e.g., #, @, $, !)';
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your new password';
      isValid = false;
    } else if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    try {
      await changePassword(formData);
      setSuccess('Password changed successfully');
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change password. Please try again.');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Change Password</h2>
        
        {error && <div className={validationStyles.errorText}>{error}</div>}
        {success && <div className={validationStyles.successText}>{success}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Current Password</label>
            <input
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              required
              className={formErrors.old_password ? validationStyles.errorInput : ''}
            />
            {formErrors.old_password && (
              <div className={validationStyles.errorText}>{formErrors.old_password}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label>New Password</label>
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              required
              className={formErrors.new_password ? validationStyles.errorInput : ''}
            />
            {formErrors.new_password && (
              <div className={validationStyles.errorText}>{formErrors.new_password}</div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              className={formErrors.confirm_password ? validationStyles.errorInput : ''}
            />
            {formErrors.confirm_password && (
              <div className={validationStyles.errorText}>{formErrors.confirm_password}</div>
            )}
          </div>
          
          <div className={styles.passwordRequirements}>
            <p>Password requirements:</p>
            <ul>
              <li className={validatePassword(formData.new_password) ? validationStyles.successText : ''}>
                At least 8 characters
              </li>
              <li className={/(?=.*[A-Z])/.test(formData.new_password) ? validationStyles.successText : ''}>
                At least 1 uppercase letter
              </li>
              <li className={/(?=.*[a-z])/.test(formData.new_password) ? validationStyles.successText : ''}>
                At least 1 lowercase letter
              </li>
              <li className={/(?=.*\d)/.test(formData.new_password) ? validationStyles.successText : ''}>
                At least 1 number
              </li>
              <li className={/(?=.*[#@$!%*?&])/.test(formData.new_password) ? validationStyles.successText : ''}>
                At least 1 special character (#, @, $, !, %, *, ?, &)
              </li>
            </ul>
          </div>
          
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
