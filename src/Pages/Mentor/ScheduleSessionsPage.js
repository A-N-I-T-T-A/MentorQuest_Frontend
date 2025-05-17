import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../services/authUtils';
import styles from './ScheduleSessionsPage.module.css';
import Sidebar from '../../components/Dashboard/Sidebar';
import ScheduleSessionModal from '../../components/Mentor/ScheduleSessionModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001';

const ScheduleSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = getAuthToken();
            const sessionsData = await axios.get(`${API_URL}/mentorapp/sessions/mentor/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setSessions(sessionsData.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError(err.response?.data?.message || 'Failed to load sessions');
            setLoading(false);
        }
    };

    const updateSessionStatus = async (sessionId, newStatus) => {
        try {
            setLoading(true); // Show loading state while updating
            const token = getAuthToken();
            
            if (newStatus === 'Cancelled') {
                // First update the session status
                await axios.patch(
                    `${API_URL}/mentorapp/sessions/${sessionId}/`, 
                    { 
                        status: newStatus,
                        should_delete_payment: true, // Add flag to indicate payment should be deleted
                        should_notify_mentee: true // Add flag to indicate mentee should be notified
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                // Show success message for cancellation
                alert('Session cancelled successfully. The mentee has been notified and the payment will be refunded.');
            } else {
                // For other status updates, just update the status
                await axios.patch(
                    `${API_URL}/mentorapp/sessions/${sessionId}/`, 
                    { status: newStatus },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            }

            // Refresh the sessions list after update
            await fetchSessions();

        } catch (err) {
            console.error('Error updating session status:', err);
            setError('Failed to update session status');
            alert('Failed to update session status. Please try again.');
        } finally {
            setLoading(false); // Hide loading state after update
        }
    };

    const deleteSession = async (sessionId) => {
        if (!window.confirm('Are you sure you want to delete this session?')) {
            return;
        }

        try {
            setLoading(true);
            const token = getAuthToken();
            await axios.delete(`${API_URL}/mentorapp/sessions/${sessionId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success('Session deleted successfully');
            await fetchSessions(); // Refresh the sessions list
        } catch (err) {
            console.error('Error deleting session:', err);
            toast.error('Failed to delete session');
        } finally {
            setLoading(false);
        }
    };

    const getSessionStatusClass = (status) => {
        const statusMap = {
            'Pending': 'warning',
            'Scheduled': 'success',
            'Completed': 'success',
            'Cancelled': 'danger',
            'No-show': 'danger'
        };
        return statusMap[status] || 'info';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatTime = (timeString) => {
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleScheduleSuccess = () => {
        // Refresh sessions list after successful scheduling
        fetchSessions();
    };

    return (
        <div className="dashboard">
            <Sidebar userType="mentor" />
            <div className="dashboard-content">
                <div className={styles.container}>
                    <h2 className={styles.title}>
                        <i className="fas fa-calendar"></i> Scheduled Sessions
                    </h2>

                    {loading ? (
                        <div className={styles.loading}>Loading sessions...</div>
                    ) : error ? (
                        <div className={styles.error}>{error}</div>
                    ) : sessions.length === 0 ? (
                        <div className={styles.noSessions}>
                            No sessions scheduled yet
                        </div>
                    ) : (
                        <div className={styles.sessionsList}>
                            {sessions.map(session => (
                                <div key={session.id} className={styles.sessionCard}>
                                    <div className={styles.sessionHeader}>
                                        <div className={styles.sessionDate}>
                                            {formatDate(session.session_date)}
                                        </div>
                                        <div className={styles.sessionTime}>
                                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                        </div>
                                    </div>
                                    <div className={styles.sessionDetails}>
                                        <div className={styles.menteeInfo}>
                                            <i className="fas fa-user"></i>
                                            <span>{session.relationship?.mentee?.user?.first_name} {session.relationship?.mentee?.user?.last_name}</span>
                                        </div>
                                        <div className={styles.sessionStatus}>
                                            <span className={`badge badge-${getSessionStatusClass(session.status)}`}>
                                                {session.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.sessionActions}>
                                        {session.status === 'Pending' && (
                                            <button
                                                className={`${styles.statusButton} ${styles.scheduledButton}`}
                                                onClick={() => {
                                                    setSelectedSession(session);
                                                    setIsScheduleModalOpen(true);
                                                }}
                                            >
                                                <i className="fas fa-check"></i> Schedule
                                            </button>
                                        )}
                                        {session.status === 'Scheduled' && (
                                            <>
                                                <button
                                                    className={`${styles.statusButton} ${styles.completedButton}`}
                                                    onClick={() => updateSessionStatus(session.id, 'Completed')}
                                                >
                                                    <i className="fas fa-check-circle"></i> Complete
                                                </button>
                                                <button
                                                    className={`${styles.statusButton} ${styles.cancelledButton}`}
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to cancel this session?')) {
                                                            updateSessionStatus(session.id, 'Cancelled');
                                                        }
                                                    }}
                                                >
                                                    <i className="fas fa-times"></i> Cancel
                                                </button>
                                                <button
                                                    className={`${styles.statusButton} ${styles.noShowButton}`}
                                                    onClick={() => {
                                                        if (window.confirm('Mark this session as No-show?')) {
                                                            updateSessionStatus(session.id, 'No-show');
                                                        }
                                                    }}
                                                >
                                                    <i className="fas fa-exclamation-triangle"></i> No-show
                                                </button>
                                            </>
                                        )}
                                        {['Completed', 'Cancelled', 'No-show'].includes(session.status) && (
                                            <button
                                                className={`${styles.statusButton} ${styles.deleteButton}`}
                                                onClick={() => deleteSession(session.id)}
                                            >
                                                <i className="fas fa-trash"></i> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {isScheduleModalOpen && (
                <ScheduleSessionModal
                    session={selectedSession}
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    onSuccess={handleScheduleSuccess}
                />
            )}
        </div>
    );
};

export default ScheduleSessionsPage;
