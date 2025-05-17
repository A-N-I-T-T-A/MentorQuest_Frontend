import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import styles from './UserManagement.module.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Sidebar from '../../components/Dashboard/Sidebar';
import { FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState({ mentors: [], mentees: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('mentors');
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [hourlyRate, setHourlyRate] = useState('');
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [manualRate, setManualRate] = useState('');

  // Helper to get auto rate from experience
  const getAutoRate = (exp) => {
    if (exp >= 10) return 2000;
    if (exp >= 7) return 1500;
    if (exp >= 4) return 1000;
    if (exp >= 1) return 800;
    return 800;
  };


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        console.log('Users data:', data);
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className={styles.loading}>Loading users...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  const handleSetHourlyRate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/mentorapp/mentors/${selectedMentor.id}/set-hourly-rate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hourly_rate: hourlyRate })
      });

      if (!response.ok) {
        throw new Error('Failed to update hourly rate');
      }

      // Update the mentor's rate in the local state
      setUsers(prev => ({ ...prev, mentors: prev.mentors.map(mentor => 
        mentor.id === selectedMentor.id ? 
        { ...mentor, hourly_rate: hourlyRate } : 
        mentor
      )}));

      toast.success('Hourly rate updated successfully');
      setShowMentorModal(false);
    } catch (error) {
      toast.error('Failed to update hourly rate');
      console.error('Error updating hourly rate:', error);
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar userType="admin" />
      <div className={styles.mainContent}>
        <div className={styles.container}>
          <h1>User Management</h1>
          
          <div className={styles.cards}>
            <div 
              className={`${styles.card} ${activeTab === 'mentors' ? styles.active : ''}`}
              onClick={() => setActiveTab('mentors')}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              <h3>Mentors</h3>
              <p>{users.mentors.length} registered</p>
            </div>
            
            <div 
              className={`${styles.card} ${activeTab === 'mentees' ? styles.active : ''}`}
              onClick={() => setActiveTab('mentees')}
            >
              <i className="fas fa-user-graduate"></i>
              <h3>Mentees</h3>
              <p>{users.mentees.length} registered</p>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {activeTab === 'mentors' ? (
              <div>
                <h3>Mentors</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Experience</th>
                      <th>Hourly Rate (₹)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.mentors.map((mentor) => (
                      <tr key={mentor.id}>
                        <td>{mentor.user.first_name} {mentor.user.last_name}</td>
                        <td>{mentor.user.email}</td>
                        <td>{mentor.experience_years}</td>
                        <td>{mentor.hourly_rate || 'N/A'}</td>
                        <td>
                          <button 
                            className={styles.actionButton}
                            onClick={() => navigate(`/mentor-profile/${mentor.id}`)}
                            title="View Profile"
                          >
                            <FaEye />
                          </button>
                          <button 
                            className={styles.setRateButton}
                            onClick={() => {
                              setSelectedMentor(mentor);
                              // Prefer mentor.hourly_rate, else use auto rate
                              setHourlyRate(mentor.hourly_rate || getAutoRate(mentor.experience_years));
                              setManualRate(mentor.hourly_rate || '');
                              setIsEditingRate(false);
                              setShowMentorModal(true);
                            }}
                            title="Set Rate"
                          >
                            Set Rate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <h3>Mentees</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Experience Level</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.mentees.map((mentee) => (
                      <tr key={mentee.id}>
                        <td>{mentee.user.first_name} {mentee.user.last_name}</td>
                        <td>{mentee.user.email}</td>
                        <td>{mentee.experience_level}</td>
                        <td>{mentee.location}</td>
                        <td>
                          <button 
                            className={styles.actionButton}
                            onClick={() => navigate(`/mentee-profile/${mentee.id}`)}
                            title="View Profile"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {showMentorModal && selectedMentor && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Set Hourly Rate for {selectedMentor.user.first_name} {selectedMentor.user.last_name}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowMentorModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Experience (years)</label>
                <div className={styles.readOnlyField}>{selectedMentor.experience_years}</div>
              </div>
              <div className={styles.formGroup}>
                <label>Hourly Rate</label>
                {isEditingRate ? (
                  <div className={styles.rateEditGroup}>
                    <input
                      type="number"
                      value={manualRate}
                      onChange={e => setManualRate(e.target.value)}
                      className={styles.rateInput}
                      min={0}
                    />
                    <button
                      className={styles.rateEditButton}
                      onClick={() => {
                        setHourlyRate(manualRate);
                        setIsEditingRate(false);
                      }}
                    >Save</button>
                    <button
                      className={styles.cancelButton}
                      onClick={() => {
                        setManualRate(hourlyRate);
                        setIsEditingRate(false);
                      }}
                    >Cancel</button>
                    <span className={styles.rateHint}>(Auto: ₹{getAutoRate(selectedMentor.experience_years)})</span>
                  </div>
                ) : (
                  <div className={styles.rateEditGroup}>
                    <span className={styles.readOnlyField}>₹{hourlyRate} <span style={{ color: '#888', fontSize: '0.9em' }}>/hour</span></span>
                    <button
                      className={styles.rateEditButton}
                      onClick={() => {
                        setIsEditingRate(true);
                        setManualRate(hourlyRate);
                      }}
                    >Edit</button>
                    <span className={styles.rateHint}>(Auto: ₹{getAutoRate(selectedMentor.experience_years)})</span>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.saveButton}
                onClick={handleSetHourlyRate}
              >
                Save
              </button>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowMentorModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default UserManagement;
