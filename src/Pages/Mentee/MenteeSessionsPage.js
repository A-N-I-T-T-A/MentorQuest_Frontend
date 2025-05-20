import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../../services/authUtils';
import styles from './MenteeSessionsPage.module.css';
import Sidebar from '../../components/Dashboard/Sidebar';
import FeedbackModal from '../../components/Mentee/FeedbackModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://mentorquest-backend.onrender.com';

const MenteeSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const token = getAuthToken();
            const sessionsData = await axios.get(`${API_URL}/mentorapp/sessions/mentee/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Fetch feedback status for each session
            const sessionsWithFeedback = await Promise.all(
                sessionsData.data.map(async (session) => {
                    try {
                        const feedbackResponse = await axios.get(`${API_URL}/mentorapp/feedback/${session.id}/exists/`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        return {
                            ...session,
                            feedback_given: feedbackResponse.data.exists
                        };
                    } catch (err) {
                        console.error('Error checking feedback:', err);
                        return {
                            ...session,
                            feedback_given: false
                        };
                    }
                })
            );
            
            setSessions(sessionsWithFeedback);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching sessions:', err);
            setError(err.response?.data?.message || 'Failed to load sessions');
            setLoading(false);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatTime = (timeString) => {
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleFeedbackSuccess = () => {
        // Refresh sessions list after successful feedback submission
        fetchSessions();
        setIsFeedbackModalOpen(false);
    };

    return (
        <div className="dashboard">
            <Sidebar userType="mentee" />
            <div className="dashboard-content">
                <div className={styles.container}>
                    <h2 className={styles.title}>
                        <i className="fas fa-calendar"></i> My Sessions
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
                                        <div className={styles.mentorInfo}>
                                            <i className="fas fa-user"></i>
                                            <span>{session.relationship?.mentor?.user?.first_name} {session.relationship?.mentor?.user?.last_name}</span>
                                        </div>
                                        <div className={styles.sessionStatus}>
                                            <span className={`status-badge ${session.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {session.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.sessionActions}>
                                        {session.status === 'Completed' && !session.feedback_given && (
                                            <button
                                                className={`${styles.statusButton} ${styles.feedbackButton}`}
                                                onClick={() => {
                                                    setSelectedSession(session);
                                                    setIsFeedbackModalOpen(true);
                                                }}
                                            >
                                                <i className="fas fa-star"></i> Give Feedback
                                            </button>
                                        )}
                                        {session.status === 'Completed' && session.feedback_given && (
                                            <button
                                                className={`${styles.statusButton} ${styles.feedbackButton} ${styles.disabledButton}`}
                                                disabled
                                            >
                                                <i className="fas fa-star"></i> Feedback Given
                                            </button>
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
            {isFeedbackModalOpen && selectedSession && (
                <FeedbackModal
                    session={selectedSession}
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    onSuccess={handleFeedbackSuccess}
                />
            )}
        </div>
    );
};

export default MenteeSessionsPage;
